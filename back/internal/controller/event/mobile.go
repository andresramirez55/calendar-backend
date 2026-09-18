package eventcontroller

import (
	"calendar-backend/internal/domain"
	eventservice "calendar-backend/internal/service/event"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// MobileHandler only adapts HTTP requests and responses. All data access goes
// through EventService, just like the regular event controller.
type MobileHandler struct {
	eventService eventservice.EventService
}

func NewMobileHandler(eventService eventservice.EventService) *MobileHandler {
	return &MobileHandler{eventService: eventService}
}

func (h *MobileHandler) GetEventsForDateRange(c *gin.Context) {
	startDate, endDate := c.Query("start_date"), c.Query("end_date")
	if startDate == "" || endDate == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "start_date and end_date are required"})
		return
	}

	events, err := h.eventService.GetEventsForDateRange(startDate, endDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"events":     toMobileResponses(events),
		"count":      len(events),
		"start_date": startDate,
		"end_date":   endDate,
	})
}

func (h *MobileHandler) GetTodayEvents(c *gin.Context) {
	events, err := h.eventService.GetTodayEvents()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch today's events"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"events": toMobileResponses(events),
		"count":  len(events),
		"date":   time.Now().Format("2006-01-02"),
	})
}

func (h *MobileHandler) GetUpcomingEvents(c *gin.Context) {
	limit := 10
	if value := c.Query("limit"); value != "" {
		parsed, err := strconv.Atoi(value)
		if err != nil || parsed <= 0 || parsed > 100 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "limit must be between 1 and 100"})
			return
		}
		limit = parsed
	}

	events, err := h.eventService.GetUpcomingEvents(limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch upcoming events"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"events": toMobileResponses(events), "count": len(events), "limit": limit})
}

func (h *MobileHandler) SearchEvents(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "search query 'q' is required"})
		return
	}

	events, err := h.eventService.SearchEvents(query)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"events": toMobileResponses(events), "count": len(events), "query": query})
}

func (h *MobileHandler) GetEventStats(c *gin.Context) {
	stats, err := h.eventService.GetEventStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch event statistics"})
		return
	}
	c.JSON(http.StatusOK, stats)
}

func toMobileResponses(events []domain.Event) []domain.EventResponse {
	responses := make([]domain.EventResponse, len(events))
	for i := range events {
		responses[i] = events[i].ToResponse()
	}
	return responses
}
