import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const EventDetails = ({ event, onClose, onEdit }) => {
  if (!event) return null;

  const formatDateTime = (date, time) => {
    if (!date || !time) return 'No especificado';
    const dateTime = new Date(`${date}T${time}`);
    return format(dateTime, 'PPP p', { locale: es });
  };

  const formatTime = (time) => {
    if (!time) return 'No especificado';
    return time;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
        maxWidth: '28rem',
        width: '100%',
        margin: '0 1rem'
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1e293b'
            }}>
              Detalles del Evento
            </h3>
            <button
              onClick={onClose}
              style={{
                color: '#9ca3af',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.5rem'
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div style={{ padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Título */}
            <div>
              <label className="label">Título</label>
              <p style={{ color: '#1e293b', fontWeight: '500' }}>{event.title}</p>
            </div>

            {/* Descripción */}
            {event.description && (
              <div>
                <label className="label">Descripción</label>
                <p style={{ color: '#374151' }}>{event.description}</p>
              </div>
            )}

            {/* Fecha y hora */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <div>
                <label className="label">Fecha</label>
                <p style={{ color: '#374151' }}>{formatDateTime(event.date, event.time)}</p>
              </div>
              
              {event.end_time && (
                <div>
                  <label className="label">Hora de fin</label>
                  <p style={{ color: '#374151' }}>{formatTime(event.end_time)}</p>
                </div>
              )}
            </div>

            {/* Ubicación */}
            {event.location && (
              <div>
                <label className="label">Ubicación</label>
                <p style={{ color: '#374151' }}>{event.location}</p>
              </div>
            )}

            {/* Categoría */}
            {event.category && (
              <div>
                <label className="label">Categoría</label>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.125rem 0.625rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af'
                }}>
                  {event.category}
                </span>
              </div>
            )}

            {/* Prioridad */}
            {event.priority && (
              <div>
                <label className="label">Prioridad</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  event.priority === 'high' ? 'bg-red-100 text-red-800' :
                  event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {event.priority === 'high' ? 'Alta' :
                   event.priority === 'medium' ? 'Media' : 'Baja'}
                </span>
              </div>
            )}

            {/* Email */}
            {event.email && (
              <div>
                <label className="label">Email</label>
                <p className="text-gray-700">{event.email}</p>
              </div>
            )}

            {/* Teléfono */}
            {event.phone && (
              <div>
                <label className="label">Teléfono</label>
                <p className="text-gray-700">{event.phone}</p>
              </div>
            )}

            {/* Fecha de creación */}
            <div>
              <label className="label">Creado</label>
              <p className="text-gray-500 text-sm">
                {format(new Date(event.created_at), 'PPP p', { locale: es })}
              </p>
            </div>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cerrar
          </button>
          <button
            onClick={onEdit}
            className="btn-primary"
          >
            Editar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
