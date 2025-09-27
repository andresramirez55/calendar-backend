package routes

import (
	"calendar-backend/handlers"
	"calendar-backend/services"
	"fmt"

	"github.com/gin-gonic/gin"
)

func SetupNotificationRoutes(router *gin.Engine, notificationService *services.NotificationService, scheduler *services.NotificationScheduler) {
	fmt.Println("🔧 Setting up notification routes...")

	// Verificar que los servicios estén disponibles
	if notificationService == nil {
		fmt.Println("❌ Notification service is nil")
		return
	}
	fmt.Println("✅ Notification service is available")

	// Crear controller con nil scheduler temporalmente
	notificationController := handlers.NewNotificationController(notificationService, nil)
	fmt.Println("✅ Notification controller created")

	// Grupo de rutas para notificaciones
	notificationGroup := router.Group("/api/v1/notifications")
	fmt.Println("✅ Notification group created")

	// Endpoint para verificar notificaciones manualmente
	notificationGroup.POST("/check", notificationController.CheckNotificationsNow)
	fmt.Println("✅ /check route registered")

	// Endpoint para obtener estado del sistema de notificaciones
	notificationGroup.GET("/status", notificationController.GetNotificationStatus)
	fmt.Println("✅ /status route registered")

	// Endpoint para enviar notificación de prueba
	notificationGroup.POST("/test", notificationController.SendTestNotification)
	fmt.Println("✅ /test route registered")

	// Endpoint simple de prueba
	notificationGroup.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Notification service is working",
			"status":  "ok",
		})
	})
	fmt.Println("✅ /ping route registered")

	// Log para confirmar que las rutas se registraron
	fmt.Println("✅ Notification routes registered successfully")
}
