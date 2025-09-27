package dto

import (
	"calendar-backend/models"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// CreateEventRequest DTO para la creación de eventos
type CreateEventRequest struct {
	Title             string `json:"title" binding:"required" validate:"min=1,max=100"`
	Description       string `json:"description" validate:"max=500"`
	Date              string `json:"date" binding:"required" validate:"date_format"`
	Time              string `json:"time" validate:"time_format"`
	Location          string `json:"location" validate:"max=200"`
	Email             string `json:"email" binding:"required,email" validate:"email"`
	Phone             string `json:"phone" binding:"required" validate:"min=10,max=20"`
	ReminderDay       bool   `json:"reminder_day"`
	ReminderDayBefore bool   `json:"reminder_day_before"`
	IsAllDay          bool   `json:"is_all_day"`
	Color             string `json:"color" validate:"hexcolor"`
	Priority          string `json:"priority" validate:"oneof=low medium high"`
	Category          string `json:"category" validate:"max=50"`
	// Campos de notificación familiar
	NotifyFamily     bool   `json:"notify_family"`
	NotifyPapa       bool   `json:"notify_papa"`
	NotifyMama       bool   `json:"notify_mama"`
	ChildTag         string `json:"child_tag"`
	SelectedChildren string `json:"selected_children"`
	FamilyMembers    string `json:"family_members"`
}

// ToEvent convierte el DTO a un modelo Event
func (req *CreateEventRequest) ToEvent() (*models.Event, error) {
	// Validar y parsear fecha
	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		return nil, errors.New("invalid date format, use YYYY-MM-DD")
	}

	// Validar formato de hora si no es evento de todo el día
	if !req.IsAllDay && req.Time != "" {
		_, err := time.Parse("15:04", req.Time)
		if err != nil {
			return nil, errors.New("invalid time format, use HH:MM")
		}
	}

	// Validar que la fecha no sea en el pasado
	if date.Before(time.Now().Truncate(24 * time.Hour)) {
		return nil, errors.New("cannot create events in the past")
	}

	// Aplicar valores por defecto
	if req.Color == "" {
		req.Color = "#007AFF"
	}
	if req.Priority == "" {
		req.Priority = "medium"
	}

	// Si es evento de todo el día, limpiar la hora
	time := req.Time
	if req.IsAllDay {
		time = ""
	}

	// Aplicar colores por categoría
	req.applyCategoryColors()

	// Configurar recordatorios por defecto
	reminderDay := req.ReminderDay
	reminderDayBefore := req.ReminderDayBefore
	if !reminderDay && !reminderDayBefore {
		reminderDay = true
		reminderDayBefore = true
	}

	return &models.Event{
		Title:             req.Title,
		Description:       req.Description,
		Date:              date,
		Time:              time,
		Location:          req.Location,
		Email:             req.Email,
		Phone:             req.Phone,
		ReminderDay:       reminderDay,
		ReminderDayBefore: reminderDayBefore,
		IsAllDay:          req.IsAllDay,
		Color:             req.Color,
		Priority:          req.Priority,
		Category:          req.Category,
		NotifyFamily:      req.NotifyFamily,
		NotifyPapa:        req.NotifyPapa,
		NotifyMama:        req.NotifyMama,
		ChildTag:          req.ChildTag,
		SelectedChildren:  req.SelectedChildren,
		FamilyMembers:     req.FamilyMembers,
	}, nil
}

// Validate realiza validaciones adicionales del DTO
func (req *CreateEventRequest) Validate() error {
	// Validar título
	if len(req.Title) == 0 {
		return errors.New("title is required")
	}
	if len(req.Title) > 100 {
		return errors.New("title must be less than 100 characters")
	}

	// Validar descripción
	if len(req.Description) > 500 {
		return errors.New("description must be less than 500 characters")
	}

	// Validar email
	if req.Email == "" {
		return errors.New("email is required")
	}
	if len(req.Email) < 5 {
		return errors.New("invalid email format")
	}

	// Validar teléfono
	if req.Phone == "" {
		return errors.New("phone is required")
	}
	if len(req.Phone) < 10 || len(req.Phone) > 20 {
		return errors.New("phone must be between 10 and 20 characters")
	}

	// Validar prioridad
	validPriorities := []string{"low", "medium", "high"}
	if req.Priority != "" {
		valid := false
		for _, p := range validPriorities {
			if req.Priority == p {
				valid = true
				break
			}
		}
		if !valid {
			return errors.New("invalid priority, must be: low, medium, or high")
		}
	}

	// Validar categoría
	if len(req.Category) > 50 {
		return errors.New("category must be less than 50 characters")
	}

	// Validar ubicación
	if len(req.Location) > 200 {
		return errors.New("location must be less than 200 characters")
	}

	return nil
}

// applyCategoryColors aplica colores automáticos por categoría
func (req *CreateEventRequest) applyCategoryColors() {
	categoryColors := map[string]string{
		"work":     "#FF3B30", // Rojo
		"personal": "#007AFF", // Azul
		"health":   "#34C759", // Verde
		"family":   "#FF9500", // Naranja
		"travel":   "#5856D6", // Púrpura
		"meeting":  "#FF2D92", // Rosa
	}

	if color, exists := categoryColors[req.Category]; exists && req.Color == "#007AFF" {
		req.Color = color
	}
}

func (req *CreateEventRequest) Sanitize() {
	req.Title = strings.TrimSpace(req.Title)
	req.Description = strings.TrimSpace(req.Description)
	req.Location = strings.TrimSpace(req.Location)
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Phone = strings.TrimSpace(req.Phone)
	req.Category = strings.TrimSpace(strings.ToLower(req.Category))

	if req.Priority != "" {
		req.Priority = strings.ToLower(req.Priority)
	}
}

func (req *CreateEventRequest) ProcessRequest(c *gin.Context) (*models.Event, error) {
	if err := c.ShouldBindJSON(req); err != nil {
		fmt.Printf("❌ Error binding JSON: %v\n", err)
		return nil, err
	}

	// Log the bound request data
	fmt.Printf("🔍 Bound request data: %+v\n", req)
	fmt.Printf("🔍 Family fields in request - NotifyFamily: %v, NotifyPapa: %v, NotifyMama: %v\n",
		req.NotifyFamily, req.NotifyPapa, req.NotifyMama)
	fmt.Printf("🔍 FamilyMembers in request: %s\n", req.FamilyMembers)
	fmt.Printf("🔍 SelectedChildren in request: %s\n", req.SelectedChildren)

	req.Sanitize()

	if err := req.Validate(); err != nil {
		fmt.Printf("❌ Validation error: %v\n", err)
		return nil, err
	}

	event, err := req.ToEvent()
	if err != nil {
		fmt.Printf("❌ Error converting to event: %v\n", err)
		return nil, err
	}

	fmt.Printf("🔍 Converted event: %+v\n", event)
	return event, nil
}
