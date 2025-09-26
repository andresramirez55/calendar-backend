import axios from 'axios';

// Configuración base de la API
const getApiUrl = () => {
  // Si estamos en desarrollo, usar localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:8080';
  }
  
  // Si hay una variable de entorno específica, usarla
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'BACKEND_NOT_CONFIGURED') {
    return import.meta.env.VITE_API_URL;
  }
  
  // En producción, usar el backend en Railway
  return 'https://web-production-e67c7.up.railway.app';
};

// Log para debug
console.log('API URL:', getApiUrl());
console.log('Environment:', import.meta.env.MODE);
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('VITE_API_URL type:', typeof import.meta.env.VITE_API_URL);
console.log('VITE_API_URL length:', import.meta.env.VITE_API_URL?.length);

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores y HTML responses
api.interceptors.response.use(
  (response) => {
    // Verificar si la respuesta es HTML en lugar de JSON
    if (response.data && typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
      console.error('❌ Backend returned HTML instead of JSON - Backend not available');
      console.error('❌ Response data:', response.data.substring(0, 200) + '...');
      throw new Error('BACKEND_NOT_AVAILABLE');
    }
    
    console.log('✅ Response successful:', response.status, typeof response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data);
    console.error('❌ Error details:', error.message);
    
    // Si es error de red o 404, considerar backend no disponible
    if (error.code === 'ERR_NETWORK' || 
        (error.response && error.response.status === 404)) {
      console.warn('⚠️ Network error or 404 - Backend not available');
      throw new Error('BACKEND_NOT_AVAILABLE');
    }
    
    return Promise.reject(error);
  }
);

// Servicios de eventos
export const eventService = {
  // Obtener todos los eventos
  getAllEvents: async (params = {}) => {
    const response = await api.get('/api/v1/events/', { params });
    return response.data;
  },

  // Obtener evento por ID
  getEventById: async (id) => {
    const response = await api.get(`/api/v1/events/${id}`);
    return response.data;
  },

  // Crear nuevo evento
  createEvent: async (eventData) => {
    console.log('Creating event with data:', eventData);
    console.log('API URL:', getApiUrl());
    const response = await api.post('/api/v1/events/', eventData);
    console.log('Event creation response:', response);
    return response.data;
  },

  // Actualizar evento
  updateEvent: async (id, eventData) => {
    const response = await api.put(`/api/v1/events/${id}`, eventData);
    return response.data;
  },

  // Eliminar evento
  deleteEvent: async (id) => {
    const response = await api.delete(`/api/v1/events/${id}`);
    return response.data;
  },

  // Buscar eventos
  searchEvents: async (query) => {
    const response = await api.get('/api/v1/events/', {
      params: { search: query }
    });
    return response.data;
  },

  // Obtener eventos por fecha
  getEventsByDate: async (date) => {
    const response = await api.get('/api/v1/events/', {
      params: { date }
    });
    return response.data;
  },

  // Obtener eventos por rango de fechas
  getEventsByDateRange: async (startDate, endDate) => {
    const response = await api.get('/api/v1/events/', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },
};

// Servicios móviles
export const mobileService = {
  // Obtener eventos de hoy
  getTodayEvents: async () => {
    const response = await api.get('/api/mobile/events/today');
    return response.data;
  },

  // Obtener eventos próximos
  getUpcomingEvents: async () => {
    const response = await api.get('/api/mobile/events/upcoming');
    return response.data;
  },

  // Obtener estadísticas
  getStats: async () => {
    const response = await api.get('/api/mobile/stats');
    return response.data;
  },
};

// Health check
export const healthService = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
