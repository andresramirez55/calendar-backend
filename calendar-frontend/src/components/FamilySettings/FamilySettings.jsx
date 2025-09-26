import React, { useState } from 'react';
import { getDefaultContacts } from '../../config/familyConfig';

const FamilySettings = ({ onClose }) => {
  const [familyMembers, setFamilyMembers] = useState(getDefaultContacts());
  const [kids, setKids] = useState(['María', 'Sofía', 'Ana', 'Lucía']);

  const handleSave = () => {
    // Aquí guardarías la configuración en localStorage o en el backend
    localStorage.setItem('familyMembers', JSON.stringify(familyMembers));
    localStorage.setItem('kids', JSON.stringify(kids));
    onClose();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        overflow: 'hidden'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 10000
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              👨‍👩‍👧‍👦 Configuración Familiar
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
          {/* Miembros de la familia */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
              👨‍👩‍👧‍👦 Miembros de la familia
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {familyMembers.map((member, index) => (
                <div key={member.id} style={{ padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#2563eb', fontWeight: '600', fontSize: '14px' }}>
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <h5 style={{ fontWeight: '500', color: '#111827', margin: 0 }}>Padre {index + 1}</h5>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Nombre completo</label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => {
                          const updated = [...familyMembers];
                          updated[index].name = e.target.value;
                          setFamilyMembers(updated);
                        }}
                        style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                        placeholder="Ej: Juan Pérez"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Email</label>
                      <input
                        type="email"
                        value={member.email}
                        onChange={(e) => {
                          const updated = [...familyMembers];
                          updated[index].email = e.target.value;
                          setFamilyMembers(updated);
                        }}
                        style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                        placeholder="juan@ejemplo.com"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Teléfono</label>
                      <input
                        type="tel"
                        value={member.phone}
                        onChange={(e) => {
                          const updated = [...familyMembers];
                          updated[index].phone = e.target.value;
                          setFamilyMembers(updated);
                        }}
                        style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Niñas */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
              👧 Niñas
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {kids.map((kid, index) => (
                <div key={index} style={{ padding: '8px', backgroundColor: '#fdf2f8', borderRadius: '8px', border: '1px solid #f9a8d4' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>👧</span>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Niña {index + 1}</label>
                      <input
                        type="text"
                        value={kid}
                        onChange={(e) => {
                          const updated = [...kids];
                          updated[index] = e.target.value;
                          setKids(updated);
                        }}
                        style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                        placeholder="Ej: María"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const updated = kids.filter((_, i) => i !== index);
                        setKids(updated);
                      }}
                      style={{ color: '#dc2626', padding: '4px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setKids([...kids, ''])}
                style={{ width: '100%', padding: '12px', border: '2px dashed #f9a8d4', borderRadius: '8px', color: '#ec4899', backgroundColor: 'transparent', cursor: 'pointer' }}
              >
                + Agregar niña
              </button>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb', flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 16px', color: '#4b5563', fontWeight: '500', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            style={{ padding: '8px 24px', backgroundColor: '#2563eb', color: 'white', borderRadius: '8px', fontWeight: '500', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            💾 Guardar configuración
          </button>
        </div>
      </div>
    </div>
  );
};

export default FamilySettings;
