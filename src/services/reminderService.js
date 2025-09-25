class ReminderService {
  constructor() {
    this.reminders = new Map();
    this.checkInterval = null;
    this.permission = 'default';
    this.isSupported = false;
  }

  // Inicializar el servicio
  async initialize() {
    // Verificar si el navegador soporta notificaciones
    if ('Notification' in window) {
      this.isSupported = true;
      this.permission = Notification.permission;
    }
    
    // Solicitar permisos
    await this.requestPermission();
    
    // Iniciar verificación de recordatorios
    this.startReminderCheck();
  }

  // Solicitar permisos de notificación
  async requestPermission() {
    if (!this.isSupported) {
      console.warn('Este navegador no soporta notificaciones');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      const result = await Notification.requestPermission();
      this.permission = result;
      return result === 'granted';
    } catch (error) {
      console.error('Error al solicitar permisos de notificación:', error);
      return false;
    }
  }

  // Iniciar verificación periódica de recordatorios
  startReminderCheck() {
    // Verificar cada minuto
    this.checkInterval = setInterval(() => {
      this.checkReminders();
    }, 60000); // 60 segundos
  }

  // Detener verificación de recordatorios
  stopReminderCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Agregar recordatorio para un evento
  addReminder(event, reminderType = 'day') {
    const reminderKey = `${event.id}-${reminderType}`;
    
    // Calcular tiempo del recordatorio
    const eventDate = new Date(`${event.date.split('T')[0]}T${event.time}:00`);
    let reminderTime;
    
    if (reminderType === 'day') {
      // Recordatorio el día del evento, 1 hora antes
      reminderTime = new Date(eventDate.getTime() - (60 * 60 * 1000));
    } else if (reminderType === 'day_before') {
      // Recordatorio el día anterior, a las 9 AM
      reminderTime = new Date(eventDate.getTime() - (24 * 60 * 60 * 1000));
      reminderTime.setHours(9, 0, 0, 0);
    }
    
    // Solo agregar si el recordatorio es en el futuro
    if (reminderTime > new Date()) {
      this.reminders.set(reminderKey, {
        event,
        reminderTime,
        reminderType,
        notified: false
      });
    }
  }

  // Remover recordatorio
  removeReminder(eventId, reminderType = 'day') {
    const reminderKey = `${eventId}-${reminderType}`;
    this.reminders.delete(reminderKey);
  }

  // Verificar recordatorios pendientes
  checkReminders() {
    const now = new Date();
    
    this.reminders.forEach((reminder, key) => {
      if (!reminder.notified && reminder.reminderTime <= now) {
        this.triggerReminder(reminder);
        reminder.notified = true;
      }
    });
  }

  // Mostrar notificación
  showNotification(title, options = {}) {
    if (!this.isSupported || this.permission !== 'granted') {
      return null;
    }

    const defaultOptions = {
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📅</text></svg>',
      badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📅</text></svg>',
      requireInteraction: false,
      silent: false,
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);
      
      // Eventos de la notificación
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      notification.onerror = (error) => {
        console.error('Error en la notificación:', error);
      };
      
      // Auto-cerrar después de 5 segundos
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } catch (error) {
      console.error('Error al mostrar notificación:', error);
      return null;
    }
  }

  // Mostrar recordatorio de evento
  showEventReminder(event) {
    const title = `🔔 Recordatorio: ${event.title}`;
    const body = `El evento "${event.title}" es en ${event.time}`;
    
    let fullBody = body;
    if (event.location) {
      fullBody += ` en ${event.location}`;
    }

    return this.showNotification(title, {
      body: fullBody,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔔</text></svg>',
      tag: `event-${event.id}`,
      requireInteraction: true
    });
  }

  // Activar recordatorio
  triggerReminder(reminder) {
    if (this.permission === 'granted') {
      this.showEventReminder(reminder.event);
    }
  }

  // Limpiar recordatorios de eventos eliminados
  cleanupReminders(eventId) {
    this.removeReminder(eventId, 'day');
    this.removeReminder(eventId, 'day_before');
  }

  // Obtener recordatorios pendientes
  getPendingReminders() {
    const now = new Date();
    const pending = [];
    
    this.reminders.forEach((reminder, key) => {
      if (!reminder.notified && reminder.reminderTime > now) {
        pending.push({
          key,
          event: reminder.event,
          reminderTime: reminder.reminderTime,
          reminderType: reminder.reminderType
        });
      }
    });
    
    return pending.sort((a, b) => a.reminderTime - b.reminderTime);
  }
}

// Instancia singleton
const reminderService = new ReminderService();

export default reminderService;
