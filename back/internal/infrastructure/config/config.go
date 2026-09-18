package config

import (
	"os"
)

type Config struct {
	Port              string
	DatabaseURL       string
	SendGridAPIKey    string
	TwilioAccountSID  string
	TwilioAuthToken   string
	TwilioPhoneNumber string
	FromEmail         string
}

func LoadConfig() *Config {
	return &Config{
		Port:              getEnv("PORT", "8080"),
		DatabaseURL:       getEnv("DATABASE_URL", "calendar.db"),
		SendGridAPIKey:    getEnv("SENDGRID_API_KEY", ""),
		TwilioAccountSID:  getEnv("TWILIO_ACCOUNT_SID", ""),
		TwilioAuthToken:   getEnv("TWILIO_AUTH_TOKEN", ""),
		TwilioPhoneNumber: getEnv("TWILIO_PHONE_NUMBER", ""),
		FromEmail:         getEnv("FROM_EMAIL", "noreply@calendar.com"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
