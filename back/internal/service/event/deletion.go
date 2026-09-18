package eventservice

import (
	"calendar-backend/internal/domain"
	"errors"
)

// EventDeletionService maneja la lógica específica de eliminación de eventos
type EventDeletionService struct {
	eventRepo domain.EventRepository
}

func NewEventDeletionService(eventRepo domain.EventRepository) *EventDeletionService {
	return &EventDeletionService{
		eventRepo: eventRepo,
	}
}

// DeleteEvent implementa la lógica de negocio para eliminar un evento
func (s *EventDeletionService) DeleteEvent(id uint) error {
	// 1. Validar ID
	if id == 0 {
		return errors.New("invalid event ID")
	}

	// 2. Verificar que el evento existe
	_, err := s.eventRepo.GetByID(id)
	if err != nil {
		return errors.New("event not found")
	}

	// 3. Aplicar reglas de negocio (ej: no permitir eliminar eventos del pasado)
	// Aquí podrías agregar lógica como:
	// - No permitir eliminar eventos que ya pasaron
	// - Requerir confirmación para eventos importantes
	// - Enviar notificaciones de cancelación

	// 4. Delegar al repositorio
	return s.eventRepo.Delete(id)
}

// SoftDeleteEvent implementa eliminación lógica (marcar como eliminado)
func (s *EventDeletionService) SoftDeleteEvent(id uint) error {
	// 1. Validar ID
	if id == 0 {
		return errors.New("invalid event ID")
	}

	// 2. Verificar que el evento existe
	_, err := s.eventRepo.GetByID(id)
	if err != nil {
		return errors.New("event not found")
	}

	// 3. Aplicar reglas de negocio
	// Aquí podrías agregar lógica como:
	// - Enviar notificaciones de cancelación
	// - Actualizar estadísticas
	// - Registrar la eliminación en logs

	// 4. Delegar al repositorio (GORM maneja soft delete automáticamente)
	return s.eventRepo.Delete(id)
}
