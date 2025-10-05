package main

import (
	"log"
	"os"

	"calendar-backend/database"
	"calendar-backend/handlers"
	"calendar-backend/models"
	"calendar-backend/repositories"
	"calendar-backend/routes"
	"calendar-backend/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	log.Println("🚀 Starting Calendar API v3 - NOTIFICATION ROUTES FIXED...")

	// Load environment variables
	// Try to load .env.local first (for local development)
	if err := godotenv.Load(".env.local"); err != nil {
		// If .env.local doesn't exist, try .env
		if err := godotenv.Load(); err != nil {
			log.Println("No .env file found, using system environment variables")
		}
	}

	// Initialize database
	db, err := database.InitDB()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto-migrate the schema
	if err := db.AutoMigrate(&models.Event{}); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
	log.Println("Database migration completed successfully")

	// Initialize repositories
	eventRepo := repositories.NewEventRepository(db)

	// Initialize services (simplificado)
	eventService := services.NewEventService(eventRepo)
	notificationService := services.NewNotificationService()
	notificationScheduler := services.NewNotificationScheduler(eventRepo, notificationService)

	// Initialize handlers
	eventController := handlers.NewEventController(eventService)
	mobileHandler := handlers.NewMobileHandler(db)

	// Setup routes
	router := gin.Default()

	// Configure CORS
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173", "http://127.0.0.1:5173"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	config.AllowCredentials = true
	router.Use(cors.New(config))

	// Setup all routes FIRST
	routes.SetupAllRoutes(router, eventController, mobileHandler)

	// Setup notification routes
	log.Println("🔧 About to setup notification routes...")
	routes.SetupNotificationRoutes(router, notificationService, notificationScheduler)
	log.Println("✅ Notification routes setup completed")

	// Test notification endpoint (direct) - AFTER all other routes
	router.GET("/api/v1/notifications/test-direct", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Direct notification test endpoint",
			"status":  "ok",
		})
	})

	// Test notification ping (direct) - AFTER all other routes
	router.GET("/api/v1/notifications/ping-direct", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Direct notification ping endpoint",
			"status":  "ok",
		})
	})

	// Simple test endpoint to verify deployment
	router.GET("/api/v1/test-deployment", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Deployment test successful - v3 with notification routes",
			"status":  "ok",
			"version": "v3",
		})
	})

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
