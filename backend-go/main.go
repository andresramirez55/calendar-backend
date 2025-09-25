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

	// Configure CORS
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173", "http://127.0.0.1:5173"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	config.AllowCredentials = true
	router.Use(cors.New(config))

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
