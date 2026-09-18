package notificationservice

import (
	"calendar-backend/internal/domain"
	"fmt"
	"log"
	"time"
)

type NotificationScheduler struct {
	eventRepo           domain.EventRepository
	notificationService *NotificationService
	ticker              *time.Ticker
	done                chan bool
}

func NewNotificationScheduler(eventRepo domain.EventRepository, notificationService *NotificationService) *NotificationScheduler {
	return &NotificationScheduler{
		eventRepo:           eventRepo,
		notificationService: notificationService,
		done:                make(chan bool),
	}
}

// Start inicia el scheduler en background
func (s *NotificationScheduler) Start() {
	log.Println("🚀 Starting notification scheduler...")

	// Ejecutar inmediatamente al inicio
	go s.checkAndSendNotifications()

	// Configurar ticker para ejecutar cada 5 minutos
	s.ticker = time.NewTicker(5 * time.Minute)

	go func() {
		for {
			select {
			case <-s.ticker.C:
				s.checkAndSendNotifications()
			case <-s.done:
				log.Println("🛑 Notification scheduler stopped")
				return
			}
		}
	}()

	log.Println("✅ Notification scheduler started - checking every 5 minutes")
}

// Stop detiene el scheduler
func (s *NotificationScheduler) Stop() {
	if s.ticker != nil {
		s.ticker.Stop()
	}
	s.done <- true
}

// checkAndSendNotifications verifica eventos y envía notificaciones
func (s *NotificationScheduler) checkAndSendNotifications() {
	log.Println("🔍 Checking for notifications to send...")

	// Obtener eventos que necesitan notificaciones
	events, err := s.getEventsForNotification()
	if err != nil {
		log.Printf("❌ Error getting events for notification: %v", err)
		return
	}

	if len(events) == 0 {
		log.Println("ℹ️ No events need notifications at this time")
		return
	}

	log.Printf("📅 Found %d events that need notifications", len(events))

	// Procesar cada evento
	for _, event := range events {
		s.processEventNotification(event)
	}
}

// getEventsForNotification obtiene eventos que necesitan notificaciones
func (s *NotificationScheduler) getEventsForNotification() ([]*domain.Event, error) {
	now := time.Now()

	// Eventos que necesitan notificación el día anterior
	dayBefore := now.AddDate(0, 0, 1)
	dayBeforeStart := time.Date(dayBefore.Year(), dayBefore.Month(), dayBefore.Day(), 0, 0, 0, 0, dayBefore.Location())
	dayBeforeEnd := dayBeforeStart.Add(24 * time.Hour)

	// Eventos que necesitan notificación el mismo día
	sameDayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	sameDayEnd := sameDayStart.Add(24 * time.Hour)

	// Obtener eventos del día anterior
	eventsDayBefore, err := s.eventRepo.GetEventsByDateRange(dayBeforeStart, dayBeforeEnd)
	if err != nil {
		return nil, fmt.Errorf("error getting events for day before: %v", err)
	}

	// Obtener eventos del mismo día
	eventsSameDay, err := s.eventRepo.GetEventsByDateRange(sameDayStart, sameDayEnd)
	if err != nil {
		return nil, fmt.Errorf("error getting events for same day: %v", err)
	}

	// Combinar eventos
	var allEvents []*domain.Event
	allEvents = append(allEvents, eventsDayBefore...)
	allEvents = append(allEvents, eventsSameDay...)

	// Filtrar eventos que necesitan notificaciones
	var eventsToNotify []*domain.Event
	for _, event := range allEvents {
		if s.shouldSendNotification(event, now) {
			eventsToNotify = append(eventsToNotify, event)
		}
	}

	return eventsToNotify, nil
}

// shouldSendNotification determina si un evento necesita notificación
func (s *NotificationScheduler) shouldSendNotification(event *domain.Event, now time.Time) bool {
	eventDate := event.Date

	// Verificar si es el día anterior y necesita notificación
	if event.ReminderDayBefore {
		dayBefore := now.AddDate(0, 0, 1)
		if eventDate.Year() == dayBefore.Year() &&
			eventDate.Month() == dayBefore.Month() &&
			eventDate.Day() == dayBefore.Day() {
			return true
		}
	}

	// Verificar si es el mismo día y necesita notificación
	if event.ReminderDay {
		if eventDate.Year() == now.Year() &&
			eventDate.Month() == now.Month() &&
			eventDate.Day() == now.Day() {
			return true
		}
	}

	return false
}

// processEventNotification procesa las notificaciones para un evento
func (s *NotificationScheduler) processEventNotification(event *domain.Event) {
	log.Printf("📧 Processing notifications for event: %s (ID: %d)", event.Title, event.ID)

	// Determinar tipo de notificación
	now := time.Now()
	eventDate := event.Date

	var reminderType string
	if event.ReminderDayBefore &&
		eventDate.Year() == now.AddDate(0, 0, 1).Year() &&
		eventDate.Month() == now.AddDate(0, 0, 1).Month() &&
		eventDate.Day() == now.AddDate(0, 0, 1).Day() {
		reminderType = "day_before"
	} else if event.ReminderDay &&
		eventDate.Year() == now.Year() &&
		eventDate.Month() == now.Month() &&
		eventDate.Day() == now.Day() {
		reminderType = "same_day"
	}

	if reminderType == "" {
		log.Printf("⚠️ No reminder type determined for event %d", event.ID)
		return
	}

	log.Printf("🔔 Sending %s notification for event: %s", reminderType, event.Title)

	// Enviar notificaciones
	if err := s.notificationService.SendNotification(event, reminderType); err != nil {
		log.Printf("❌ Error sending notification for event %d: %v", event.ID, err)
	} else {
		log.Printf("✅ Notification sent successfully for event: %s", event.Title)
	}
}

// CheckNotificationsNow ejecuta la verificación manualmente (para testing)
func (s *NotificationScheduler) CheckNotificationsNow() {
	log.Println("🔍 Manual notification check triggered")
	s.checkAndSendNotifications()
}
