# Calendar Frontend

Frontend de la aplicación de calendario desarrollado con React + Vite.

## Características

- ✅ **React + Vite** para desarrollo rápido
- ✅ **Calendario interactivo** con React Big Calendar
- ✅ **Gestión de eventos** (crear, editar, eliminar)
- ✅ **Diseño responsive** optimizado para móviles
- ✅ **Notificaciones del navegador** para recordatorios
- ✅ **Integración con backend** via API REST

## Estructura del Proyecto

```
calendar-frontend/
├── src/
│   ├── components/     # Componentes React
│   │   ├── Calendar/   # Componente principal del calendario
│   │   ├── EventForm/  # Formulario de eventos
│   │   └── Layout/     # Layout principal
│   ├── contexts/       # Context API para estado global
│   ├── services/       # Servicios de API
│   └── App.jsx         # Componente principal
├── public/             # Archivos estáticos
├── package.json        # Dependencias
└── README.md          # Este archivo
```

## Instalación

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

3. **Construir para producción**
   ```bash
   npm run build
   ```

## Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
# URL del backend API
VITE_API_URL=https://web-production-e67c7.up.railway.app
```

## Tecnologías Utilizadas

- **React 18** - Framework de UI
- **Vite** - Build tool y dev server
- **React Big Calendar** - Componente de calendario
- **Axios** - Cliente HTTP
- **Date-fns** - Manipulación de fechas
- **React Context** - Gestión de estado

## Funcionalidades

### Calendario
- Vista mensual interactiva
- Crear eventos haciendo clic en fechas
- Editar eventos haciendo doble clic
- Eliminar eventos desde el modal de detalles

### Eventos
- Formulario completo con validación
- Campos: título, descripción, fecha, hora, ubicación, email, teléfono
- Eventos de todo el día
- Categorías y prioridades
- Recordatorios configurables

### Notificaciones
- Notificaciones del navegador
- Recordatorios automáticos
- Soporte para eventos de todo el día

## API Integration

El frontend se conecta al backend via:

- **Base URL**: `https://web-production-e67c7.up.railway.app`
- **Endpoints**:
  - `GET /api/v1/events/` - Obtener eventos
  - `POST /api/v1/events/` - Crear evento
  - `PUT /api/v1/events/:id` - Actualizar evento
  - `DELETE /api/v1/events/:id` - Eliminar evento

## Desarrollo

### Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run preview      # Preview de la build
npm run lint         # Linter
```

### Estructura de Componentes

- **Calendar**: Componente principal del calendario
- **SimpleEventForm**: Formulario para crear/editar eventos
- **SimpleEventDetails**: Modal con detalles del evento
- **Layout**: Layout principal con header y navegación

## Deployment

El frontend está configurado para deploy en:

- **Vercel** (configuración en `vercel.json`)
- **Netlify** (configuración en `netlify.toml`)
- **Railway** (configuración en `railway.toml`)

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.