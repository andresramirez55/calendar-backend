import React from 'react';

const ViewToggle = ({ currentView, onViewChange }) => {
  const views = [
    { id: 'calendar', label: 'Calendario', icon: '📅' },
    { id: 'list', label: 'Lista', icon: '📋' },
    { id: 'stats', label: 'Estadísticas', icon: '📊' }
  ];

  return (
    <div className="view-toggle">
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={currentView === view.id ? 'active' : ''}
        >
          <span>{view.icon}</span>
          <span>{view.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ViewToggle;
