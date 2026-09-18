package eventservice

import (
	"calendar-backend/internal/domain"
	"errors"
	"time"
)

// Interfaces específicas para cada operación
type EventCreator interface {
	CreateEvent(event *domain.Event) error
}

type EventReader interface {
	GetEventByID(id uint) (*domain.Event, error)
	GetAllEvents() ([]domain.Event, error)
	GetEventsByDate(date string) ([]domain.Event, error)
	GetTodayEvents() ([]domain.Event, error)
	GetUpcomingEvents(limit int) ([]domain.Event, error)
	GetEventsForDateRange(startDate, endDate string) ([]domain.Event, error)
	SearchEvents(query string) ([]domain.Event, error)
}

type EventUpdater interface {
	UpdateEvent(id uint, event *domain.Event) error
}

type EventDeleter interface {
	DeleteEvent(id uint) error
}

type EventStatsProvider interface {
	GetEventStats() (map[string]interface{}, error)
}

type EventQueryHandler interface {
	GetEvents(filter domain.EventFilter) ([]domain.Event, error)
}

// Interface principal que combina todas las operaciones
type EventService interface {
	EventCreator
	EventReader
	EventUpdater
	EventDeleter
	EventStatsProvider
	EventQueryHandler
}

type eventService struct {
	eventRepo       domain.EventRepository
	creationService *EventCreationService
	updateService   *EventUpdateService
	deletionService *EventDeletionService
}

func NewEventService(eventRepo domain.EventRepository) EventService {
	return &eventService{
		eventRepo:       eventRepo,
		creationService: NewEventCreationService(eventRepo),
		updateService:   NewEventUpdateService(eventRepo),
		deletionService: NewEventDeletionService(eventRepo),
	}
}

func (s *eventService) CreateEvent(event *domain.Event) error {
	// Delegar al servicio específico de creación
	return s.creationService.CreateEvent(event)
}

func (s *eventService) GetEventByID(id uint) (*domain.Event, error) {
	if id == 0 {
		return nil, errors.New("invalid event ID")
	}
	return s.eventRepo.GetByID(id)
}

func (s *eventService) GetAllEvents() ([]domain.Event, error) {
	return s.eventRepo.GetAll()
}

func (s *eventService) GetEventsByDate(date string) ([]domain.Event, error) {
	// Validar formato de fecha
	_, err := time.Parse("2006-01-02", date)
	if err != nil {
		return nil, errors.New("invalid date format, use YYYY-MM-DD")
	}
	return s.eventRepo.GetByDate(date)
}

func (s *eventService) UpdateEvent(id uint, event *domain.Event) error {
	// Delegar al servicio específico de actualización
	return s.updateService.UpdateEvent(id, event)
}

func (s *eventService) DeleteEvent(id uint) error {
	// Delegar al servicio específico de eliminación
	return s.deletionService.DeleteEvent(id)
}

func (s *eventService) GetTodayEvents() ([]domain.Event, error) {
	return s.eventRepo.GetTodayEvents()
}

func (s *eventService) GetUpcomingEvents(limit int) ([]domain.Event, error) {
	if limit <= 0 {
		limit = 10
	}
	return s.eventRepo.GetUpcomingEvents(limit)
}

func (s *eventService) GetEventsForDateRange(startDate, endDate string) ([]domain.Event, error) {
	// Validar formato de fechas
	_, err := time.Parse("2006-01-02", startDate)
	if err != nil {
		return nil, errors.New("invalid start date format, use YYYY-MM-DD")
	}
	_, err = time.Parse("2006-01-02", endDate)
	if err != nil {
		return nil, errors.New("invalid end date format, use YYYY-MM-DD")
	}
	return s.eventRepo.GetEventsForDateRange(startDate, endDate)
}

func (s *eventService) SearchEvents(query string) ([]domain.Event, error) {
	if query == "" {
		return nil, errors.New("search query is required")
	}
	return s.eventRepo.SearchEvents(query)
}

func (s *eventService) GetEventStats() (map[string]interface{}, error) {
	return s.eventRepo.GetEventStats()
}

// GetEvents maneja la lógica de consulta basada en query parameters
func (s *eventService) GetEvents(filter domain.EventFilter) ([]domain.Event, error) {
	if filter.Search != "" {
		return s.eventRepo.SearchEvents(filter.Search)
	}
	if filter.Date != "" {
		return s.eventRepo.GetByDate(filter.Date)
	}
	if filter.StartDate != "" && filter.EndDate != "" {
		return s.eventRepo.GetEventsForDateRange(filter.StartDate, filter.EndDate)
	}

	// Por defecto, obtener todos los eventos
	return s.eventRepo.GetAll()
}
