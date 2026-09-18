package eventcontroller

import (
	"bytes"
	"calendar-backend/internal/controller/event/dto"
	eventservice "calendar-backend/internal/service/event"
	"fmt"
	"io"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type EventController struct {
	eventService eventservice.EventService
}

func NewEventController(eventService eventservice.EventService) *EventController {
	return &EventController{eventService: eventService}
}

func (h *EventController) CreateEvent(c *gin.Context) {
	var req dto.CreateEventRequest

	// Log the raw request body for debugging
	body, _ := c.GetRawData()
	fmt.Printf("🔍 Raw request body: %s\n", string(body))

	// Reset the request body for binding
	c.Request.Body = io.NopCloser(bytes.NewBuffer(body))

	event, err := req.ProcessRequest(c)
	if err != nil {
		fmt.Printf("❌ Error processing request: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Log the processed event data
	fmt.Printf("🔍 Processed event data: %+v\n", event)
	fmt.Printf("🔍 Family fields - NotifyFamily: %v, NotifyPapa: %v, NotifyMama: %v\n",
		event.NotifyFamily, event.NotifyPapa, event.NotifyMama)
	fmt.Printf("🔍 FamilyMembers: %s\n", event.FamilyMembers)
	fmt.Printf("🔍 SelectedChildren: %s\n", event.SelectedChildren)

	if err := h.eventService.CreateEvent(event); err != nil {
		fmt.Printf("❌ Error creating event: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Printf("✅ Event created successfully with ID: %d\n", event.ID)
	c.JSON(http.StatusCreated, gin.H{
		"message": "Event created successfully",
		"event":   event,
	})
}

func (h *EventController) GetEvents(c *gin.Context) {
	var queryReq dto.GetEventsQueryRequest

	if err := queryReq.ProcessQueryRequest(c); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	events, err := h.eventService.GetEvents(queryReq.ToEventFilter())
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, events)
}

func (h *EventController) GetEvent(c *gin.Context) {
	idStr := c.Param("id")

	// Convert string ID to uint
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	event, err := h.eventService.GetEventByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, event)
}

// UpdateEvent updates an existing event
func (h *EventController) UpdateEvent(c *gin.Context) {
	idStr := c.Param("id")

	// Convert string ID to uint
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	var req dto.UpdateEventRequest

	// Procesar request completo en el DTO
	event, err := req.ProcessRequest(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Use service to update event
	if err := h.eventService.UpdateEvent(uint(id), event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get updated event to return
	updatedEvent, err := h.eventService.GetEventByID(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated event"})
		return
	}

	c.JSON(http.StatusOK, updatedEvent)
}

// DeleteEvent deletes an event
func (h *EventController) DeleteEvent(c *gin.Context) {
	idStr := c.Param("id")

	// Convert string ID to uint
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	// Use service to delete event
	if err := h.eventService.DeleteEvent(uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Event deleted successfully"})
}
