package routes

import (
	"calendar-backend/handlers"
	"calendar-backend/services"
	"fmt"

	"github.com/gin-gonic/gin"
)

func SetupNotificationRoutes(router *gin.Engine, notificationService *services.NotificationService, scheduler *services.NotificationScheduler) {
	// Crear controller con nil scheduler temporalmente
	notificationController := handlers.NewNotificationController(notificationService, nil)

	// Grupo de rutas para notificaciones
	notificationGroup := router.Group("/api/v1/notifications")
	{
		// Endpoint para verificar notificaciones manualmente
		notificationGroup.POST("/check", notificationController.CheckNotificationsNow)

		// Endpoint para obtener estado del sistema de notificaciones
		notificationGroup.GET("/status", notificationController.GetNotificationStatus)

		// Endpoint para enviar notificación de prueba
		notificationGroup.POST("/test", notificationController.SendTestNotification)

		// Endpoint simple de prueba
		notificationGroup.GET("/ping", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"message": "Notification service is working",
				"status":  "ok",
			})
		})
	}

	// Log para confirmar que las rutas se registraron
	fmt.Println("✅ Notification routes registered successfully")
}
