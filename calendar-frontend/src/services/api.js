import axios from 'axios';

// Configuración base de la API
const getApiUrl = () => {
  // Si estamos en desarrollo, usar localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:8080';
  }
  
  // Si hay una variable de entorno específica, usarla
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Por defecto, usar el backend en Railway
  return 'https://web-production-e67c7.up.railway.app';
};

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
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
    const response = await api.post('/api/v1/events/', eventData);
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
