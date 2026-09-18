package eventrepository

import (
	"calendar-backend/internal/domain"
	"time"

	"gorm.io/gorm"
)

type eventRepository struct {
	db *gorm.DB
}

func NewEventRepository(db *gorm.DB) domain.EventRepository {
	return &eventRepository{db: db}
}

func (r *eventRepository) Create(event *domain.Event) error {
	return r.db.Create(event).Error
}

func (r *eventRepository) GetByID(id uint) (*domain.Event, error) {
	var event domain.Event
	err := r.db.First(&event, id).Error
	if err != nil {
		return nil, err
	}
	return &event, nil
}

func (r *eventRepository) GetAll() ([]domain.Event, error) {
	var events []domain.Event
	err := r.db.Order("date ASC, time ASC").Find(&events).Error
	return events, err
}

func (r *eventRepository) GetByDate(date string) ([]domain.Event, error) {
	var events []domain.Event
	err := r.db.Where("date = ?", date).Order("time ASC").Find(&events).Error
	return events, err
}

func (r *eventRepository) Update(id uint, event *domain.Event) error {
	return r.db.Model(&domain.Event{}).Where("id = ?", id).Updates(event).Error
}

func (r *eventRepository) Delete(id uint) error {
	return r.db.Delete(&domain.Event{}, id).Error
}

func (r *eventRepository) GetTodayEvents() ([]domain.Event, error) {
	today := time.Now().Format("2006-01-02")
	var events []domain.Event
	err := r.db.Where("date = ?", today).Order("time ASC").Find(&events).Error
	return events, err
}

func (r *eventRepository) GetUpcomingEvents(limit int) ([]domain.Event, error) {
	today := time.Now().Format("2006-01-02")
	var events []domain.Event
	err := r.db.Where("date >= ?", today).Order("date ASC, time ASC").Limit(limit).Find(&events).Error
	return events, err
}

func (r *eventRepository) GetEventsForDateRange(startDate, endDate string) ([]domain.Event, error) {
	var events []domain.Event
	err := r.db.Where("date BETWEEN ? AND ?", startDate, endDate).Order("date ASC, time ASC").Find(&events).Error
	return events, err
}

func (r *eventRepository) SearchEvents(query string) ([]domain.Event, error) {
	var events []domain.Event
	err := r.db.Where("title ILIKE ? OR description ILIKE ?", "%"+query+"%", "%"+query+"%").Order("date ASC, time ASC").Find(&events).Error
	return events, err
}

func (r *eventRepository) GetEventStats() (map[string]interface{}, error) {
	var totalEvents int64
	var todayEvents int64
	var upcomingEvents int64
	var pastEvents int64
	var highPriorityEvents int64
	var eventsWithReminders int64

	today := time.Now().Format("2006-01-02")

	// Total events
	r.db.Model(&domain.Event{}).Count(&totalEvents)

	// Today's events
	r.db.Model(&domain.Event{}).Where("date = ?", today).Count(&todayEvents)

	// Upcoming events
	r.db.Model(&domain.Event{}).Where("date > ?", today).Count(&upcomingEvents)

	// Past events
	r.db.Model(&domain.Event{}).Where("date < ?", today).Count(&pastEvents)

	// Priority and reminder metrics used by the mobile dashboard.
	r.db.Model(&domain.Event{}).Where("priority = ?", "high").Count(&highPriorityEvents)
	r.db.Model(&domain.Event{}).Where("reminder_day = ? OR reminder_day_before = ?", true, true).Count(&eventsWithReminders)

	stats := map[string]interface{}{
		"total_events":    totalEvents,
		"today_events":    todayEvents,
		"upcoming_events": upcomingEvents,
		"past_events":     pastEvents,
		"high_priority":   highPriorityEvents,
		"with_reminders":  eventsWithReminders,
	}

	return stats, nil
}

// GetEventsByDateRange obtiene eventos en un rango de fechas (para notificaciones)
func (r *eventRepository) GetEventsByDateRange(startDate, endDate time.Time) ([]*domain.Event, error) {
	var events []*domain.Event

	err := r.db.Where("date >= ? AND date < ?", startDate, endDate).Find(&events).Error
	if err != nil {
		return nil, err
	}

	return events, nil
}
