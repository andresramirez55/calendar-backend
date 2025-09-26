import React, { useState, useMemo } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEvents } from '../../contexts/EventContext';
import SimpleEventForm from '../EventForm/SimpleEventForm';
import SimpleEventDetails from './SimpleEventDetails';
import EventListView from './EventListView';

// Configurar moment para el calendario
moment.locale('es');
const localizer = momentLocalizer(moment);

const Calendar = () => {
  const { events, selectedEvent, setSelectedEvent, setSelectedDate } = useEvents();
  const [showEventForm, setShowEventForm] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 22)); // Septiembre 2025
  const [selectedDateForDelete, setSelectedDateForDelete] = useState(null);
  const [view, setView] = useState('calendar'); // 'calendar' o 'list'

  // Calendar state management

  // Convertir eventos al formato del calendario con validación robusta
  const calendarEvents = useMemo(() => {
    // Asegurar que events sea un array
    if (!Array.isArray(events)) {
      console.warn('Events is not an array:', events);
      return [];
    }
    
    return events
      .filter(event => {
        // Validar que el evento tenga las propiedades necesarias
        return event && 
               typeof event === 'object' && 
               event.id && 
               event.title && 
               event.date &&
               typeof event.date === 'string' &&
               event.date.trim() !== '';
      })
      .map(event => {
        try {
          // Validar y limpiar la fecha
          let dateOnly;
          if (event.date.includes('T')) {
            dateOnly = event.date.split('T')[0];
          } else {
            dateOnly = event.date;
          }
          
          // Validar que la fecha sea válida
          const testDate = new Date(dateOnly);
          if (isNaN(testDate.getTime())) {
            console.warn('Invalid date for event:', event.id, event.date);
            return null;
          }
          
          let startDate, endDate;
          
          if (event.is_all_day || !event.time) {
            // Evento de todo el día
            startDate = new Date(`${dateOnly}T00:00:00`);
            endDate = new Date(`${dateOnly}T23:59:59`);
          } else {
            // Evento con hora específica
            const time = event.time || '00:00';
            const endTime = event.end_time || time;
            
            startDate = new Date(`${dateOnly}T${time}:00`);
            endDate = new Date(`${dateOnly}T${endTime}:00`);
          }
          
          // Validar que las fechas sean válidas
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.warn('Invalid start/end date for event:', event.id);
            return null;
          }
          
          return {
            id: event.id,
            title: event.title || 'Sin título',
            start: startDate,
            end: endDate,
            resource: event,
          };
        } catch (error) {
          console.error('Error processing event:', event.id, error);
          return null;
        }
      })
      .filter(event => event !== null); // Filtrar eventos nulos
  }, [events]);

  // Manejar selección de evento
  const handleSelectEvent = (event) => {
    setSelectedEvent(event.resource);
    setShowEventDetails(true);
  };

  // Manejar selección de slot (crear nuevo evento)
  const handleSelectSlot = ({ start, end }) => {
    const startDate = moment(start).format('YYYY-MM-DD');
    const startTime = moment(start).format('HH:mm');
    const endTime = moment(end).format('HH:mm');

    setSelectedDateForDelete(startDate);
    setEditingEvent({
      date: startDate,
      time: startTime,
      end_time: endTime,
    });
    setShowEventForm(true);
  };

  // Manejar selección de fecha (sin crear evento)
  const handleSelectDate = (date) => {
    const dateString = moment(date).format('YYYY-MM-DD');
    setSelectedDateForDelete(dateString);
  };

  // Manejar doble click en evento (editar)
  const handleDoubleClickEvent = (event) => {
    setEditingEvent(event.resource);
    setShowEventForm(true);
  };

  // Cerrar formulario
  const handleCloseForm = () => {
    setShowEventForm(false);
    setEditingEvent(null);
  };

  // Cerrar detalles
  const handleCloseDetails = () => {
    setShowEventDetails(false);
    setSelectedEvent(null);
  };

  // Handlers para la vista de lista
  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      try {
        // Aquí deberías llamar a tu función de eliminación del contexto
        console.log('Eliminando evento:', eventId);
        // await deleteEvent(eventId);
      } catch (error) {
        console.error('Error al eliminar evento:', error);
        alert('Error al eliminar el evento');
      }
    }
  };

  // Eliminar eventos de la fecha seleccionada
  const handleDeleteEventsFromDate = async () => {
    if (!selectedDateForDelete) {
      alert('Por favor selecciona una fecha primero');
      return;
    }

    const eventsOnDate = events.filter(event => {
      const eventDate = event.date.split('T')[0];
      return eventDate === selectedDateForDelete;
    });

    if (eventsOnDate.length === 0) {
      alert(`No hay eventos en la fecha ${selectedDateForDelete}`);
      return;
    }

    const confirmMessage = `¿Estás seguro de que quieres eliminar ${eventsOnDate.length} evento(s) de la fecha ${selectedDateForDelete}?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const { deleteEvent } = useEvents();
      
      for (const event of eventsOnDate) {
        await deleteEvent(event.id);
      }
      
      alert(`Se eliminaron ${eventsOnDate.length} evento(s) de la fecha ${selectedDateForDelete}`);
    } catch (error) {
      console.error('Error deleting events:', error);
      alert(`Error al eliminar los eventos: ${error.message}`);
    }
  };

  // Estilos personalizados para eventos
  const eventStyleGetter = (event) => {
    const backgroundColor = event.resource?.color || '#3b82f6';
    const priority = event.resource?.priority || 'medium';
    
    // Colores basados en prioridad
    let eventColor = backgroundColor;
    if (priority === 'high') eventColor = '#ef4444';
    else if (priority === 'medium') eventColor = '#f59e0b';
    else if (priority === 'low') eventColor = '#10b981';
    
    return {
      style: {
        backgroundColor: eventColor,
        borderRadius: '8px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: window.innerWidth < 768 ? '0.75rem' : '0.85rem',
        padding: '2px 6px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        fontWeight: '500',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
      },
    };
  };

  return (
    <div className="w-full">
      {/* Solo controles específicos del calendario */}
      {selectedDateForDelete && (
        <div className="flex items-center gap-2 mb-4 p-4 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-lg border">
            📅 {selectedDateForDelete}
          </span>
          {(() => {
            const eventsOnDate = events.filter(event => {
              const eventDate = event.date.split('T')[0];
              return eventDate === selectedDateForDelete;
            });
            
            return eventsOnDate.length > 0 ? (
              <button
                onClick={handleDeleteEventsFromDate}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-lg text-sm transition-colors"
              >
                🗑️ Eliminar ({eventsOnDate.length})
              </button>
            ) : null;
          })()}
        </div>
      )}

      {/* Contenido principal según la vista */}
      {view === 'calendar' && (
        <div className="calendar-container">
          <BigCalendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '600px', width: '100%', minWidth: '100%' }}
                  onSelectEvent={handleSelectEvent}
                  onSelectSlot={handleSelectSlot}
                  onDoubleClickEvent={handleDoubleClickEvent}
                  onNavigate={setCurrentDate}
                  selectable
                  eventPropGetter={eventStyleGetter}
                  date={currentDate}
                  messages={{
                    next: 'Siguiente',
                    previous: 'Anterior',
                    today: 'Hoy',
                    month: 'Mes',
                    week: 'Semana',
                    day: 'Día',
                    agenda: 'Agenda',
                    date: 'Fecha',
                    time: 'Hora',
                    event: 'Evento',
                    noEventsInRange: 'No hay eventos en este rango',
                    showMore: (total) => `+ Ver más (${total})`,
                  }}
                  culture="es"
                  views={['month', 'week', 'day']}
                  defaultView="month"
                  step={60}
                  timeslots={1}
                  components={{
                    dateCellWrapper: ({ children, value }) => (
                      <div 
                        onClick={() => handleSelectDate(value)}
                        style={{ 
                          cursor: 'pointer',
                          height: '100%',
                          width: '100%'
                        }}
                      >
                        {children}
                      </div>
                    )
                  }}
                />
        </div>
      )}

      {/* Vista de lista */}
      {view === 'list' && (
        <EventListView
          events={events}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
          onViewEvent={handleViewEvent}
        />
      )}

      {/* Vista de estadísticas */}
      {view === 'stats' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Estadísticas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-600">{events.length}</div>
              <div className="text-blue-800">Total de eventos</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-600">
                {events.filter(event => moment(event.date).isAfter(moment())).length}
              </div>
              <div className="text-green-800">Eventos futuros</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-purple-600">
                {[...new Set(events.map(event => event.category))].length}
              </div>
              <div className="text-purple-800">Categorías</div>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de evento */}
      {showEventForm && (
        <SimpleEventForm
          event={editingEvent}
          onClose={handleCloseForm}
        />
      )}

      {/* Detalles del evento */}
      {showEventDetails && selectedEvent && (
        <SimpleEventDetails
          event={selectedEvent}
          onClose={handleCloseDetails}
          onEdit={() => {
            setEditingEvent(selectedEvent);
            setShowEventDetails(false);
            setShowEventForm(true);
          }}
        />
      )}
    </div>
  );
};

export default Calendar;
