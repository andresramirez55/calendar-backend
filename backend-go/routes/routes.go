package routes

import (
	"calendar-backend/handlers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine, eventController *handlers.EventController) {
	// API v1 group
	v1 := router.Group("/api/v1")
	{
		// Events endpoints
		events := v1.Group("/events")
		{
			events.POST("/", eventController.CreateEvent)
			events.GET("/", eventController.GetEvents)
			events.GET("/:id", eventController.GetEvent)
			events.PUT("/:id", eventController.UpdateEvent)
			events.DELETE("/:id", eventController.DeleteEvent)
		}
	}

}

func SetupMobileRoutes(router *gin.Engine, mobileHandler *handlers.MobileHandler) {
	// Mobile API group
	mobile := router.Group("/api/mobile")
	{
		// Mobile-optimized endpoints
		mobile.GET("/events/today", mobileHandler.GetTodayEvents)
		mobile.GET("/events/upcoming", mobileHandler.GetUpcomingEvents)
		mobile.GET("/events/range", mobileHandler.GetEventsForDateRange)
		mobile.GET("/events/search", mobileHandler.SearchEvents)
		mobile.GET("/stats", mobileHandler.GetEventStats)
	}
}

func SetupAllRoutes(router *gin.Engine, eventController *handlers.EventController, mobileHandler *handlers.MobileHandler) {
	// Setup regular routes
	SetupRoutes(router, eventController)

	// Setup mobile routes
	SetupMobileRoutes(router, mobileHandler)

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Calendar API is running",
		})
	})

	// Root endpoint
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Welcome to Calendar API",
			"version": "1.0.0",
			"endpoints": gin.H{
				"events": "/api/v1/events",
				"mobile": "/api/mobile",
				"health": "/health",
			},
		})
	})
}
