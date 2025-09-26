package models

import (
	"time"

	"gorm.io/gorm"
)

type Event struct {
	ID                uint      `json:"id" gorm:"primaryKey"`
	Title             string    `json:"title" gorm:"not null"`
	Description       string    `json:"description"`
	Date              time.Time `json:"date" gorm:"not null"`
	Time              string    `json:"time"` // Format: "HH:MM"
	Location          string    `json:"location"`
	Email             string    `json:"email" gorm:"not null"`
	Phone             string    `json:"phone" gorm:"not null"`
	ReminderDay       bool      `json:"reminder_day" gorm:"default:true"`        // Reminder on the same day
	ReminderDayBefore bool      `json:"reminder_day_before" gorm:"default:true"` // Reminder one day before
	// Campos móviles adicionales
	IsAllDay  bool           `json:"is_all_day" gorm:"default:false"`  // Evento de todo el día
	Color     string         `json:"color" gorm:"default:'#007AFF'"`   // Color del evento
	Priority  string         `json:"priority" gorm:"default:'medium'"` // Prioridad: low, medium, high
	Category  string         `json:"category"`                         // Categoría del evento
	// Campos de notificación familiar
	NotifyFamily bool   `json:"notify_family" gorm:"default:false"`     // Notificar a la familia
	NotifyPapa   bool   `json:"notify_papa" gorm:"default:false"`        // Notificar al papá
	NotifyMama   bool   `json:"notify_mama" gorm:"default:false"`        // Notificar a la mamá
	ChildTag     string `json:"child_tag"`                               // Etiqueta del hijo
	FamilyMembers string `json:"family_members" gorm:"type:text"`       // JSON de miembros de familia
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

type CreateEventRequest struct {
	Title             string `json:"title" binding:"required"`
	Description       string `json:"description"`
	Date              string `json:"date" binding:"required"` // Format: "2006-01-02"
	Time              string `json:"time"`                    // Format: "HH:MM" (optional if is_all_day)
	Location          string `json:"location"`
	Email             string `json:"email" binding:"required,email"`
	Phone             string `json:"phone" binding:"required"`
	ReminderDay       bool   `json:"reminder_day"`
	ReminderDayBefore bool   `json:"reminder_day_before"`
	// Campos móviles
	IsAllDay bool   `json:"is_all_day"`
	Color    string `json:"color"`
	Priority string `json:"priority"`
	Category string `json:"category"`
	// Campos de notificación familiar
	NotifyFamily bool   `json:"notify_family"`
	NotifyPapa   bool   `json:"notify_papa"`
	NotifyMama   bool   `json:"notify_mama"`
	ChildTag     string `json:"child_tag"`
	FamilyMembers string `json:"family_members"`
}

type UpdateEventRequest struct {
	Title             *string `json:"title"`
	Description       *string `json:"description"`
	Date              *string `json:"date"` // Format: "2006-01-02"
	Time              *string `json:"time"` // Format: "HH:MM"
	Location          *string `json:"location"`
	Email             *string `json:"email"`
	Phone             *string `json:"phone"`
	ReminderDay       *bool   `json:"reminder_day"`
	ReminderDayBefore *bool   `json:"reminder_day_before"`
	// Campos móviles
	IsAllDay *bool   `json:"is_all_day"`
	Color    *string `json:"color"`
	Priority *string `json:"priority"`
	Category *string `json:"category"`
	// Campos de notificación familiar
	NotifyFamily *bool   `json:"notify_family"`
	NotifyPapa   *bool   `json:"notify_papa"`
	NotifyMama   *bool   `json:"notify_mama"`
	ChildTag     *string `json:"child_tag"`
	FamilyMembers *string `json:"family_members"`
}

// EventResponse es la respuesta optimizada para apps móviles
type EventResponse struct {
	ID                uint      `json:"id"`
	Title             string    `json:"title"`
	Description       string    `json:"description"`
	Date              string    `json:"date"` // Format: "2006-01-02"
	Time              string    `json:"time"`
	Location          string    `json:"location"`
	Email             string    `json:"email"`
	Phone             string    `json:"phone"`
	ReminderDay       bool      `json:"reminder_day"`
	ReminderDayBefore bool      `json:"reminder_day_before"`
	IsAllDay          bool      `json:"is_all_day"`
	Color             string    `json:"color"`
	Priority          string    `json:"priority"`
	Category          string    `json:"category"`
	// Campos de notificación familiar
	NotifyFamily      bool      `json:"notify_family"`
	NotifyPapa        bool      `json:"notify_papa"`
	NotifyMama        bool      `json:"notify_mama"`
	ChildTag          string    `json:"child_tag"`
	FamilyMembers     string    `json:"family_members"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

// ToResponse convierte un Event a EventResponse
func (e *Event) ToResponse() EventResponse {
	return EventResponse{
		ID:                e.ID,
		Title:             e.Title,
		Description:       e.Description,
		Date:              e.Date.Format("2006-01-02"),
		Time:              e.Time,
		Location:          e.Location,
		Email:             e.Email,
		Phone:             e.Phone,
		ReminderDay:       e.ReminderDay,
		ReminderDayBefore: e.ReminderDayBefore,
		IsAllDay:          e.IsAllDay,
		Color:             e.Color,
		Priority:          e.Priority,
		Category:          e.Category,
		NotifyFamily:      e.NotifyFamily,
		NotifyPapa:        e.NotifyPapa,
		NotifyMama:        e.NotifyMama,
		ChildTag:          e.ChildTag,
		FamilyMembers:     e.FamilyMembers,
		CreatedAt:         e.CreatedAt,
		UpdatedAt:         e.UpdatedAt,
	}
}
