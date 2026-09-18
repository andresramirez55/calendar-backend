package dto

import (
	"calendar-backend/internal/domain"
	"errors"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// UpdateEventRequest DTO para la actualización de eventos
type UpdateEventRequest struct {
	Title             *string `json:"title" validate:"omitempty,min=1,max=100"`
	Description       *string `json:"description" validate:"omitempty,max=500"`
	Date              *string `json:"date" validate:"omitempty,date_format"`
	Time              *string `json:"time" validate:"omitempty,time_format"`
	Location          *string `json:"location" validate:"omitempty,max=200"`
	Email             *string `json:"email" validate:"omitempty,email"`
	Phone             *string `json:"phone" validate:"omitempty,min=10,max=20"`
	ReminderDay       *bool   `json:"reminder_day"`
	ReminderDayBefore *bool   `json:"reminder_day_before"`
	IsAllDay          *bool   `json:"is_all_day"`
	Color             *string `json:"color" validate:"omitempty,hexcolor"`
	Priority          *string `json:"priority" validate:"omitempty,oneof=low medium high"`
	Category          *string `json:"category" validate:"omitempty,max=50"`
}

// ToEvent convierte el DTO a un modelo Event para actualización
func (req *UpdateEventRequest) ToEvent() (*domain.Event, error) {
	event := &domain.Event{}

	// Procesar título
	if req.Title != nil {
		title := strings.TrimSpace(*req.Title)
		if len(title) == 0 {
			return nil, errors.New("title cannot be empty")
		}
		if len(title) > 100 {
			return nil, errors.New("title must be less than 100 characters")
		}
		event.Title = title
	}

	// Procesar descripción
	if req.Description != nil {
		description := strings.TrimSpace(*req.Description)
		if len(description) > 500 {
			return nil, errors.New("description must be less than 500 characters")
		}
		event.Description = description
	}

	// Procesar fecha
	if req.Date != nil {
		date, err := time.Parse("2006-01-02", *req.Date)
		if err != nil {
			return nil, errors.New("invalid date format, use YYYY-MM-DD")
		}
		// Validar que la fecha no sea en el pasado (comparación segura en UTC)
		todayUTC := time.Now().UTC().Truncate(24 * time.Hour)
		eventDateUTC := date.UTC()
		if eventDateUTC.Before(todayUTC) {
			return nil, errors.New("cannot update events to past dates")
		}
		event.Date = date
	}

	// Procesar hora
	if req.Time != nil {
		timeStr := strings.TrimSpace(*req.Time)
		if timeStr != "" {
			_, err := time.Parse("15:04", timeStr)
			if err != nil {
				return nil, errors.New("invalid time format, use HH:MM")
			}
		}
		event.Time = timeStr
	}

	// Procesar ubicación
	if req.Location != nil {
		location := strings.TrimSpace(*req.Location)
		if len(location) > 200 {
			return nil, errors.New("location must be less than 200 characters")
		}
		event.Location = location
	}

	// Procesar email
	if req.Email != nil {
		email := strings.TrimSpace(strings.ToLower(*req.Email))
		if email == "" {
			return nil, errors.New("email cannot be empty")
		}
		if len(email) < 5 {
			return nil, errors.New("invalid email format")
		}
		event.Email = email
	}

	// Procesar teléfono
	if req.Phone != nil {
		phone := strings.TrimSpace(*req.Phone)
		if phone == "" {
			return nil, errors.New("phone cannot be empty")
		}
		if len(phone) < 10 || len(phone) > 20 {
			return nil, errors.New("phone must be between 10 and 20 characters")
		}
		event.Phone = phone
	}

	// Procesar recordatorios
	if req.ReminderDay != nil {
		event.ReminderDay = *req.ReminderDay
	}
	if req.ReminderDayBefore != nil {
		event.ReminderDayBefore = *req.ReminderDayBefore
	}

	// Procesar evento de todo el día
	if req.IsAllDay != nil {
		event.IsAllDay = *req.IsAllDay
		// Si es evento de todo el día, limpiar la hora
		if *req.IsAllDay {
			event.Time = ""
		}
	}

	// Procesar color
	if req.Color != nil {
		color := strings.TrimSpace(*req.Color)
		if color != "" {
			event.Color = color
		}
	}

	// Procesar prioridad
	if req.Priority != nil {
		priority := strings.ToLower(strings.TrimSpace(*req.Priority))
		if priority != "" {
			validPriorities := []string{"low", "medium", "high"}
			valid := false
			for _, p := range validPriorities {
				if priority == p {
					valid = true
					break
				}
			}
			if !valid {
				return nil, errors.New("invalid priority, must be: low, medium, or high")
			}
			event.Priority = priority
		}
	}

	// Procesar categoría
	if req.Category != nil {
		category := strings.TrimSpace(strings.ToLower(*req.Category))
		if len(category) > 50 {
			return nil, errors.New("category must be less than 50 characters")
		}
		event.Category = category
	}

	// Aplicar colores por categoría si se cambia la categoría
	if req.Category != nil && *req.Category != "" {
		req.applyCategoryColors(event)
	}

	return event, nil
}

// Validate realiza validaciones adicionales del DTO
func (req *UpdateEventRequest) Validate() error {
	// Validar que al menos un campo sea proporcionado
	if req.Title == nil && req.Description == nil && req.Date == nil &&
		req.Time == nil && req.Location == nil && req.Email == nil &&
		req.Phone == nil && req.ReminderDay == nil && req.ReminderDayBefore == nil &&
		req.IsAllDay == nil && req.Color == nil && req.Priority == nil && req.Category == nil {
		return errors.New("at least one field must be provided for update")
	}

	return nil
}

// applyCategoryColors aplica colores automáticos por categoría
func (req *UpdateEventRequest) applyCategoryColors(event *domain.Event) {
	categoryColors := map[string]string{
		"work":     "#FF3B30", // Rojo
		"personal": "#007AFF", // Azul
		"health":   "#34C759", // Verde
		"family":   "#FF9500", // Naranja
		"travel":   "#5856D6", // Púrpura
		"meeting":  "#FF2D92", // Rosa
	}

	if req.Category != nil && *req.Category != "" {
		if color, exists := categoryColors[*req.Category]; exists {
			event.Color = color
		}
	}
}

// ProcessRequest maneja todo el proceso: binding, validación y conversión
func (req *UpdateEventRequest) ProcessRequest(c *gin.Context) (*domain.Event, error) {
	// 1. Binding del JSON
	if err := c.ShouldBindJSON(req); err != nil {
		return nil, err
	}

	// 2. Validar datos
	if err := req.Validate(); err != nil {
		return nil, err
	}

	// 3. Convertir a modelo Event
	event, err := req.ToEvent()
	if err != nil {
		return nil, err
	}

	return event, nil
}
