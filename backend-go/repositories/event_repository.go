package repositories

import (
	"calendar-backend/models"
	"time"

	"gorm.io/gorm"
)

type EventRepository interface {
	Create(event *models.Event) error
	GetByID(id uint) (*models.Event, error)
	GetAll() ([]models.Event, error)
	GetByDate(date string) ([]models.Event, error)
	Update(id uint, event *models.Event) error
	Delete(id uint) error
	GetTodayEvents() ([]models.Event, error)
	GetUpcomingEvents() ([]models.Event, error)
	GetEventsForDateRange(startDate, endDate string) ([]models.Event, error)
	GetEventsByDateRange(startDate, endDate time.Time) ([]*models.Event, error)
	SearchEvents(query string) ([]models.Event, error)
	GetEventStats() (map[string]interface{}, error)
}

type eventRepository struct {
	db *gorm.DB
}

func NewEventRepository(db *gorm.DB) EventRepository {
	return &eventRepository{db: db}
}

func (r *eventRepository) Create(event *models.Event) error {
	return r.db.Create(event).Error
}

func (r *eventRepository) GetByID(id uint) (*models.Event, error) {
	var event models.Event
	err := r.db.First(&event, id).Error
	if err != nil {
		return nil, err
	}
	return &event, nil
}

func (r *eventRepository) GetAll() ([]models.Event, error) {
	var events []models.Event
	err := r.db.Order("date ASC, time ASC").Find(&events).Error
	return events, err
}

func (r *eventRepository) GetByDate(date string) ([]models.Event, error) {
	var events []models.Event
	err := r.db.Where("date = ?", date).Order("time ASC").Find(&events).Error
	return events, err
}

func (r *eventRepository) Update(id uint, event *models.Event) error {
	return r.db.Model(&models.Event{}).Where("id = ?", id).Updates(event).Error
}

func (r *eventRepository) Delete(id uint) error {
	return r.db.Delete(&models.Event{}, id).Error
}

func (r *eventRepository) GetTodayEvents() ([]models.Event, error) {
	today := time.Now().Format("2006-01-02")
	var events []models.Event
	err := r.db.Where("date = ?", today).Order("time ASC").Find(&events).Error
	return events, err
}

func (r *eventRepository) GetUpcomingEvents() ([]models.Event, error) {
	today := time.Now().Format("2006-01-02")
	var events []models.Event
	err := r.db.Where("date >= ?", today).Order("date ASC, time ASC").Limit(10).Find(&events).Error
	return events, err
}

func (r *eventRepository) GetEventsForDateRange(startDate, endDate string) ([]models.Event, error) {
	var events []models.Event
	err := r.db.Where("date BETWEEN ? AND ?", startDate, endDate).Order("date ASC, time ASC").Find(&events).Error
	return events, err
}

func (r *eventRepository) SearchEvents(query string) ([]models.Event, error) {
	var events []models.Event
	err := r.db.Where("title ILIKE ? OR description ILIKE ?", "%"+query+"%", "%"+query+"%").Order("date ASC, time ASC").Find(&events).Error
	return events, err
}

func (r *eventRepository) GetEventStats() (map[string]interface{}, error) {
	var totalEvents int64
	var todayEvents int64
	var upcomingEvents int64

	today := time.Now().Format("2006-01-02")

	// Total events
	r.db.Model(&models.Event{}).Count(&totalEvents)

	// Today's events
	r.db.Model(&models.Event{}).Where("date = ?", today).Count(&todayEvents)

	// Upcoming events
	r.db.Model(&models.Event{}).Where("date >= ?", today).Count(&upcomingEvents)

	stats := map[string]interface{}{
		"total_events":    totalEvents,
		"today_events":    todayEvents,
		"upcoming_events": upcomingEvents,
	}

	return stats, nil
}

// GetEventsByDateRange obtiene eventos en un rango de fechas (para notificaciones)
func (r *eventRepository) GetEventsByDateRange(startDate, endDate time.Time) ([]*models.Event, error) {
	var events []*models.Event
	
	err := r.db.Where("date >= ? AND date < ?", startDate, endDate).Find(&events).Error
	if err != nil {
		return nil, err
	}
	
	return events, nil
}
