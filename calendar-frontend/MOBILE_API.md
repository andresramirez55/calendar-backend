# 📱 API Móvil - Calendario Backend

Esta documentación está diseñada específicamente para desarrolladores de aplicaciones móviles que quieran integrar con nuestro backend de calendario.

## 🚀 **Endpoints Móviles Optimizados**

### **Base URL**
```
https://tu-api.onrender.com/api/mobile
```

## 📅 **Endpoints de Eventos**

### 1. **Eventos de Hoy**
```http
GET /api/mobile/events/today
```

**Respuesta:**
```json
{
  "events": [
    {
      "id": 1,
      "title": "Reunión de trabajo",
      "description": "Reunión semanal del equipo",
      "date": "2024-01-15",
      "time": "14:00",
      "location": "Oficina principal",
      "email": "usuario@ejemplo.com",
      "phone": "+1234567890",
      "reminder_day": true,
      "reminder_day_before": true,
      "is_all_day": false,
      "color": "#007AFF",
      "priority": "medium",
      "category": "Trabajo",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ],
  "count": 1,
  "date": "2024-01-15"
}
```

### 2. **Eventos Próximos**
```http
GET /api/mobile/events/upcoming?limit=10
```

**Parámetros:**
- `limit` (opcional): Número máximo de eventos (default: 10)

**Respuesta:**
```json
{
  "events": [...],
  "count": 5,
  "limit": 10
}
```

### 3. **Eventos por Rango de Fechas**
```http
GET /api/mobile/events/range?start_date=2024-01-01&end_date=2024-01-31
```

**Parámetros requeridos:**
- `start_date`: Fecha de inicio (YYYY-MM-DD)
- `end_date`: Fecha de fin (YYYY-MM-DD)

### 4. **Búsqueda de Eventos**
```http
GET /api/mobile/events/search?q=reunión
```

**Parámetros requeridos:**
- `q`: Término de búsqueda

### 5. **Estadísticas del Dashboard**
```http
GET /api/mobile/stats
```

**Respuesta:**
```json
{
  "total_events": 25,
  "today_events": 3,
  "upcoming_events": 8,
  "past_events": 14,
  "high_priority": 2,
  "with_reminders": 20
}
```

## 🔧 **Endpoints Estándar (También Disponibles)**

### **Crear Evento**
```http
POST /api/v1/events
```

**Body:**
```json
{
  "title": "Nuevo evento",
  "description": "Descripción del evento",
  "date": "2024-01-20",
  "time": "15:30",
  "location": "Ubicación",
  "email": "usuario@email.com",
  "phone": "+1234567890",
  "reminder_day": true,
  "reminder_day_before": true,
  "is_all_day": false,
  "color": "#FF3B30",
  "priority": "high",
  "category": "Personal"
}
```

### **Obtener Evento Específico**
```http
GET /api/v1/events/{id}
```

### **Actualizar Evento**
```http
PUT /api/v1/events/{id}
```

### **Eliminar Evento**
```http
DELETE /api/v1/events/{id}
```

## 📱 **Integración en Apps Móviles**

### **React Native**
```javascript
import { useState, useEffect } from 'react';

const useCalendarAPI = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTodayEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://tu-api.onrender.com/api/mobile/events/today');
      const data = await response.json();
      setEvents(data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData) => {
    try {
      const response = await fetch('https://tu-api.onrender.com/api/v1/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      });
      
      if (response.ok) {
        const newEvent = await response.json();
        setEvents(prev => [...prev, newEvent]);
        return newEvent;
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return { events, loading, fetchTodayEvents, createEvent };
};
```

### **Flutter**
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class CalendarAPI {
  static const String baseUrl = 'https://tu-api.onrender.com';
  
  static Future<List<Event>> getTodayEvents() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/mobile/events/today'),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return (data['events'] as List)
          .map((json) => Event.fromJson(json))
          .toList();
    }
    
    throw Exception('Failed to load events');
  }
  
  static Future<Event> createEvent(Event event) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/events'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(event.toJson()),
    );
    
    if (response.statusCode == 201) {
      return Event.fromJson(jsonDecode(response.body));
    }
    
    throw Exception('Failed to create event');
  }
}
```

### **iOS Swift**
```swift
import Foundation

class CalendarAPI {
    static let baseURL = "https://tu-api.onrender.com"
    
    static func getTodayEvents() async throws -> [Event] {
        let url = URL(string: "\(baseURL)/api/mobile/events/today")!
        let (data, _) = try await URLSession.shared.data(from: url)
        
        let response = try JSONDecoder().decode(EventsResponse.self, from: data)
        return response.events
    }
    
    static func createEvent(_ event: Event) async throws -> Event {
        let url = URL(string: "\(baseURL)/api/v1/events")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(event)
        
        let (data, _) = try await URLSession.shared.data(for: request)
        return try JSONDecoder().decode(Event.self, from: data)
    }
}

struct EventsResponse: Codable {
    let events: [Event]
    let count: Int
    let date: String
}
```

## 🎨 **Campos de Evento para Apps Móviles**

### **Campos Básicos**
- `id`: Identificador único
- `title`: Título del evento
- `description`: Descripción opcional
- `date`: Fecha (YYYY-MM-DD)
- `time`: Hora (HH:MM)

### **Campos de Ubicación**
- `location`: Ubicación del evento

### **Campos de Contacto**
- `email`: Email para notificaciones
- `phone`: Teléfono para WhatsApp

### **Campos de Recordatorios**
- `reminder_day`: Recordatorio el mismo día
- `reminder_day_before`: Recordatorio un día antes

### **Campos Visuales (Nuevos)**
- `is_all_day`: Evento de todo el día
- `color`: Color del evento (hex)
- `priority`: Prioridad (low, medium, high)
- `category`: Categoría del evento

## 🔔 **Sistema de Notificaciones**

### **Automático**
- **Un día antes**: 9:00 AM UTC
- **El mismo día**: 1 hora antes del evento

### **Tipos**
- **Email**: Usando SendGrid
- **WhatsApp**: Usando Twilio

## 📊 **Mejores Prácticas para Apps Móviles**

### 1. **Caché Local**
```javascript
// React Native con AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

const cacheEvents = async (events) => {
  await AsyncStorage.setItem('cached_events', JSON.stringify(events));
};

const getCachedEvents = async () => {
  const cached = await AsyncStorage.getItem('cached_events');
  return cached ? JSON.parse(cached) : [];
};
```

### 2. **Sincronización Offline**
```javascript
const syncOfflineEvents = async () => {
  const offlineEvents = await getOfflineEvents();
  
  for (const event of offlineEvents) {
    try {
      await createEvent(event);
      await removeOfflineEvent(event.id);
    } catch (error) {
      console.error('Failed to sync event:', error);
    }
  }
};
```

### 3. **Manejo de Errores**
```javascript
const handleAPIError = (error) => {
  if (error.message.includes('Network request failed')) {
    // Mostrar mensaje de offline
    showOfflineMessage();
  } else if (error.status === 401) {
    // Manejar autenticación
    handleAuthError();
  } else {
    // Error general
    showErrorMessage(error.message);
  }
};
```

## 🚀 **Despliegue y Configuración**

### **Variables de Entorno Requeridas**
```bash
SENDGRID_API_KEY=tu_api_key
FROM_EMAIL=noreply@tudominio.com
TWILIO_ACCOUNT_SID=tu_sid
TWILIO_AUTH_TOKEN=tu_token
TWILIO_PHONE_NUMBER=whatsapp:+14155238886
```

### **URLs de Producción**
- **Render**: `https://tu-app.onrender.com`
- **Railway**: `https://tu-app.railway.app`
- **Heroku**: `https://tu-app.herokuapp.com`

## 📞 **Soporte**

- **Documentación**: Este archivo
- **Issues**: GitHub del proyecto
- **Email**: tu-email@dominio.com

¡Tu app móvil estará funcionando con el backend en minutos! 🎉
