package routes

import (
	"calendar-backend/handlers"
	"calendar-backend/services"
	"log"

	"github.com/gin-gonic/gin"
)

func SetupNotificationRoutes(router *gin.Engine, notificationService *services.NotificationService, scheduler *services.NotificationScheduler) {
	log.Println("🔧 Setting up notification routes...")

	if notificationService == nil {
		log.Println("❌ Notification service is nil")
		return
	}
	log.Println("✅ Notification service is available")

	notificationController := handlers.NewNotificationController(notificationService, scheduler)
	log.Println("✅ Notification controller created")
	if scheduler == nil {
		log.Println("⚠️ Warning: Scheduler is nil, CheckNotificationsNow endpoint will not work")
	} else {
		log.Println("✅ Scheduler is available")
	}

	notificationGroup := router.Group("/api/v1/notifications")
	log.Println("✅ Notification group created")

	notificationGroup.POST("/check", notificationController.CheckNotificationsNow)
	log.Println("✅ POST /api/v1/notifications/check route registered")

	notificationGroup.GET("/status", notificationController.GetNotificationStatus)
	log.Println("✅ GET /api/v1/notifications/status route registered")

	notificationGroup.POST("/test", notificationController.SendTestNotification)
	log.Println("✅ POST /api/v1/notifications/test route registered")

	notificationGroup.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Notification service is working",
			"status":  "ok",
		})
	})
	log.Println("✅ GET /api/v1/notifications/ping route registered")

	log.Println("✅ Notification routes registered successfully")
}
