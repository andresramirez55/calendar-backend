package services

import (
	"bytes"
	"calendar-backend/config"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

type NotificationClient struct {
	baseURL    string
	httpClient *http.Client
}

type EmailRequest struct {
	To           string `json:"to"`
	Subject      string `json:"subject"`
	Body         string `json:"body"`
	RecipientName string `json:"recipient_name,omitempty"`
}

type EmailResponse struct {
	Message string `json:"message"`
	Status  string `json:"status"`
	To      string `json:"to"`
}

func NewNotificationClient(cfg *config.Config) *NotificationClient {
	// Get notification service URL from environment or use default
	baseURL := getEnv("NOTIFICATION_SERVICE_URL", "http://localhost:8081")
	
	log.Printf("📡 Notification Client configured with base URL: %s", baseURL)

	return &NotificationClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (c *NotificationClient) SendEmail(to, subject, body, recipientName string) error {
	reqBody := EmailRequest{
		To:           to,
		Subject:      subject,
		Body:         body,
		RecipientName: recipientName,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("failed to marshal request: %w", err)
	}

	url := fmt.Sprintf("%s/api/v1/notifications/email", c.baseURL)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request to notification service: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errorResp map[string]interface{}
		if err := json.NewDecoder(resp.Body).Decode(&errorResp); err == nil {
			return fmt.Errorf("notification service error: %v", errorResp)
		}
		return fmt.Errorf("notification service returned status %d", resp.StatusCode)
	}

	var emailResp EmailResponse
	if err := json.NewDecoder(resp.Body).Decode(&emailResp); err != nil {
		log.Printf("Warning: failed to decode response: %v", err)
		// Don't fail if we can't decode the response, as long as status is OK
	}

	log.Printf("✅ Email notification sent via microservice to %s", to)
	return nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

