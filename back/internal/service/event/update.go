package eventservice

import (
	"calendar-backend/internal/domain"
	"errors"
	"time"
)

// EventUpdateService maneja la lógica específica de actualización de eventos
type EventUpdateService struct {
	eventRepo domain.EventRepository
}

func NewEventUpdateService(eventRepo domain.EventRepository) *EventUpdateService {
	return &EventUpdateService{
		eventRepo: eventRepo,
	}
}

// UpdateEvent implementa la lógica de negocio para actualizar un evento
func (s *EventUpdateService) UpdateEvent(id uint, event *domain.Event) error {
	// 1. Validar ID
	if id == 0 {
		return errors.New("invalid event ID")
	}

	// 2. Verificar que el evento existe
	existingEvent, err := s.eventRepo.GetByID(id)
	if err != nil {
		return errors.New("event not found")
	}

	// 3. Aplicar validaciones de negocio
	if err := s.validateUpdate(event); err != nil {
		return err
	}

	// 4. Aplicar reglas de negocio
	s.applyUpdateRules(existingEvent, event)

	// 5. Delegar al repositorio
	return s.eventRepo.Update(id, existingEvent)
}

// validateUpdate valida las reglas de negocio para una actualización
func (s *EventUpdateService) validateUpdate(event *domain.Event) error {
	// Validar formato de hora si se proporciona
	if event.Time != "" {
		_, err := time.Parse("15:04", event.Time)
		if err != nil {
			return errors.New("invalid time format, use HH:MM")
		}
	}

	// Validar que la fecha no sea en el pasado (si se actualiza)
	if !event.Date.IsZero() && event.Date.Before(time.Now().Truncate(24*time.Hour)) {
		return errors.New("cannot update events to past dates")
	}

	// Validar email si se proporciona
	if event.Email != "" && len(event.Email) < 5 {
		return errors.New("invalid email format")
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

// applyUpdateRules aplica reglas de negocio para la actualización
func (s *EventUpdateService) applyUpdateRules(existingEvent, newEvent *domain.Event) {
	// Actualizar solo los campos proporcionados
	if newEvent.Title != "" {
		existingEvent.Title = newEvent.Title
	}
	if newEvent.Description != "" {
		existingEvent.Description = newEvent.Description
	}
	if !newEvent.Date.IsZero() {
		existingEvent.Date = newEvent.Date
	}
	if newEvent.Time != "" {
		existingEvent.Time = newEvent.Time
	}
	if newEvent.Location != "" {
		existingEvent.Location = newEvent.Location
	}
	if newEvent.Email != "" {
		existingEvent.Email = newEvent.Email
	}
	if newEvent.Phone != "" {
		existingEvent.Phone = newEvent.Phone
	}
	if newEvent.Color != "" {
		existingEvent.Color = newEvent.Color
	}
	if newEvent.Priority != "" {
		existingEvent.Priority = newEvent.Priority
	}
	if newEvent.Category != "" {
		existingEvent.Category = newEvent.Category
	}

	// Aplicar reglas especiales
	if newEvent.IsAllDay {
		existingEvent.IsAllDay = true
		existingEvent.Time = "" // Limpiar hora si es evento de todo el día
	}

	// Aplicar colores por categoría si se cambia la categoría
	if newEvent.Category != "" && newEvent.Category != existingEvent.Category {
		s.applyCategoryColors(existingEvent)
	}
}

// applyCategoryColors aplica colores automáticos por categoría
func (s *EventUpdateService) applyCategoryColors(event *domain.Event) {
	categoryColors := map[string]string{
		"work":     "#FF3B30", // Rojo
		"personal": "#007AFF", // Azul
		"health":   "#34C759", // Verde
		"family":   "#FF9500", // Naranja
		"travel":   "#5856D6", // Púrpura
		"meeting":  "#FF2D92", // Rosa
	}

	if color, exists := categoryColors[event.Category]; exists {
		event.Color = color
	}
}
