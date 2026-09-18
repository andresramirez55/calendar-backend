package domain

import "time"

// EventRepository is the persistence port required by the application layer.
// Implementations live in infrastructure; business services depend only on this contract.
type EventRepository interface {
	Create(event *Event) error
	GetByID(id uint) (*Event, error)
	GetAll() ([]Event, error)
	GetByDate(date string) ([]Event, error)
	Update(id uint, event *Event) error
	Delete(id uint) error
	GetTodayEvents() ([]Event, error)
	GetUpcomingEvents(limit int) ([]Event, error)
	GetEventsForDateRange(startDate, endDate string) ([]Event, error)
	GetEventsByDateRange(startDate, endDate time.Time) ([]*Event, error)
	SearchEvents(query string) ([]Event, error)
	GetEventStats() (map[string]interface{}, error)
}

// EventFilter is an application-level query. HTTP DTOs are mapped to it by controllers.
type EventFilter struct {
	Date      string
	StartDate string
	EndDate   string
	Search    string
}
