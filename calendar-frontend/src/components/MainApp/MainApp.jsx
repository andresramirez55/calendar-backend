import React, { useState, useMemo, lazy, Suspense } from 'react';
import { useEvents } from '../../contexts/EventContext';
import SearchFilters from '../SearchFilters/SearchFilters';
import ViewToggle from '../ViewToggle/ViewToggle';
import SimpleEventForm from '../EventForm/SimpleEventForm';

// Lazy load components for better performance
const Calendar = lazy(() => import('../Calendar/Calendar'));
const EventList = lazy(() => import('../EventList/EventList'));
const Stats = lazy(() => import('../Stats/Stats'));

const MainApp = () => {
  const { events, createEvent, updateEvent, deleteEvent, searchEvents } = useEvents();
  const [currentView, setCurrentView] = useState('calendar');
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [filters, setFilters] = useState({
    term: '',
    category: '',
    priority: '',
    dateRange: { start: '', end: '' }
  });

  // Filtrar eventos basado en los filtros
  const filteredEvents = useMemo(() => {
    if (!events || !Array.isArray(events)) return [];

    return events.filter(event => {
      // Filtro por término de búsqueda
      if (filters.term) {
        const searchTerm = filters.term.toLowerCase();
        const matchesTitle = event.title?.toLowerCase().includes(searchTerm);
        const matchesDescription = event.description?.toLowerCase().includes(searchTerm);
        const matchesLocation = event.location?.toLowerCase().includes(searchTerm);
        
        if (!matchesTitle && !matchesDescription && !matchesLocation) {
          return false;
        }
      }

      // Filtro por categoría
      if (filters.category && event.category !== filters.category) {
        return false;
      }

      // Filtro por prioridad
      if (filters.priority && event.priority !== filters.priority) {
        return false;
      }

      // Filtro por rango de fechas
      if (filters.dateRange.start) {
        const eventDate = new Date(event.date);
        const startDate = new Date(filters.dateRange.start);
        if (eventDate < startDate) return false;
      }

      if (filters.dateRange.end) {
        const eventDate = new Date(event.date);
        const endDate = new Date(filters.dateRange.end);
        if (eventDate > endDate) return false;
      }

      return true;
    });
  }, [events, filters]);

  // Manejar búsqueda y filtros
  const handleSearch = (searchFilters) => {
    setFilters(searchFilters);
  };

  // Manejar creación de evento
  const handleCreateEvent = () => {
    setEditingEvent(null);
    setShowEventForm(true);
  };

  // Manejar edición de evento
  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  // Manejar eliminación de evento
  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      try {
        await deleteEvent(eventId);
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Error al eliminar el evento');
      }
    }
  };

  // Cerrar formulario
  const handleCloseForm = () => {
    setShowEventForm(false);
    setEditingEvent(null);
  };

  // Renderizar contenido basado en la vista actual
  const renderContent = () => {
    const LoadingSpinner = () => (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Cargando...</span>
      </div>
    );

    switch (currentView) {
      case 'list':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <EventList
              events={filteredEvents}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
            />
          </Suspense>
        );
      case 'stats':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Stats events={events} />
          </Suspense>
        );
      case 'calendar':
      default:
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Calendar />
          </Suspense>
        );
    }
  };

  return (
    <div className="main">
      <div className="space-y-6">
        {/* Toggle de vista */}
        <div className="flex justify-center">
          <ViewToggle
            currentView={currentView}
            onViewChange={setCurrentView}
          />
        </div>

        {/* Botón de nuevo evento - solo en vista calendario */}
        {currentView === 'calendar' && (
          <div className="flex justify-end">
            <button
              onClick={handleCreateEvent}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg"
            >
              ➕ Nuevo Evento
            </button>
          </div>
        )}

        {/* Filtros de búsqueda (solo para vista de lista) */}
        {currentView === 'list' && (
          <SearchFilters
            onSearch={handleSearch}
          />
        )}

        {/* Contenido principal */}
        <div className="w-full">
          {renderContent()}
        </div>
      </div>

      {/* Formulario de evento */}
      {showEventForm && (
        <SimpleEventForm
          event={editingEvent}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default MainApp;
