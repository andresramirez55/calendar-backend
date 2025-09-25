import { useState, useEffect } from 'react';

export const useNotifications = () => {
  const [permission, setPermission] = useState('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Verificar si el navegador soporta notificaciones
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      console.warn('Este navegador no soporta notificaciones');
      return false;
    }

    if (permission === 'granted') {
      return true;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error al solicitar permisos de notificación:', error);
      return false;
    }
  };

  const showNotification = (title, options = {}) => {
    if (!isSupported || permission !== 'granted') {
      console.warn('No se pueden mostrar notificaciones');
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
      
      // Auto-cerrar después de 5 segundos
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } catch (error) {
      console.error('Error al mostrar notificación:', error);
      return null;
    }
  };

  const showEventReminder = (event) => {
    const title = `🔔 Recordatorio: ${event.title}`;
    const body = `El evento "${event.title}" es en ${event.time}`;
    
    if (event.location) {
      body += ` en ${event.location}`;
    }

    return showNotification(title, {
      body,
      icon: '/favicon.ico',
      tag: `event-${event.id}`,
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'Ver Evento'
        },
        {
          action: 'dismiss',
          title: 'Descartar'
        }
      ]
    });
  };

  const showEventCreated = (event) => {
    const title = `✅ Evento Creado`;
    const body = `"${event.title}" ha sido creado exitosamente`;

    return showNotification(title, {
      body,
      icon: '/favicon.ico',
      tag: `created-${event.id}`
    });
  };

  const showEventDeleted = (eventTitle) => {
    const title = `🗑️ Evento Eliminado`;
    const body = `"${eventTitle}" ha sido eliminado`;

    return showNotification(title, {
      body,
      icon: '/favicon.ico'
    });
  };

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    showEventReminder,
    showEventCreated,
    showEventDeleted
  };
};
