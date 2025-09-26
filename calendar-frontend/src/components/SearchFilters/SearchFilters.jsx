import React, { useState } from 'react';
import { useEvents } from '../../contexts/EventContext';

const SearchFilters = ({ onSearch, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const categories = [
    { value: '', label: 'Todas las categorías' },
    { value: 'work', label: 'Trabajo' },
    { value: 'personal', label: 'Personal' },
    { value: 'meeting', label: 'Reunión' },
    { value: 'appointment', label: 'Cita' },
    { value: 'reminder', label: 'Recordatorio' },
    { value: 'other', label: 'Otro' }
  ];

  const priorities = [
    { value: '', label: 'Todas las prioridades' },
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' }
  ];

  const handleSearch = () => {
    onSearch({
      term: searchTerm,
      category: categoryFilter,
      priority: priorityFilter,
      dateRange
    });
  };

  const handleClear = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setPriorityFilter('');
    setDateRange({ start: '', end: '' });
    onSearch({
      term: '',
      category: '',
      priority: '',
      dateRange: { start: '', end: '' }
    });
  };

  return (
    <div className="card mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <label className="label">Buscar eventos</label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
              placeholder="Buscar por título, descripción..."
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="lg:w-48">
          <label className="label">Categoría</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div className="lg:w-48">
          <label className="label">Prioridad</label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input-field"
          >
            {priorities.map(priority => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="lg:w-48">
          <label className="label">Desde</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="input-field"
          />
        </div>

        <div className="lg:w-48">
          <label className="label">Hasta</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="input-field"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col justify-end space-y-2 lg:space-y-0 lg:space-x-2 lg:flex-row">
          <button
            onClick={handleSearch}
            className="btn-primary"
          >
            🔍 Buscar
          </button>
          <button
            onClick={handleClear}
            className="btn-secondary"
          >
            🗑️ Limpiar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
