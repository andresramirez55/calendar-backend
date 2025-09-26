import React, { useState, useEffect } from 'react';
import { useEvents } from '../../contexts/EventContext';
import { format } from 'date-fns';
import { getFamilyCategories, getSharingOptions, getEventTemplates } from '../../config/familyConfig';

const EventForm = ({ event, onClose }) => {
  const { createEvent, updateEvent, loading } = useEvents();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    end_time: '',
    location: '',
    category: '',
    priority: 'medium',
    email: '',
    phone: '',
    reminder_day: false,
    reminder_day_before: false,
    // Nuevos campos familiares
    share_with: 'both', // both, parent1, parent2, private
    kids_involved: [], // Array de nombres de niñas
    is_family_event: true,
    template: ''
  });

  const [errors, setErrors] = useState({});

  // Inicializar formulario
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: event.date || '',
        time: event.time || '',
        end_time: event.end_time || '',
        location: event.location || '',
        category: event.category || '',
        priority: event.priority || 'medium',
        email: event.email || '',
        phone: event.phone || '',
        reminder_day: event.reminder_day || false,
        reminder_day_before: event.reminder_day_before || false,
        share_with: event.share_with || 'both',
        kids_involved: event.kids_involved || [],
        is_family_event: event.is_family_event !== false,
        template: event.template || ''
      });
    } else {
      // Valores por defecto para nuevo evento
      const today = format(new Date(), 'yyyy-MM-dd');
      const now = format(new Date(), 'HH:mm');
      setFormData({
        title: '',
        description: '',
        date: today,
        time: now,
        end_time: '',
        location: '',
        category: '',
        priority: 'medium',
        email: '',
        phone: '',
        reminder_day: false,
        reminder_day_before: false,
        share_with: 'both',
        kids_involved: [],
        is_family_event: true,
        template: ''
      });
    }
  }, [event]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validar formulario con validaciones mejoradas
  const validateForm = () => {
    const newErrors = {};

    // Validar título
    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'El título debe tener al menos 3 caracteres';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'El título no puede exceder 100 caracteres';
    }

    // Validar fecha
    if (!formData.date) {
      newErrors.date = 'La fecha es requerida';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'La fecha no puede ser anterior a hoy';
      }
    }

    // Validar hora
    if (!formData.time) {
      newErrors.time = 'La hora es requerida';
    }

    // Validar hora de fin
    if (formData.end_time && formData.end_time <= formData.time) {
      newErrors.end_time = 'La hora de fin debe ser posterior a la hora de inicio';
    }

    // Validar email con regex más estricto
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'El email no tiene un formato válido';
      }
    }

    // Validar teléfono con regex
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
      if (!phoneRegex.test(cleanPhone) || cleanPhone.length < 10) {
        newErrors.phone = 'El teléfono debe tener un formato válido (mínimo 10 dígitos)';
      }
    }

    // Validar descripción (opcional pero con límite)
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'La descripción no puede exceder 500 caracteres';
    }

    // Validar ubicación (opcional pero con límite)
    if (formData.location && formData.location.length > 100) {
      newErrors.location = 'La ubicación no puede exceder 100 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
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

      // Asegurar que los datos tengan el formato correcto
      const eventData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        location: formData.location?.trim() || '',
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        // Formato correcto para el backend
        date: formattedDate, // Formato YYYY-MM-DD para el backend
        time: formData.time || '00:00',
        // Valores por defecto para campos opcionales
        category: formData.category || 'other',
        priority: formData.priority || 'medium',
        reminder_day: Boolean(formData.reminder_day),
        reminder_day_before: Boolean(formData.reminder_day_before),
        is_all_day: Boolean(formData.is_all_day),
        color: formData.color || '#007AFF'
      };

      if (event) {
        await updateEvent(event.id, eventData);
      } else {
        await createEvent(eventData);
      }
      onClose();
    } catch (error) {
      console.error('Error al guardar evento:', error);
      // Mostrar mensaje de error al usuario
      alert(`Error al guardar el evento: ${error.message || 'Error desconocido'}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {event ? 'Editar Evento' : 'Nuevo Evento'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-4">
            {/* Título */}
            <div>
              <label className="label">Título *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Título del evento"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="label">Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field"
                rows={3}
                placeholder="Descripción del evento"
              />
            </div>

            {/* Fecha y hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Fecha *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`input-field ${errors.date ? 'border-red-500' : ''}`}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="label">Hora *</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className={`input-field ${errors.time ? 'border-red-500' : ''}`}
                />
                {errors.time && (
                  <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                )}
              </div>
            </div>

            {/* Hora de fin */}
            <div>
              <label className="label">Hora de fin</label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className={`input-field ${errors.end_time ? 'border-red-500' : ''}`}
              />
              {errors.end_time && (
                <p className="text-red-500 text-sm mt-1">{errors.end_time}</p>
              )}
            </div>

            {/* Ubicación */}
            <div>
              <label className="label">Ubicación</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input-field"
                placeholder="Ubicación del evento"
              />
            </div>

            {/* Categoría Familiar */}
            <div>
              <label className="label">Categoría</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Seleccionar categoría</option>
                {getFamilyCategories().map(category => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Plantillas de eventos */}
            <div>
              <label className="label">Plantilla rápida</label>
              <select
                name="template"
                value={formData.template}
                onChange={(e) => {
                  const template = getEventTemplates().find(t => t.title === e.target.value);
                  if (template) {
                    setFormData(prev => ({
                      ...prev,
                      title: template.title,
                      category: template.category,
                      is_all_day: template.isAllDay,
                      reminder_day: template.reminderDay,
                      reminder_day_before: template.reminderDayBefore,
                      color: template.color
                    }));
                  }
                }}
                className="input-field"
              >
                <option value="">Seleccionar plantilla</option>
                {getEventTemplates().map(template => (
                  <option key={template.title} value={template.title}>
                    {template.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Prioridad */}
            <div>
              <label className="label">Prioridad</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="input-field"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                placeholder="email@ejemplo.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="label">Teléfono *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="+1 234 567 8900"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Compartir con */}
            <div>
              <label className="label">Compartir con</label>
              <select
                name="share_with"
                value={formData.share_with}
                onChange={handleChange}
                className="input-field"
              >
                {Object.entries(getSharingOptions()).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Niñas involucradas */}
            <div>
              <label className="label">Niñas involucradas</label>
              <div className="space-y-2">
                {['María', 'Sofía', 'Ana', 'Lucía'].map(kid => (
                  <label key={kid} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.kids_involved.includes(kid)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            kids_involved: [...prev.kids_involved, kid]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            kids_involved: prev.kids_involved.filter(name => name !== kid)
                          }));
                        }
                      }}
                      className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">👧 {kid}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Recordatorios */}
            <div className="space-y-3">
              <label className="label">Recordatorios</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="reminder_day"
                    checked={formData.reminder_day}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Recordatorio el día del evento (1 hora antes)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="reminder_day_before"
                    checked={formData.reminder_day_before}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Recordatorio el día anterior (9:00 AM)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (event ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
