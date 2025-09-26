import React, { memo } from 'react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const Stats = ({ events }) => {
  const now = new Date();
  const startOfCurrentMonth = startOfMonth(now);
  const endOfCurrentMonth = endOfMonth(now);

  // Calcular estadísticas
  const totalEvents = events?.length || 0;
  
  const currentMonthEvents = events?.filter(event => {
    try {
      const eventDate = parseISO(event.date);
      return isWithinInterval(eventDate, { start: startOfCurrentMonth, end: endOfCurrentMonth });
    } catch {
      return false;
    }
  }) || [];

  const eventsByCategory = currentMonthEvents.reduce((acc, event) => {
    const category = event.category || 'other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const eventsByPriority = currentMonthEvents.reduce((acc, event) => {
    const priority = event.priority || 'medium';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});

  const upcomingEvents = events?.filter(event => {
    try {
      const eventDate = parseISO(`${event.date}T${event.time || '00:00'}`);
      return eventDate > now;
    } catch {
      return false;
    }
  }).slice(0, 5) || [];

  const getCategoryName = (category) => {
    const names = {
      work: 'Trabajo',
      personal: 'Personal',
      meeting: 'Reunión',
      appointment: 'Cita',
      reminder: 'Recordatorio',
      other: 'Otro'
    };
    return names[category] || 'Otro';
  };

  const getPriorityName = (priority) => {
    const names = {
      high: 'Alta',
      medium: 'Media',
      low: 'Baja'
    };
    return names[priority] || 'Media';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-4xl mb-2">📅</div>
          <h3 className="text-2xl font-bold text-gray-900">{totalEvents}</h3>
          <p className="text-gray-600">Total de eventos</p>
        </div>
        
        <div className="card text-center">
          <div className="text-4xl mb-2">📊</div>
          <h3 className="text-2xl font-bold text-gray-900">{currentMonthEvents.length}</h3>
          <p className="text-gray-600">Este mes</p>
        </div>
        
        <div className="card text-center">
          <div className="text-4xl mb-2">⏰</div>
          <h3 className="text-2xl font-bold text-gray-900">{upcomingEvents.length}</h3>
          <p className="text-gray-600">Próximos eventos</p>
        </div>
      </div>

      {/* Estadísticas por Categoría */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Eventos por Categoría</h3>
        <div className="space-y-3">
          {Object.entries(eventsByCategory).map(([category, count]) => (
            <div key={category} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {category === 'work' ? '💼' :
                   category === 'personal' ? '👤' :
                   category === 'meeting' ? '🤝' :
                   category === 'appointment' ? '📅' :
                   category === 'reminder' ? '🔔' : '📝'}
                </span>
                <span className="font-medium text-gray-700">
                  {getCategoryName(category)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(count / currentMonthEvents.length) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-600 w-8 text-right">
                  {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estadísticas por Prioridad */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Eventos por Prioridad</h3>
        <div className="space-y-3">
          {Object.entries(eventsByPriority).map(([priority, count]) => (
            <div key={priority} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={`text-2xl ${getPriorityColor(priority)}`}>
                  {priority === 'high' ? '🔴' :
                   priority === 'medium' ? '🟡' : '🟢'}
                </span>
                <span className="font-medium text-gray-700">
                  {getPriorityName(priority)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      priority === 'high' ? 'bg-red-500' :
                      priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(count / currentMonthEvents.length) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-600 w-8 text-right">
                  {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Próximos Eventos */}
      {upcomingEvents.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Próximos Eventos</h3>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">
                  {event.category === 'work' ? '💼' :
                   event.category === 'personal' ? '👤' :
                   event.category === 'meeting' ? '🤝' :
                   event.category === 'appointment' ? '📅' :
                   event.category === 'reminder' ? '🔔' : '📝'}
                </span>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                  <p className="text-sm text-gray-600">
                    {format(parseISO(`${event.date}T${event.time || '00:00'}`), 'dd MMM yyyy, HH:mm', { locale: es })}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  event.priority === 'high' ? 'bg-red-100 text-red-800' :
                  event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {getPriorityName(event.priority)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(Stats);
