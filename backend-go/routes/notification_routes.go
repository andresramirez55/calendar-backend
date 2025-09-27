package routes

import (
	"calendar-backend/handlers"
	"calendar-backend/services"

	"github.com/gin-gonic/gin"
)

func SetupNotificationRoutes(router *gin.Engine, notificationService *services.NotificationService, scheduler *services.NotificationScheduler) {
	notificationController := handlers.NewNotificationController(notificationService, scheduler)
	
	// Grupo de rutas para notificaciones
	notificationGroup := router.Group("/api/v1/notifications")
	{
		// Endpoint para verificar notificaciones manualmente
		notificationGroup.POST("/check", notificationController.CheckNotificationsNow)
		
		// Endpoint para obtener estado del sistema de notificaciones
		notificationGroup.GET("/status", notificationController.GetNotificationStatus)
		
		// Endpoint para enviar notificación de prueba
		notificationGroup.POST("/test", notificationController.SendTestNotification)
	}
}
