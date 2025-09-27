// Configuración familiar por defecto
export const familyConfig = {
  // Contactos familiares por defecto
  familyMembers: [
    {
      id: 'parent1',
      name: 'Papá',
      email: 'papa@familia.com',
      phone: '+1234567890',
      role: 'papa',
      color: '#3b82f6'
    },
    {
      id: 'parent2', 
      name: 'Mamá',
      email: 'mama@familia.com',
      phone: '+1234567891',
      role: 'mama',
      color: '#ec4899'
    }
  ],

  // Categorías familiares
  familyCategories: [
    { value: 'kids', label: 'Niñas', icon: '👧', color: '#f59e0b' },
    { value: 'family', label: 'Familiar', icon: '👨‍👩‍👧‍👦', color: '#10b981' },
    { value: 'birthday', label: 'Cumpleaños', icon: '🎂', color: '#f97316' },
    { value: 'school', label: 'Escuela', icon: '🎒', color: '#8b5cf6' },
    { value: 'medical', label: 'Médico', icon: '🏥', color: '#ef4444' },
    { value: 'activities', label: 'Actividades', icon: '⚽', color: '#06b6d4' },
    { value: 'work', label: 'Trabajo', icon: '💼', color: '#6366f1' },
    { value: 'other', label: 'Otro', icon: '📝', color: '#6b7280' }
  ],

  // Configuración de compartir
  sharingOptions: {
    shareWithBoth: 'Ambos padres',
    shareWithParent1: 'Solo con papá',
    shareWithParent2: 'Solo con mamá',
    private: 'Privado'
  },

  // Plantillas de eventos familiares
  eventTemplates: [
    {
      title: 'Cumpleaños de {name}',
      category: 'birthday',
      isAllDay: true,
      reminderDay: true,
      reminderDayBefore: true,
      color: '#f97316'
    },
    {
      title: 'Cita médica - {name}',
      category: 'medical',
      reminderDay: true,
      color: '#ef4444'
    },
    {
      title: 'Actividad escolar - {name}',
      category: 'school',
      reminderDay: true,
      color: '#8b5cf6'
    },
    {
      title: 'Reunión familiar',
      category: 'family',
      isAllDay: true,
      reminderDay: true,
      color: '#10b981'
    }
  ]
};

// Función para obtener contactos por defecto
export const getDefaultContacts = () => {
  return familyConfig.familyMembers;
};

// Función para obtener categorías familiares
export const getFamilyCategories = () => {
  return familyConfig.familyCategories;
};

// Función para obtener opciones de compartir
export const getSharingOptions = () => {
  return familyConfig.sharingOptions;
};

// Función para obtener plantillas de eventos
export const getEventTemplates = () => {
  return familyConfig.eventTemplates;
};
