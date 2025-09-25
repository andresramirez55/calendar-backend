import React from 'react';
import { useEvents } from '../../contexts/EventContext';

const Layout = ({ children }) => {
  const { loading, error, clearError } = useEvents();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
        borderBottom: '1px solid #e2e8f0' 
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            height: '64px' 
          }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h1 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 'bold', 
                color: '#3b82f6' 
              }}>
                📅 Calendar App
              </h1>
            </div>

            {/* Navigation */}
            <nav style={{ display: 'flex', gap: '2rem' }}>
              <a href="#" style={{ 
                color: '#1e293b', 
                padding: '0.5rem 0.75rem', 
                fontSize: '0.875rem', 
                fontWeight: '500',
                textDecoration: 'none'
              }}>
                Calendario
              </a>
              <a href="#" style={{ 
                color: '#64748b', 
                padding: '0.5rem 0.75rem', 
                fontSize: '0.875rem', 
                fontWeight: '500',
                textDecoration: 'none'
              }}>
                Eventos
              </a>
              <a href="#" style={{ 
                color: '#64748b', 
                padding: '0.5rem 0.75rem', 
                fontSize: '0.875rem', 
                fontWeight: '500',
                textDecoration: 'none'
              }}>
                Estadísticas
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ 
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '1.5rem 1rem' 
      }}>
        {children}
      </main>

      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '2px solid #e2e8f0',
              borderTop: '2px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span style={{ color: '#374151' }}>Cargando...</span>
          </div>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '0.75rem 1rem',
          borderRadius: '0.375rem',
          zIndex: 50,
          maxWidth: '24rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem' }}>{error}</span>
            </div>
            <button
              onClick={clearError}
              style={{
                marginLeft: '1rem',
                color: '#dc2626',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
