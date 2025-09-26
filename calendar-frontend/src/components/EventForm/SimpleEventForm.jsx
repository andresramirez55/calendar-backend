import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useEvents } from '../../contexts/EventContext';

const SimpleEventForm = ({ event, onClose }) => {
  const { createEvent, updateEvent } = useEvents();
  // Force update - mobile optimized form - v3 - $(Date.now())
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    end_time: '',
    location: '',
    email: '',
    phone: '',
    category: 'work',
    priority: 'medium',
    reminder_day: true,
    reminder_day_before: true,
    is_all_day: false,
    // Nuevas funcionalidades familiares
    notify_family: false,
    notify_papa: false,
    notify_mama: false,
    child_tag: '',
    family_members: []
  });

  const [loading, setLoading] = useState(false);
  const [familyConfig, setFamilyConfig] = useState(null);

  // Cargar configuración familiar
  useEffect(() => {
    const savedConfig = localStorage.getItem('familyConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setFamilyConfig(config);
        setFormData(prev => ({
          ...prev,
          family_members: config.familyMembers || []
        }));
      } catch (error) {
        console.error('Error loading family config:', error);
      }
    }
  }, []);

  // Cargar datos del evento si estamos editando
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: event.date ? event.date.split('T')[0] : '',
        time: event.time || '',
        end_time: event.end_time || '',
        location: event.location || '',
        email: event.email || '',
        phone: event.phone || '',
        category: event.category || 'work',
        priority: event.priority || 'medium',
        reminder_day: Boolean(event.reminder_day),
        reminder_day_before: Boolean(event.reminder_day_before),
        is_all_day: Boolean(event.is_all_day),
        notify_family: Boolean(event.notify_family),
        notify_papa: Boolean(event.notify_papa),
        notify_mama: Boolean(event.notify_mama),
        child_tag: event.child_tag || '',
        family_members: event.family_members || []
      });
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar campos requeridos
      if (!formData.title || !formData.date) {
        alert('Por favor completa el título y la fecha del evento');
        setLoading(false);
        return;
      }


      // Formatear la fecha para el backend (YYYY-MM-DD)
      let formattedDate = formData.date;
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

      const eventData = {
        title: formData.title,
        date: formattedDate, // Formato YYYY-MM-DD para el backend
        time: '10:00', // Hora requerida por el backend
        location: formData.location || '',
        email: 'demo@ejemplo.com', // Email por defecto
        phone: '1234567890', // Teléfono por defecto
        reminder_day: formData.reminder_day,
        reminder_day_before: formData.reminder_day_before,
        is_all_day: false, // Cambiado a false para que funcione con el backend
        category: 'personal', // Categoría por defecto
        priority: 'medium', // Prioridad por defecto
        color: '#007AFF' // Color por defecto
      };

      console.log('Enviando datos:', eventData);

      if (event) {
        // Actualizar evento existente
        await updateEvent(event.id, eventData);
      } else {
        // Crear nuevo evento
        await createEvent(eventData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      alert(`Error al guardar el evento: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        overflow: 'hidden',
        touchAction: 'none'
      }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-lg w-full mx-4" 
        style={{ 
          position: 'relative',
          zIndex: 10000,
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          pointerEvents: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-3 border-b border-gray-200 flex justify-between items-center bg-white">
          <h2 className="text-lg font-semibold text-gray-900">
            {event ? 'Editar Evento' : 'Nuevo Evento'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form - SÚPER SIMPLE */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Solo los campos esenciales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">¿Qué evento vas a crear? *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Cumpleaños de María, Reunión de trabajo, Cita médica..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">¿Cuándo será? *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">¿Dónde será? (opcional)</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Casa, Oficina, Hospital..."
              />
            </div>

            {/* Recordatorios automáticos */}
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="reminder_day_before"
                  checked={formData.reminder_day_before}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-blue-800">
                  📅 Recordarme el día anterior
                </span>
              </div>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  name="reminder_day"
                  checked={formData.reminder_day}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-blue-800">
                  🔔 Recordarme el mismo día
                </span>
              </div>
            </div>

            {/* Notificaciones familiares */}
            {familyConfig && familyConfig.familyMembers && familyConfig.familyMembers.length > 0 && (
              <div className="bg-pink-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-pink-800 mb-2">👨‍👩‍👧‍👦 Notificar a la familia</h4>
                
                {/* Checkbox principal para notificar familia */}
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    name="notify_family"
                    checked={formData.notify_family}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-pink-800">
                    📱 Notificar a la familia sobre este evento
                  </span>
                </div>

                {/* Selector de familiares específicos */}
                {formData.notify_family && (
                  <div className="space-y-2">
                    {familyConfig.familyMembers.map((member, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`notify_${member.role.toLowerCase()}`}
                          checked={formData[`notify_${member.role.toLowerCase()}`] || false}
                          onChange={handleChange}
                          className="mr-2 h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-pink-800">
                          {member.role === 'papa' ? '👨' : '👩'} {member.name} ({member.email})
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Etiqueta para hijo */}
                {formData.notify_family && familyConfig.kids && familyConfig.kids.length > 0 && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-pink-700 mb-1">
                      👶 ¿Para qué hijo es este evento?
                    </label>
                    <select
                      name="child_tag"
                      value={formData.child_tag}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-pink-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
                    >
                      <option value="">Seleccionar hijo...</option>
                      {familyConfig.kids.map((kid, index) => (
                        <option key={index} value={kid.name}>
                          👶 {kid.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (event ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default SimpleEventForm;