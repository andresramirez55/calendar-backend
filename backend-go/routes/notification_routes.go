package routes

import (
	"calendar-backend/handlers"
	"calendar-backend/services"
	"fmt"

	"github.com/gin-gonic/gin"
)

func SetupNotificationRoutes(router *gin.Engine, notificationService *services.NotificationService, scheduler *services.NotificationScheduler) {
	fmt.Println("🔧 Setting up notification routes...")

	if notificationService == nil {
		fmt.Println("❌ Notification service is nil")
		return
	}
	fmt.Println("✅ Notification service is available")

	notificationController := handlers.NewNotificationController(notificationService, scheduler)
	fmt.Println("✅ Notification controller created")
	if scheduler == nil {
		fmt.Println("⚠️ Warning: Scheduler is nil, CheckNotificationsNow endpoint will not work")
	} else {
		fmt.Println("✅ Scheduler is available")
	}

	notificationGroup := router.Group("/api/v1/notifications")
	fmt.Println("✅ Notification group created")

	notificationGroup.POST("/check", notificationController.CheckNotificationsNow)
	fmt.Println("✅ /check route registered")

	notificationGroup.GET("/status", notificationController.GetNotificationStatus)
	fmt.Println("✅ /status route registered")

	notificationGroup.POST("/test", notificationController.SendTestNotification)
	fmt.Println("✅ /test route registered")

	notificationGroup.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Notification service is working",
			"status":  "ok",
		})
	})
	fmt.Println("✅ /ping route registered")

	fmt.Println("✅ Notification routes registered successfully")
}
