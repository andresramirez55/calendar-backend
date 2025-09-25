import React, { useState } from 'react';
import { useEvents } from '../../contexts/EventContext';

const SimpleEventDetails = ({ event, onClose, onEdit }) => {
  const { deleteEvent } = useEvents();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      setDeleting(true);
      
      try {
        await deleteEvent(event.id);
        onClose();
      } catch (error) {
        console.error('Error deleting event:', error);
        alert(`Error al eliminar el evento: ${error.message || 'Error desconocido'}`);
      } finally {
        setDeleting(false);
      }
    }
  };

  if (!event) return null;

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
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1e293b',
            margin: 0
          }}>
            Detalles del Evento
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <strong>Título:</strong> {event.title}
            </div>
            
            {event.description && (
              <div>
                <strong>Descripción:</strong> {event.description}
              </div>
            )}
            
            <div>
              <strong>Fecha:</strong> {event.date}
            </div>
            
            <div>
              <strong>Hora:</strong> {event.time}
            </div>
            
            {event.location && (
              <div>
                <strong>Ubicación:</strong> {event.location}
              </div>
            )}
            
            {event.email && (
              <div>
                <strong>Email:</strong> {event.email}
              </div>
            )}
            
            {event.phone && (
              <div>
                <strong>Teléfono:</strong> {event.phone}
              </div>
            )}
            
            {event.category && (
              <div>
                <strong>Categoría:</strong> {event.category}
              </div>
            )}
            
            {event.priority && (
              <div>
                <strong>Prioridad:</strong> {event.priority}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem'
        }}>
          {/* Botón Eliminar */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              backgroundColor: deleting ? '#9ca3af' : '#ef4444',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: deleting ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              minWidth: '120px'
            }}
          >
            {deleting ? 'Eliminando...' : '🗑️ Eliminar'}
          </button>
          
          {/* Botones Cerrar y Editar */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#e2e8f0',
                color: '#1e293b',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              Cerrar
            </button>
            <button
              onClick={onEdit}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              ✏️ Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleEventDetails;
