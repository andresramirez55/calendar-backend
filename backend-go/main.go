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
	log.Println("🔧 Initializing event service...")
	eventService := services.NewEventService(eventRepo)
	log.Println("✅ Event service initialized")
	
	log.Println("🔧 Initializing notification service...")
	notificationService := services.NewNotificationService()
	log.Println("✅ Notification service initialized")

	// Initialize notification scheduler
	log.Println("🔧 Initializing notification scheduler...")
	notificationScheduler := services.NewNotificationScheduler(eventRepo, notificationService)
	
	// Start notification scheduler (comentado temporalmente para debug)
	log.Println("🔧 Starting notification scheduler...")
	// notificationScheduler.Start()
	log.Println("✅ Notification scheduler initialized (not started for debug)")

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

	// Test notification endpoint (direct)
	router.GET("/api/v1/notifications/test-direct", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Direct notification test endpoint",
			"status":  "ok",
		})
	})
	
	// Test notification ping (direct)
	router.GET("/api/v1/notifications/ping-direct", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Direct notification ping endpoint",
			"status":  "ok",
		})
	})

	// Setup all routes
	log.Println("🔧 Setting up main routes...")
	routes.SetupAllRoutes(router, eventController, mobileHandler)

	// Setup notification routes
	log.Println("🔧 Setting up notification routes...")
	
	// Verificar que los servicios estén inicializados
	if notificationService == nil {
		log.Println("❌ Notification service is nil")
	} else {
		log.Println("✅ Notification service initialized")
	}
	
	if notificationScheduler == nil {
		log.Println("❌ Notification scheduler is nil")
	} else {
		log.Println("✅ Notification scheduler initialized")
	}
	
	// Intentar registrar las rutas con manejo de errores
	defer func() {
		if r := recover(); r != nil {
			log.Printf("❌ Error setting up notification routes: %v", r)
		}
	}()
	
	routes.SetupNotificationRoutes(router, notificationService, notificationScheduler)
	log.Println("✅ All routes configured successfully")

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
