package database

import (
	"calendar-backend/config"
	"calendar-backend/models"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB() (*gorm.DB, error) {
	cfg := config.LoadConfig()

	var err error

	// Determine database type from URL
	if isPostgreSQL(cfg.DatabaseURL) {
		DB, err = connectPostgreSQL(cfg.DatabaseURL)
	} else {
		// For production, prefer PostgreSQL but allow SQLite if no DATABASE_URL is set
		if os.Getenv("PORT") != "" && os.Getenv("DATABASE_URL") == "" {
			// Use SQLite as fallback for production if no DATABASE_URL is provided
			DB, err = connectSQLite("calendar.db")
		} else {
			DB, err = connectSQLite(cfg.DatabaseURL)
		}
	}

	if err != nil {
		return nil, err
	}

	// Auto migrate the schema
	err = DB.AutoMigrate(&models.Event{})
	if err != nil {
		log.Printf("Error migrating database: %v", err)
		return nil, err
	}

	log.Printf("Database connected and migrated successfully using %s", getDBType(cfg.DatabaseURL))
	return DB, nil
}

func connectPostgreSQL(databaseURL string) (*gorm.DB, error) {
	return gorm.Open(postgres.Open(databaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
}

func connectSQLite(databaseURL string) (*gorm.DB, error) {
	// Ensure directory exists for SQLite file
	dbDir := filepath.Dir(databaseURL)
	if dbDir != "." && dbDir != "" {
		if err := os.MkdirAll(dbDir, 0755); err != nil {
			return nil, fmt.Errorf("failed to create database directory: %v", err)
		}
	}

	return gorm.Open(sqlite.Open(databaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
}

func isPostgreSQL(databaseURL string) bool {
	return len(databaseURL) > 11 && databaseURL[:11] == "postgresql:"
}

func getDBType(databaseURL string) string {
	if isPostgreSQL(databaseURL) {
		return "PostgreSQL"
	}
	return "SQLite"
}

func GetDB() *gorm.DB {
	return DB
}

// BackupSQLite creates a backup of the SQLite database
func BackupSQLite(backupPath string) error {
	if DB == nil {
		return fmt.Errorf("database not initialized")
	}

	// Get the underlying SQLite connection
	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get database connection: %v", err)
	}

	// Close the current connection
	if err := sqlDB.Close(); err != nil {
		return fmt.Errorf("failed to close database connection: %v", err)
	}

	// Create backup
	cfg := config.LoadConfig()
	if err := copyFile(cfg.DatabaseURL, backupPath); err != nil {
		return fmt.Errorf("failed to create backup: %v", err)
	}

	// Reconnect to database
	if _, err := InitDB(); err != nil {
		return fmt.Errorf("failed to reconnect to database: %v", err)
	}

	log.Printf("Database backup created at: %s", backupPath)
	return nil
}

func copyFile(src, dst string) error {
	sourceFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer sourceFile.Close()

	destFile, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer destFile.Close()

	_, err = destFile.ReadFrom(sourceFile)
	return err
}
