package main

import (
	"log"
	"os"
	"time"

	eventcontroller "calendar-backend/internal/controller/event"
	"calendar-backend/internal/domain"
	"calendar-backend/internal/infrastructure/database"
	eventrepository "calendar-backend/internal/repository/event"
	eventservice "calendar-backend/internal/service/event"
	notificationservice "calendar-backend/internal/service/notification"
	eventmapping "calendar-backend/internal/urlmapping/event"
	notificationmapping "calendar-backend/internal/urlmapping/notification"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Logs inmediatos para verificar que el código se ejecuta
	log.Println("========================================")
	log.Println("🚀 CALENDAR API v5 - STARTING NOW...")
	log.Println("========================================")
	log.Println("⏰ Timestamp:", time.Now().Format(time.RFC3339))
	log.Println("🔍 Checking environment...")

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
	if err := db.AutoMigrate(&domain.Event{}); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
	log.Println("Database migration completed successfully")

	// Initialize repositories
	eventRepo := eventrepository.NewEventRepository(db)

	// Initialize services
	eventService := eventservice.NewEventService(eventRepo)
	notificationService := notificationservice.NewNotificationService()
	notificationScheduler := notificationservice.NewNotificationScheduler(eventRepo, notificationService)

	// Start notification scheduler in background
	log.Println("🔔 Initializing notification scheduler...")
	notificationScheduler.Start()
	log.Println("✅ Notification scheduler initialized and running")

	// Initialize handlers
	eventController := eventcontroller.NewEventController(eventService)
	mobileHandler := eventcontroller.NewMobileHandler(eventService)

	// Setup routes
	router := gin.Default()

	// CRITICAL: Register /health FIRST, before CORS and everything else
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Calendar API is running",
			"version": "v5",
			"time":    time.Now().Format(time.RFC3339),
		})
	})
	log.Println("✅ CRITICAL: /health endpoint registered FIRST")

	// Also register root endpoint immediately
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Welcome to Calendar API",
			"version": "v5",
			"health":  "/health",
			"time":    time.Now().Format(time.RFC3339),
		})
	})
	log.Println("✅ CRITICAL: / (root) endpoint registered FIRST")

	// Configure CORS
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173", "http://127.0.0.1:5173"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	config.AllowCredentials = true
	router.Use(cors.New(config))

	// Setup all routes
	log.Println("🔧 Setting up all eventmapping...")
	eventmapping.SetupAllRoutes(router, eventController, mobileHandler)
	log.Println("✅ All routes setup completed")

	// Setup notification routes
	log.Println("🔧 Setting up notification URL mappings...")
	notificationmapping.SetupNotificationRoutes(router, notificationService, notificationScheduler)
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

	// Debug: Log all registered routes (after ALL routes are registered)
	log.Println("📋 Registered routes summary:")
	allRoutes := router.Routes()
	for _, route := range allRoutes {
		log.Printf("   %s %s", route.Method, route.Path)
	}
	log.Printf("✅ Total routes registered: %d", len(allRoutes))

	// Add diagnostic endpoint to list all routes and system info
	router.GET("/api/v1/debug/routes", func(c *gin.Context) {
		routes := router.Routes()
		routeList := make([]map[string]string, 0, len(routes))
		notificationRoutes := make([]map[string]string, 0)

		for _, route := range routes {
			routeInfo := map[string]string{
				"method": route.Method,
				"path":   route.Path,
			}
			routeList = append(routeList, routeInfo)

			// Filter notification routes for easier debugging
			if len(route.Path) >= 24 && route.Path[:24] == "/api/v1/notifications" {
				notificationRoutes = append(notificationRoutes, routeInfo)
			}
		}

		c.JSON(200, gin.H{
			"version":                  "v3",
			"total_routes":             len(routes),
			"notification_routes":      len(notificationRoutes),
			"notification_routes_list": notificationRoutes,
			"all_routes":               routeList,
		})
	})
	log.Println("✅ GET /api/v1/debug/routes diagnostic endpoint registered")

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("========================================")
	log.Printf("🚀 Server starting on port %s", port)
	log.Println("========================================")
	log.Println("✅ Ready to accept connections!")
	log.Println("🔍 Test with: curl http://localhost:" + port + "/health")
	log.Println("========================================")

	if err := router.Run(":" + port); err != nil {
		log.Fatal("❌ Failed to start server:", err)
	}
}
