# Calendario familiar

Repositorio organizado por responsabilidad. La aplicación se compone de un frontend React, una API Go y, de forma opcional, un servicio independiente de correo para recordatorios.

```text
front/                       # Aplicación web React + Vite
back/                        # API REST Go + PostgreSQL/SQLite
back/notification-service/   # Servicio opcional de email con SendGrid
railway.json                 # Definición de los servicios principales en Railway
```

## Desarrollo local

En una terminal, iniciar la API:

```bash
cd back
go run .
```

En otra terminal, iniciar la aplicación web:

```bash
cd front
npm install
npm run dev
```

El frontend usa `http://localhost:8080` durante desarrollo. Para producción, configurá `VITE_API_URL` con la URL pública de la API.

## Servicios

| Servicio | Directorio | Puerto por defecto |
| --- | --- | --- |
| API de calendario | `back/` | `8080` |
| Frontend | `front/` | `5173` en desarrollo |
| Notificaciones por email | `back/notification-service/` | `8081` |

El servicio de notificaciones es opcional mientras se decide si se conserva separado o se usa el scheduler incorporado en la API. No deben quedar ambos enviando recordatorios en producción.

## Variables de entorno

La API requiere `DATABASE_URL` y, para correo, `SENDGRID_API_KEY` y `FROM_EMAIL`. Consultá [back/env.example](back/env.example). El servicio independiente tiene su propia configuración en `back/notification-service/README.md`.
