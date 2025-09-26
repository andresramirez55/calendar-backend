import React, { memo } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const EventList = ({ events, onEdit, onDelete, onView }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'work': return '💼';
      case 'personal': return '👤';
      case 'meeting': return '🤝';
      case 'appointment': return '📅';
      case 'reminder': return '🔔';
      case 'other': return '📝';
      default: return '📅';
    }
  };

  const formatEventDate = (date, time) => {
    try {
      const eventDate = parseISO(`${date}T${time || '00:00'}`);
      return format(eventDate, 'dd MMM yyyy, HH:mm', { locale: es });
    } catch (error) {
      return `${date} ${time || ''}`;
    }
  };

  if (!events || events.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">📅</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay eventos</h3>
        <p className="text-gray-500">Crea tu primer evento para comenzar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div
          key={event.id}
          className="card hover-lift cursor-pointer"
          onClick={() => onView && onView(event)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">
                  {getCategoryIcon(event.category)}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatEventDate(event.date, event.time)}
                  </p>
                </div>
              </div>

              {event.description && (
                <p className="text-gray-700 mb-3 line-clamp-2">
                  {event.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(event.priority)}`}>
                  {event.priority === 'high' ? 'Alta' : 
                   event.priority === 'medium' ? 'Media' : 'Baja'}
                </span>
                
                {event.category && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium border border-blue-200">
                    {event.category === 'work' ? 'Trabajo' :
                     event.category === 'personal' ? 'Personal' :
                     event.category === 'meeting' ? 'Reunión' :
                     event.category === 'appointment' ? 'Cita' :
                     event.category === 'reminder' ? 'Recordatorio' : 'Otro'}
                  </span>
                )}

                {event.location && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium border border-purple-200">
                    📍 {event.location}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {event.email && (
                  <span className="flex items-center space-x-1">
                    <span>📧</span>
                    <span>{event.email}</span>
                  </span>
                )}
                {event.phone && (
                  <span className="flex items-center space-x-1">
                    <span>📞</span>
                    <span>{event.phone}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(event);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar evento"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(event.id);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar evento"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default memo(EventList);
