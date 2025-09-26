import React, { useState } from 'react';
import moment from 'moment';

const EventListView = ({ events, onEditEvent, onDeleteEvent, onViewEvent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Filtrar eventos
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || event.priority === selectedPriority;
    
    let matchesDate = true;
    if (dateFrom) {
      const eventDate = moment(event.date).format('YYYY-MM-DD');
      matchesDate = matchesDate && eventDate >= dateFrom;
    }
    if (dateTo) {
      const eventDate = moment(event.date).format('YYYY-MM-DD');
      matchesDate = matchesDate && eventDate <= dateTo;
    }
    
    return matchesSearch && matchesCategory && matchesPriority && matchesDate;
  });

  // Obtener categorías únicas
  const categories = [...new Set(events.map(event => event.category))];
  const priorities = ['Alta', 'Media', 'Baja'];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'Media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baja': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Trabajo': return '💼';
      case 'Personal': return '👤';
      case 'Familia': return '👨‍👩‍👧‍👦';
      case 'Salud': return '🏥';
      case 'Educación': return '📚';
      case 'Entretenimiento': return '🎬';
      case 'Deportes': return '⚽';
      case 'Viajes': return '✈️';
      default: return '📅';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedPriority('all');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="w-full space-y-6">
      {/* Filtros mejorados */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Búsqueda */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Buscar eventos
            </label>
            <input
              type="text"
              placeholder="Buscar por título, descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📂 Categoría
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ⚡ Prioridad
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las prioridades</option>
              {priorities.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>

          {/* Fechas */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Desde
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Hasta
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''} encontrado{filteredEvents.length !== 1 ? 's' : ''}
          </div>
          <div className="flex gap-3">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              🗑️ Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Lista de eventos mejorada */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay eventos</h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory !== 'all' || selectedPriority !== 'all' || dateFrom || dateTo
                ? 'No se encontraron eventos con los filtros aplicados'
                : 'Crea tu primer evento para comenzar'
              }
            </p>
          </div>
        ) : (
          filteredEvents
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-blue-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header del evento */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-2xl">
                          {getCategoryIcon(event.category)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>📅 {moment(event.date).format('DD/MM/YYYY')}</span>
                            {event.time && (
                              <span>🕐 {event.time}</span>
                            )}
                            {event.end_time && event.end_time !== event.time && (
                              <span>- {event.end_time}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Descripción */}
                      {event.description && (
                        <p className="text-gray-700 mb-4 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      {/* Tags y badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(event.priority)}`}>
                          {event.priority}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium border border-blue-200">
                          {event.category}
                        </span>
                        {event.location && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium border border-gray-200">
                            📍 {event.location}
                          </span>
                        )}
                      </div>

                      {/* Información de contacto */}
                      {(event.email || event.phone) && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <div className="text-sm text-gray-600 mb-2">👥 Contacto:</div>
                          <div className="space-y-1">
                            {event.email && (
                              <div className="text-sm text-gray-700">
                                📧 {event.email}
                              </div>
                            )}
                            {event.phone && (
                              <div className="text-sm text-gray-700">
                                📱 {event.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Recordatorios */}
                      {event.reminder_day && (
                        <div className="text-sm text-gray-600">
                          🔔 Recordatorio: {event.reminder_day} día{event.reminder_day !== 1 ? 's' : ''} antes
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => onViewEvent(event)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => onEditEvent(event)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Editar evento"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDeleteEvent(event.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar evento"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default EventListView;
