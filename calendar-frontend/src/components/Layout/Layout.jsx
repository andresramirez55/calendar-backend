import React, { useState } from 'react';
import { useEvents } from '../../contexts/EventContext';
import FamilySettings from '../FamilySettings/FamilySettings';

const Layout = ({ children }) => {
  const { loading, error, clearError } = useEvents();
  const [showFamilySettings, setShowFamilySettings] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Clean Header */}
      <header className="header">
        <div className="header-content">
          {/* Logo */}
          <div className="logo">
            <div className="logo-icon">📅</div>
            <div className="logo-text">Calendar App</div>
          </div>

          {/* Navigation */}
          <nav className="nav">
            <a href="#" className="nav-item active">Calendario</a>
            <a href="#" className="nav-item">Eventos</a>
            <a href="#" className="nav-item">Estadísticas</a>
            <button
              onClick={() => {
                console.log('🔍 Opening family settings...');
                setShowFamilySettings(true);
              }}
              className="nav-item"
            >
              👨‍👩‍👧‍👦 Familia
            </button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="w-full min-h-screen">
        <div className="w-full max-w-none">
          {children}
        </div>
      </main>

      {/* Modern Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-gray-700 font-semibold text-lg">Cargando eventos...</span>
          </div>
        </div>
      )}

      {/* Modern Error notification */}
      {error && (
        <div className={`fixed top-4 right-4 border px-6 py-4 rounded-2xl shadow-lg z-50 max-w-md animate-slideUp backdrop-blur-lg ${
          error.includes('demostración') || error.includes('HTML en lugar de JSON') 
            ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                error.includes('demostración') || error.includes('HTML en lugar de JSON')
                  ? 'bg-yellow-100'
                  : 'bg-red-100'
              }`}>
                <span className={`text-sm ${
                  error.includes('demostración') || error.includes('HTML en lugar de JSON')
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}>
                  {error.includes('demostración') || error.includes('HTML en lugar de JSON') ? '💡' : '⚠️'}
                </span>
              </div>
              <div>
                <span className="font-medium">{error}</span>
                {error.includes('demostración') && (
                  <p className="text-xs opacity-75 mt-1">
                    Los datos mostrados son de demostración
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={clearError}
              className={`ml-4 p-1 rounded-full transition-all duration-200 ${
                error.includes('demostración') || error.includes('HTML en lugar de JSON')
                  ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100'
                  : 'text-red-600 hover:text-red-800 hover:bg-red-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Configuración familiar */}
      {showFamilySettings && (
        <FamilySettings onClose={() => setShowFamilySettings(false)} />
      )}
    </div>
  );
};

export default Layout;
