package main

import (
	"log"
	"os"

	"calendar-backend/database"
	"calendar-backend/handlers"
	"calendar-backend/repositories"
	"calendar-backend/routes"
	"calendar-backend/services"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Log environment info for debugging
	log.Printf("Environment PORT: %s", os.Getenv("PORT"))
	log.Printf("Environment DATABASE_URL: %s", os.Getenv("DATABASE_URL"))

	// Initialize database
	db, err := database.InitDB()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Initialize repositories
	eventRepo := repositories.NewEventRepository(db)

	// Initialize services
	eventService := services.NewEventService(eventRepo)
	notificationService := services.NewNotificationService()
	schedulerService := services.NewSchedulerService(db, notificationService)

	// Start scheduler
	go schedulerService.Start()

	// Initialize handlers
	eventController := handlers.NewEventController(eventService)

	// Initialize mobile handler
	mobileHandler := handlers.NewMobileHandler(db)

	// Setup routes
	router := gin.Default()
	routes.SetupAllRoutes(router, eventController, mobileHandler)

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
