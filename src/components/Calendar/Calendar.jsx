import React, { useState, useMemo } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEvents } from '../../contexts/EventContext';
import SimpleEventForm from '../EventForm/SimpleEventForm';
import SimpleEventDetails from './SimpleEventDetails';

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

  // Calendar state management

  // Convertir eventos al formato del calendario
  const calendarEvents = useMemo(() => {
    return events.map(event => {
      // Extraer solo la fecha (sin la parte de tiempo)
      const dateOnly = event.date.split('T')[0];
      
      let startDate, endDate;
      
      if (event.is_all_day || !event.time) {
        // Evento de todo el día
        startDate = new Date(`${dateOnly}T00:00:00`);
        endDate = new Date(`${dateOnly}T23:59:59`);
      } else {
        // Evento con hora específica
        startDate = new Date(`${dateOnly}T${event.time}:00`);
        endDate = new Date(`${dateOnly}T${event.end_time || event.time}:00`);
      }
      
      return {
        id: event.id,
        title: event.title,
        start: startDate,
        end: endDate,
        resource: event,
      };
    });
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header del calendario */}
      <div style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e2e8f0', 
        padding: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
          alignItems: window.innerWidth < 768 ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: window.innerWidth < 768 ? '1rem' : '0.75rem'
        }}>
          <h1 style={{
            fontSize: window.innerWidth < 768 ? '1.25rem' : '1.5rem',
            fontWeight: 'bold',
            color: '#1e293b',
            margin: 0
          }}>
            📅 Mi Calendario
          </h1>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: window.innerWidth < 768 ? 'column' : 'row',
            gap: '0.75rem', 
            alignItems: 'center',
            width: window.innerWidth < 768 ? '100%' : 'auto'
          }}>
            {selectedDateForDelete && (
              <span style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                backgroundColor: '#f3f4f6',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                textAlign: 'center',
                width: window.innerWidth < 768 ? '100%' : 'auto'
              }}>
                📅 {selectedDateForDelete}
              </span>
            )}
            
            {selectedDateForDelete && (() => {
              const eventsOnDate = events.filter(event => {
                const eventDate = event.date.split('T')[0];
                return eventDate === selectedDateForDelete;
              });
              
              return eventsOnDate.length > 0 ? (
                <button
                  onClick={handleDeleteEventsFromDate}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
                    transition: 'all 0.2s ease',
                    width: window.innerWidth < 768 ? '100%' : 'auto'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                >
                  🗑️ Eliminar ({eventsOnDate.length})
                </button>
              ) : null;
            })()}
            
            <button
              onClick={() => setShowEventForm(true)}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s ease',
                width: window.innerWidth < 768 ? '100%' : 'auto'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
              ➕ Nuevo Evento
            </button>
          </div>
        </div>
      </div>

      {/* Calendario principal */}
      <div style={{ 
        flex: 1, 
        padding: window.innerWidth < 768 ? '0.5rem' : '1.5rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb',
          height: '100%',
          minHeight: window.innerWidth < 768 ? '400px' : '600px',
          overflow: 'hidden'
        }}>
                <BigCalendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%', minHeight: '600px' }}
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
      </div>

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
