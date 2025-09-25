import React, { createContext, useContext, useReducer, useEffect } from 'react';
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

  // Funciones de API
  const fetchEvents = async () => {
    try {
      actions.setLoading(true);
      const events = await eventService.getAllEvents();
      actions.setEvents(events);
      actions.setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      actions.setError(error.message);
      actions.setLoading(false);
    }
  };

  const createEvent = async (eventData) => {
    try {
      actions.setLoading(true);
      const newEvent = await eventService.createEvent(eventData);
      actions.addEvent(newEvent.event);
      
      // Agregar recordatorios si están habilitados
      if (newEvent.event.reminder_day) {
        reminderService.addReminder(newEvent.event, 'day');
      }
      if (newEvent.event.reminder_day_before) {
        reminderService.addReminder(newEvent.event, 'day_before');
      }
      
      actions.setLoading(false);
      return newEvent;
    } catch (error) {
      actions.setError(error.message);
      actions.setLoading(false);
      throw error;
    }
  };

  const updateEvent = async (id, eventData) => {
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
  };

  const deleteEvent = async (id) => {
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
  };

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

  const value = {
    ...state,
    ...actions,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    searchEvents,
    getEventsByDate,
    getEventsByDateRange,
  };

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
