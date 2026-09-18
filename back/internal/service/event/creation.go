package eventservice

import (
	"calendar-backend/internal/domain"
	"errors"
	"time"
)

// EventCreationService maneja la lógica específica de creación de eventos
type EventCreationService struct {
	eventRepo domain.EventRepository
}

func NewEventCreationService(eventRepo domain.EventRepository) *EventCreationService {
	return &EventCreationService{
		eventRepo: eventRepo,
	}
}

// CreateEvent implementa la lógica de negocio para crear un evento
func (s *EventCreationService) CreateEvent(event *domain.Event) error {
	if err := s.validateEvent(event); err != nil {
		return err
	}

	s.applyBusinessRules(event)

	return s.eventRepo.Create(event)
}

// validateEvent valida las reglas de negocio para un evento
func (s *EventCreationService) validateEvent(event *domain.Event) error {
	// Validaciones básicas
	if event.Title == "" {
		return errors.New("title is required")
	}
	if event.Date.IsZero() {
		return errors.New("date is required")
	}
	// Validar formato de hora solo si no es evento de todo el día
	if !event.IsAllDay {
		if event.Time == "" {
			return errors.New("time is required for non-all-day events")
		}

		// Validar formato de hora
		_, err := time.Parse("15:04", event.Time)
		if err != nil {
			return errors.New("invalid time format, use HH:MM")
		}
	}

	// Validar que la fecha no sea en el pasado (opcional)
	if event.Date.Before(time.Now().Truncate(24 * time.Hour)) {
		return errors.New("cannot create events in the past")
	}

	// Validar email si se proporciona
	if event.Email != "" {
		// Aquí podrías agregar validación de email más robusta
		if len(event.Email) < 5 {
			return errors.New("invalid email format")
		}
	}

	// Validar prioridad
	validPriorities := []string{"low", "medium", "high"}
	if event.Priority != "" {
		valid := false
		for _, p := range validPriorities {
			if event.Priority == p {
				valid = true
				break
			}
		}
		if !valid {
			return errors.New("invalid priority, must be: low, medium, or high")
		}
	}

	return nil
}

// applyBusinessRules aplica reglas de negocio automáticas
func (s *EventCreationService) applyBusinessRules(event *domain.Event) {
	// Establecer valores por defecto
	if event.Color == "" {
		event.Color = "#007AFF"
	}
	if event.Priority == "" {
		event.Priority = "medium"
	}

	// Si es evento de todo el día, limpiar la hora
	if event.IsAllDay {
		event.Time = ""
	}

	// Aplicar colores por categoría
	s.applyCategoryColors(event)

	// Configurar recordatorios por defecto
	if !event.ReminderDay && !event.ReminderDayBefore {
		event.ReminderDay = true
		event.ReminderDayBefore = true
	}
}

// applyCategoryColors aplica colores automáticos por categoría
func (s *EventCreationService) applyCategoryColors(event *domain.Event) {
	categoryColors := map[string]string{
		"work":     "#FF3B30", // Rojo
		"personal": "#007AFF", // Azul
		"health":   "#34C759", // Verde
		"family":   "#FF9500", // Naranja
		"travel":   "#5856D6", // Púrpura
		"meeting":  "#FF2D92", // Rosa
	}

	if color, exists := categoryColors[event.Category]; exists && event.Color == "#007AFF" {
		event.Color = color
	}
}
