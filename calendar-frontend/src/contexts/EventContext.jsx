import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { eventService } from '../services/api';
import reminderService from '../services/reminderService';

// Estado inicial
const initialState = {
  events: [],
  loading: false,
  error: null,
  selectedEvent: null,
  selectedDate: new Date(),
  view: 'month', // month, week, day
};

// Tipos de acciones
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_EVENTS: 'SET_EVENTS',
  ADD_EVENT: 'ADD_EVENT',
  UPDATE_EVENT: 'UPDATE_EVENT',
  DELETE_EVENT: 'DELETE_EVENT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_SELECTED_EVENT: 'SET_SELECTED_EVENT',
  SET_SELECTED_DATE: 'SET_SELECTED_DATE',
  SET_VIEW: 'SET_VIEW',
};

// Reducer
const eventReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ActionTypes.SET_EVENTS:
      return { ...state, events: action.payload, loading: false };
    
    case ActionTypes.ADD_EVENT:
      return { ...state, events: [...state.events, action.payload] };
    
    case ActionTypes.UPDATE_EVENT:
      return {
        ...state,
        events: state.events.map(event =>
          event.id === action.payload.id ? action.payload : event
        ),
      };
    
    case ActionTypes.DELETE_EVENT:
      return {
        ...state,
        events: state.events.filter(event => event.id !== action.payload),
      };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    case ActionTypes.SET_SELECTED_EVENT:
      return { ...state, selectedEvent: action.payload };
    
    case ActionTypes.SET_SELECTED_DATE:
      return { ...state, selectedDate: action.payload };
    
    case ActionTypes.SET_VIEW:
      return { ...state, view: action.payload };
    
    default:
      return state;
  }
};

// Contexto
const EventContext = createContext();

// Provider
export const EventProvider = ({ children }) => {
  const [state, dispatch] = useReducer(eventReducer, initialState);

  // Acciones
  const actions = {
    setLoading: (loading) => dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),
    
    setEvents: (events) => dispatch({ type: ActionTypes.SET_EVENTS, payload: events }),
    
    addEvent: (event) => dispatch({ type: ActionTypes.ADD_EVENT, payload: event }),
    
    updateEvent: (event) => dispatch({ type: ActionTypes.UPDATE_EVENT, payload: event }),
    
    deleteEvent: (eventId) => dispatch({ type: ActionTypes.DELETE_EVENT, payload: eventId }),
    
    setError: (error) => dispatch({ type: ActionTypes.SET_ERROR, payload: error }),
    
    clearError: () => dispatch({ type: ActionTypes.CLEAR_ERROR }),
    
    setSelectedEvent: (event) => dispatch({ type: ActionTypes.SET_SELECTED_EVENT, payload: event }),
    
    setSelectedDate: (date) => dispatch({ type: ActionTypes.SET_SELECTED_DATE, payload: date }),
    
    setView: (view) => dispatch({ type: ActionTypes.SET_VIEW, payload: view }),
  };

  // Funciones de API con useCallback para optimización y mejor manejo de errores
  const fetchEvents = useCallback(async () => {
    try {
      actions.setLoading(true);
      actions.clearError();
      
      const response = await eventService.getAllEvents();
      
      // Asegurar que la respuesta sea un array
      let events = [];
      if (Array.isArray(response)) {
        events = response;
      } else if (response && Array.isArray(response.events)) {
        events = response.events;
      } else if (response && Array.isArray(response.data)) {
        events = response.data;
      } else {
        console.warn('Unexpected API response format:', response);
        events = [];
      }
      
      // Validar que los eventos tengan la estructura correcta
      const validEvents = events.filter(event => {
        return event && 
               typeof event === 'object' && 
               event.id && 
               event.title && 
               event.date &&
               typeof event.date === 'string' &&
               event.date.trim() !== '';
      });
      
      if (validEvents.length !== events.length) {
        console.warn('Some events were filtered out due to invalid structure');
      }
      
      actions.setEvents(validEvents);
      actions.setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      
      // Determinar el tipo de error y mostrar mensaje apropiado
      let errorMessage = 'Error desconocido al cargar eventos';
      
      if (error.message === 'BACKEND_NOT_AVAILABLE' || (error.message && error.message.includes('HTML en lugar de JSON'))) {
        errorMessage = 'Modo de demostración activado';
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        errorMessage = 'Sin conexión a internet. Verifica tu conexión y vuelve a intentar.';
      } else if (error.response?.status === 404) {
        errorMessage = 'El servicio no está disponible. Intenta más tarde.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Error del servidor. Nuestro equipo está trabajando para solucionarlo.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      actions.setError(errorMessage);
      
      // Datos de demostración temporal para mostrar funcionalidad
      const demoEvents = [
        {
          id: 1,
          title: "Cumpleaños de María",
          description: "Cumpleaños de nuestra hija María",
          date: "2025-10-15T00:00:00Z",
          time: "00:00",
          location: "Casa",
          email: "papa@familia.com",
          phone: "+1234567890",
          is_all_day: true,
          color: "#f97316",
          priority: "high",
          category: "birthday",
          share_with: "both",
          kids_involved: ["María"],
          is_family_event: true
        },
        {
          id: 2,
          title: "Cita médica - Sofía",
          description: "Revisión pediátrica",
          date: "2025-09-30T14:00:00Z",
          time: "14:00",
          location: "Clínica San José",
          email: "mama@familia.com",
          phone: "+1234567891",
          is_all_day: false,
          color: "#ef4444",
          priority: "high",
          category: "medical",
          share_with: "both",
          kids_involved: ["Sofía"],
          is_family_event: true
        },
        {
          id: 3,
          title: "Actividad escolar - Ana",
          description: "Presentación de proyecto",
          date: "2025-10-05T09:00:00Z",
          time: "09:00",
          location: "Escuela Primaria",
          email: "papa@familia.com",
          phone: "+1234567890",
          is_all_day: false,
          color: "#8b5cf6",
          priority: "medium",
          category: "school",
          share_with: "both",
          kids_involved: ["Ana"],
          is_family_event: true
        },
        {
          id: 4,
          title: "Reunión familiar",
          description: "Almuerzo familiar dominical",
          date: "2025-10-06T12:00:00Z",
          time: "12:00",
          location: "Casa de los abuelos",
          email: "mama@familia.com",
          phone: "+1234567891",
          is_all_day: false,
          color: "#10b981",
          priority: "medium",
          category: "family",
          share_with: "both",
          kids_involved: ["María", "Sofía", "Ana", "Lucía"],
          is_family_event: true
        }
      ];
      
      actions.setEvents(demoEvents);
      
      actions.setLoading(false);
    }
  }, [actions]);

  const createEvent = useCallback(async (eventData) => {
    // Validar datos antes de enviar
    if (!eventData.title || !eventData.date) {
      throw new Error('Título y fecha son requeridos');
    }
    
    // Asegurar que la fecha tenga el formato correcto para el backend
    let formattedDate = eventData.date;
    if (formattedDate) {
      // Si viene en formato ISO, extraer solo la fecha
      if (formattedDate.includes('T')) {
        formattedDate = formattedDate.split('T')[0];
      }
      // Si viene en formato Date, convertir a YYYY-MM-DD
      if (formattedDate instanceof Date) {
        formattedDate = formattedDate.toISOString().split('T')[0];
      }
    } else {
      formattedDate = new Date().toISOString().split('T')[0];
    }

    const validatedEventData = {
      ...eventData,
      date: formattedDate, // Formato YYYY-MM-DD para el backend
      time: eventData.time || '10:00', // Hora requerida por el backend
      title: eventData.title.trim(),
      description: eventData.description?.trim() || '',
      location: eventData.location?.trim() || '',
      email: eventData.email?.trim() || 'demo@ejemplo.com',
      phone: eventData.phone?.trim() || '1234567890',
      category: eventData.category || 'personal',
      priority: eventData.priority || 'medium',
      reminder_day: Boolean(eventData.reminder_day),
      reminder_day_before: Boolean(eventData.reminder_day_before),
      is_all_day: Boolean(eventData.is_all_day),
      color: eventData.color || '#007AFF'
    };

    try {
      actions.setLoading(true);
      
      const response = await eventService.createEvent(validatedEventData);
      
      // Manejar diferentes estructuras de respuesta
      let event;
      if (response && response.event) {
        event = response.event;
      } else if (response && response.data) {
        event = response.data;
      } else if (response && response.id) {
        event = response;
      } else {
        console.warn('Unexpected response structure:', response);
        event = response;
      }
      
      // Validar que el evento tenga la estructura correcta antes de agregarlo
      if (event && typeof event === 'object' && event.id && event.title && event.date) {
        actions.addEvent(event);
        
        // Agregar recordatorios si están habilitados (con verificación segura)
        if (event.reminder_day) {
          reminderService.addReminder(event, 'day');
        }
        if (event.reminder_day_before) {
          reminderService.addReminder(event, 'day_before');
        }
      } else {
        console.error('Invalid event structure received:', event);
        
        // Verificar si la respuesta es HTML (backend no disponible)
        if (typeof event === 'string' && event.includes('<!doctype html>')) {
          console.warn('Backend returned HTML, using demo mode');
          // Crear un evento demo temporal
          const demoEvent = {
            id: Date.now(),
            title: validatedEventData.title,
            date: validatedEventData.date,
            time: validatedEventData.time,
            location: validatedEventData.location,
            email: validatedEventData.email,
            phone: validatedEventData.phone,
            description: validatedEventData.description,
            category: validatedEventData.category,
            priority: validatedEventData.priority,
            reminder_day: validatedEventData.reminder_day,
            reminder_day_before: validatedEventData.reminder_day_before,
            is_all_day: validatedEventData.is_all_day,
            color: validatedEventData.color,
            is_demo: true
          };
          actions.addEvent(demoEvent);
          return { event: demoEvent, is_demo: true };
        }
        
        throw new Error('Estructura de evento inválida recibida del servidor');
      }
      
      actions.setLoading(false);
      return response;
    } catch (error) {
      console.error('Error creating event:', error);
      
      // Manejar errores específicos del backend
      let errorMessage = 'Error al crear evento';
      
      // Si el backend no está disponible, crear evento en modo demo
      if (error.message === 'BACKEND_NOT_AVAILABLE') {
        console.warn('Backend not available, creating demo event');
        const demoEvent = {
          id: Date.now(),
          title: validatedEventData?.title || eventData.title,
          date: validatedEventData?.date || eventData.date,
          time: validatedEventData?.time || eventData.time || '10:00',
          location: validatedEventData?.location || eventData.location || '',
          email: validatedEventData?.email || eventData.email || 'demo@ejemplo.com',
          phone: validatedEventData?.phone || eventData.phone || '1234567890',
          description: validatedEventData?.description || eventData.description || '',
          category: validatedEventData?.category || eventData.category || 'personal',
          priority: validatedEventData?.priority || eventData.priority || 'medium',
          reminder_day: validatedEventData?.reminder_day || eventData.reminder_day || true,
          reminder_day_before: validatedEventData?.reminder_day_before || eventData.reminder_day_before || true,
          is_all_day: validatedEventData?.is_all_day || eventData.is_all_day || false,
          color: validatedEventData?.color || eventData.color || '#007AFF',
          is_demo: true
        };
        actions.addEvent(demoEvent);
        actions.setLoading(false);
        
        // Mostrar mensaje de modo demo
        actions.setError('💡 Modo demo activado - Backend no disponible. El evento se guardó localmente.');
        
        // No lanzar error, retornar el evento demo
        return { event: demoEvent, is_demo: true };
      }
      
      if (error.response) {
        // Error de respuesta del servidor
        const status = error.response.status;
        const data = error.response.data;
        
        console.error('Backend error:', status, data);
        
        if (status === 400) {
          // Error de validación
          if (data && data.error) {
            errorMessage = `Error del servidor: ${data.error}`;
          } else {
            errorMessage = 'Error de validación: Datos incorrectos';
          }
        } else if (status === 500) {
          errorMessage = 'Error interno del servidor';
        } else {
          errorMessage = `Error del servidor (${status}): ${data?.error || error.message}`;
        }
      } else {
        // Otros errores
        errorMessage = `Error al crear evento: ${error.message}`;
      }
      
      actions.setError(errorMessage);
      actions.setLoading(false);
      throw error;
    }
  }, [actions]);

  const updateEvent = useCallback(async (id, eventData) => {
    try {
      actions.setLoading(true);
      const updatedEvent = await eventService.updateEvent(id, eventData);
      actions.updateEvent(updatedEvent);
      actions.setLoading(false);
      return updatedEvent;
    } catch (error) {
      actions.setError(error.message);
      actions.setLoading(false);
      throw error;
    }
  }, [actions]);

  const deleteEvent = useCallback(async (id) => {
    try {
      actions.setLoading(true);
      await eventService.deleteEvent(id);

      // Limpiar recordatorios del evento eliminado
      reminderService.cleanupReminders(id);

      actions.deleteEvent(id);
      actions.setLoading(false);
    } catch (error) {
      actions.setError(error.message);
      actions.setLoading(false);
      throw error;
    }
  }, [actions]);

  const searchEvents = async (query) => {
    try {
      actions.setLoading(true);
      const events = await eventService.searchEvents(query);
      actions.setEvents(events);
      actions.setLoading(false);
    } catch (error) {
      actions.setError(error.message);
      actions.setLoading(false);
    }
  };

  const getEventsByDate = async (date) => {
    try {
      actions.setLoading(true);
      const events = await eventService.getEventsByDate(date);
      actions.setEvents(events);
      actions.setLoading(false);
    } catch (error) {
      actions.setError(error.message);
      actions.setLoading(false);
    }
  };

  const getEventsByDateRange = async (startDate, endDate) => {
    try {
      actions.setLoading(true);
      const events = await eventService.getEventsByDateRange(startDate, endDate);
      actions.setEvents(events);
      actions.setLoading(false);
    } catch (error) {
      actions.setError(error.message);
      actions.setLoading(false);
    }
  };

  // Cargar eventos al montar el componente
  useEffect(() => {
    fetchEvents();
    
    // Inicializar servicio de recordatorios
    reminderService.initialize().catch(console.error);
    
    // Cleanup al desmontar
    return () => {
      reminderService.stopReminderCheck();
    };
  }, []);

  // Memoizar el valor del contexto para evitar re-renders innecesarios
  const value = useMemo(() => ({
    ...state,
    ...actions,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    searchEvents,
    getEventsByDate,
    getEventsByDateRange,
  }), [state, actions, fetchEvents, createEvent, updateEvent, deleteEvent, searchEvents, getEventsByDate, getEventsByDateRange]);

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};

// Hook personalizado
export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};

export default EventContext;
