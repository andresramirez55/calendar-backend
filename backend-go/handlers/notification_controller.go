package handlers

import (
	"calendar-backend/models"
	"calendar-backend/services"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type NotificationController struct {
	notificationService *services.NotificationService
	scheduler           *services.NotificationScheduler
}

func NewNotificationController(notificationService *services.NotificationService, scheduler *services.NotificationScheduler) *NotificationController {
	return &NotificationController{
		notificationService: notificationService,
		scheduler:           scheduler,
	}
}

// CheckNotificationsNow ejecuta manualmente la verificación de notificaciones
func (h *NotificationController) CheckNotificationsNow(c *gin.Context) {
	if h.scheduler == nil {
		c.JSON(http.StatusOK, gin.H{
			"message": "Notification scheduler is not available",
			"status":  "warning",
		})
		return
	}

	h.scheduler.CheckNotificationsNow()

	c.JSON(http.StatusOK, gin.H{
		"message": "Notification check triggered successfully",
		"status":  "success",
	})
}

// GetNotificationStatus obtiene el estado del sistema de notificaciones
func (h *NotificationController) GetNotificationStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Notification system is running",
		"status":  "active",
		"features": gin.H{
			"email_notifications":    true,
			"whatsapp_notifications": true,
			"family_notifications":   true,
			"scheduler_active":       true,
		},
	})
}

// SendTestNotification envía una notificación de prueba
func (h *NotificationController) SendTestNotification(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required"`
		Phone string `json:"phone"`
		Type  string `json:"type"` // "email", "whatsapp", "both"
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Crear evento de prueba
	testEvent := &models.Event{
		Title:             "🧪 Notificación de Prueba",
		Description:       "Esta es una notificación de prueba del sistema",
		Date:              time.Now().AddDate(0, 0, 1), // Mañana
		Time:              "10:00",
		Location:          "Sistema de Pruebas",
		Email:             req.Email,
		Phone:             req.Phone,
		ReminderDay:       true,
		ReminderDayBefore: true,
		IsAllDay:          false,
		Color:             "#007AFF",
		Priority:          "medium",
		Category:          "test",
	}

	// Enviar notificación de prueba
	if err := h.notificationService.SendNotification(testEvent, "day_before"); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to send test notification",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Test notification sent successfully",
		"status":  "success",
		"sent_to": gin.H{
			"email": req.Email,
			"phone": req.Phone,
		},
	})
}
