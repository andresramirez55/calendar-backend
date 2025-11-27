package services

import (
	"calendar-backend/config"
	"calendar-backend/models"
	"encoding/json"
	"errors"
	"fmt"
	"log"

	"github.com/twilio/twilio-go"
	twilioApi "github.com/twilio/twilio-go/rest/api/v2010"
)

type NotificationService struct {
	cfg                *config.Config
	notificationClient *NotificationClient
}

func NewNotificationService() *NotificationService {
	// Cargar configuración con manejo de errores
	cfg := config.LoadConfig()
	if cfg == nil {
		log.Println("⚠️ Warning: Config is nil, using default values")
		// Crear configuración por defecto
		cfg = &config.Config{}
	}

	// Initialize notification client (microservice)
	notificationClient := NewNotificationClient(cfg)

	// Log configuration status
	log.Println("📧 Notification Service Configuration:")
	log.Println("  ✅ Using notification microservice for email notifications")
	log.Println("  💡 Set NOTIFICATION_SERVICE_URL to configure microservice endpoint (default: http://localhost:8081)")

	if cfg.TwilioAccountSID != "" && cfg.TwilioAuthToken != "" {
		log.Printf("  ✅ Twilio: Configured (phone: %s)", cfg.TwilioPhoneNumber)
	} else {
		log.Println("  ⚠️ Twilio: NOT configured - WhatsApp notifications will be skipped")
		log.Println("  💡 To enable WhatsApp notifications, set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER")
	}

	return &NotificationService{
		cfg:                cfg,
		notificationClient: notificationClient,
	}
}

func (s *NotificationService) SendEmailNotification(event *models.Event, reminderType string) error {
	var subject string
	var body string

	switch reminderType {
	case "day_before":
		subject = fmt.Sprintf("Recordatorio: %s mañana", event.Title)
		body = fmt.Sprintf(`
			Hola!
			
			Te recordamos que mañana tenés:
			
			Evento: %s
			Fecha: %s
			Hora: %s
			%s
			
			¡No te lo pierdas!
		`, event.Title, event.Date.Format("02/01/2006"), event.Time,
			func() string {
				if event.Location != "" {
					return fmt.Sprintf("Ubicación: %s", event.Location)
				}
				return ""
			}())
	case "same_day":
		subject = fmt.Sprintf("Recordatorio: %s hoy", event.Title)
		body = fmt.Sprintf(`
			Hola!
			
			Te recordamos que hoy tenés:
			
			Evento: %s
			Hora: %s
			%s
			
			¡Que tengas un buen día!
		`, event.Title, event.Time,
			func() string {
				if event.Location != "" {
					return fmt.Sprintf("Ubicación: %s", event.Location)
				}
				return ""
			}())
	}

	// Use notification microservice instead of direct SendGrid call
	if err := s.notificationClient.SendEmail(event.Email, subject, body, ""); err != nil {
		return fmt.Errorf("failed to send email via microservice: %v", err)
	}

	log.Printf("✅ Email notification sent via microservice to %s for event '%s'", event.Email, event.Title)
	return nil
}

// SendWhatsAppNotification sends a WhatsApp reminder for an event
func (s *NotificationService) SendWhatsAppNotification(event *models.Event, reminderType string) error {
	if s.cfg.TwilioAccountSID == "" || s.cfg.TwilioAuthToken == "" {
		log.Println("Twilio credentials not configured, skipping WhatsApp notification")
		return nil
	}

	client := twilio.NewRestClientWithParams(twilio.ClientParams{
		Username: s.cfg.TwilioAccountSID,
		Password: s.cfg.TwilioAuthToken,
	})

	var message string
	switch reminderType {
	case "day_before":
		message = fmt.Sprintf("Recordatorio: Mañana tienes '%s' a las %s", event.Title, event.Time)
	case "same_day":
		message = fmt.Sprintf("Recordatorio: Hoy tienes '%s' a las %s", event.Title, event.Time)
	}

	if event.Location != "" {
		message += fmt.Sprintf(" en %s", event.Location)
	}

	params := &twilioApi.CreateMessageParams{}
	params.SetTo(event.Phone)
	params.SetFrom(s.cfg.TwilioPhoneNumber)
	params.SetBody(message)

	_, err := client.Api.CreateMessage(params)
	if err != nil {
		return fmt.Errorf("failed to send WhatsApp message: %v", err)
	}

	log.Printf("WhatsApp message sent successfully to %s", event.Phone)
	return nil
}

// SendNotification sends both email and WhatsApp notifications
func (s *NotificationService) SendNotification(event *models.Event, reminderType string) error {
	var errs []error

	if err := s.SendEmailNotification(event, reminderType); err != nil {
		log.Printf("Failed to send email notification: %v", err)
		errs = append(errs, fmt.Errorf("email notification: %w", err))
	}

	if err := s.SendWhatsAppNotification(event, reminderType); err != nil {
		log.Printf("Failed to send WhatsApp notification: %v", err)
		errs = append(errs, fmt.Errorf("whatsapp notification: %w", err))
	}

	if err := s.SendFamilyNotifications(event, reminderType); err != nil {
		log.Printf("Failed to send family notifications: %v", err)
		errs = append(errs, fmt.Errorf("family notifications: %w", err))
	}

	if len(errs) > 0 {
		return errors.Join(errs...)
	}

	return nil
}

// FamilyMember representa un miembro de la familia
type FamilyMember struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Phone string `json:"phone"`
	Role  string `json:"role"`
}

// SendFamilyNotifications envía notificaciones a los miembros de la familia seleccionados
func (s *NotificationService) SendFamilyNotifications(event *models.Event, reminderType string) error {
	if !event.NotifyFamily {
		log.Println("Family notifications not enabled for this event")
		return nil
	}

	// Parsear miembros de la familia
	var familyMembers []FamilyMember
	if event.FamilyMembers != "" {
		if err := json.Unmarshal([]byte(event.FamilyMembers), &familyMembers); err != nil {
			log.Printf("Error parsing family members: %v", err)
			return err
		}
	}

	// Parsear hijos seleccionados
	var selectedChildren []string
	if event.SelectedChildren != "" {
		if err := json.Unmarshal([]byte(event.SelectedChildren), &selectedChildren); err != nil {
			log.Printf("Error parsing selected children: %v", err)
			return err
		}
	}

	// Determinar a quién notificar
	var recipients []FamilyMember

	// Si se debe notificar al papá
	if event.NotifyPapa {
		for _, member := range familyMembers {
			if member.Role == "papa" {
				recipients = append(recipients, member)
			}
		}
	}

	// Si se debe notificar a la mamá
	if event.NotifyMama {
		for _, member := range familyMembers {
			if member.Role == "mama" {
				recipients = append(recipients, member)
			}
		}
	}

	// Enviar notificaciones a los destinatarios
	for _, recipient := range recipients {
		// Enviar email si tiene email
		if recipient.Email != "" {
			if err := s.sendFamilyEmailNotification(event, &recipient, selectedChildren, reminderType); err != nil {
				log.Printf("Error sending email to %s: %v", recipient.Email, err)
			}
		}

		// Enviar WhatsApp si tiene teléfono
		if recipient.Phone != "" {
			if err := s.sendFamilyWhatsAppNotification(event, &recipient, selectedChildren, reminderType); err != nil {
				log.Printf("Error sending WhatsApp to %s: %v", recipient.Phone, err)
			}
		}
	}

	return nil
}

// sendFamilyEmailNotification envía un email a un miembro de la familia
func (s *NotificationService) sendFamilyEmailNotification(event *models.Event, recipient *FamilyMember, selectedChildren []string, reminderType string) error {
	var subject string
	var body string

	// Crear mensaje personalizado con información de los hijos
	childrenInfo := ""
	if len(selectedChildren) > 0 {
		childrenInfo = fmt.Sprintf("\n\nEste evento es para: %s", fmt.Sprintf("%v", selectedChildren))
	}

	switch reminderType {
	case "day_before":
		subject = fmt.Sprintf("Recordatorio familiar: %s mañana", event.Title)
		body = fmt.Sprintf(`
			Hola %s!
			
			Te recordamos que mañana tenés:
			
			Evento: %s
			Fecha: %s
			Hora: %s
			%s%s
			
			¡No te lo pierdas!
		`, recipient.Name, event.Title, event.Date.Format("02/01/2006"), event.Time,
			func() string {
				if event.Location != "" {
					return fmt.Sprintf("Ubicación: %s", event.Location)
				}
				return ""
			}(), childrenInfo)
	case "same_day":
		subject = fmt.Sprintf("Recordatorio familiar: %s hoy", event.Title)
		body = fmt.Sprintf(`
			Hola %s!
			
			Te recordamos que hoy tenés:
			
			Evento: %s
			Hora: %s
			%s%s
			
			¡Que tengas un buen día!
		`, recipient.Name, event.Title, event.Time,
			func() string {
				if event.Location != "" {
					return fmt.Sprintf("Ubicación: %s", event.Location)
				}
				return ""
			}(), childrenInfo)
	}

	// Use notification microservice instead of direct SendGrid call
	if err := s.notificationClient.SendEmail(recipient.Email, subject, body, recipient.Name); err != nil {
		return fmt.Errorf("failed to send family email via microservice: %v", err)
	}

	log.Printf("Family email sent successfully via microservice to %s (%s)", recipient.Email, recipient.Name)
	return nil
}

// sendFamilyWhatsAppNotification envía un WhatsApp a un miembro de la familia
func (s *NotificationService) sendFamilyWhatsAppNotification(event *models.Event, recipient *FamilyMember, selectedChildren []string, reminderType string) error {
	if s.cfg.TwilioAccountSID == "" || s.cfg.TwilioAuthToken == "" {
		log.Println("Twilio credentials not configured, skipping family WhatsApp notification")
		return nil
	}

	client := twilio.NewRestClientWithParams(twilio.ClientParams{
		Username: s.cfg.TwilioAccountSID,
		Password: s.cfg.TwilioAuthToken,
	})

	var message string
	childrenInfo := ""
	if len(selectedChildren) > 0 {
		childrenInfo = fmt.Sprintf("\n\nEste evento es para: %s", fmt.Sprintf("%v", selectedChildren))
	}

	switch reminderType {
	case "day_before":
		message = fmt.Sprintf("Hola %s! Te recordamos que mañana tenés: %s el %s a las %s%s. ¡No te lo pierdas!",
			recipient.Name, event.Title, event.Date.Format("02/01/2006"), event.Time, childrenInfo)
	case "same_day":
		message = fmt.Sprintf("Hola %s! Te recordamos que hoy tenés: %s a las %s%s. ¡Que tengas un buen día!",
			recipient.Name, event.Title, event.Time, childrenInfo)
	}

	params := &twilioApi.CreateMessageParams{}
	params.SetTo("whatsapp:" + recipient.Phone)
	params.SetFrom("whatsapp:" + s.cfg.TwilioPhoneNumber)
	params.SetBody(message)

	resp, err := client.Api.CreateMessage(params)
	if err != nil {
		return fmt.Errorf("failed to send family WhatsApp: %v", err)
	}

	log.Printf("Family WhatsApp sent successfully to %s (%s), SID: %s", recipient.Phone, recipient.Name, *resp.Sid)
	return nil
}
