# 🔍 Guía de Debugging Local

Esta guía te ayudará a debuggear el backend localmente.

## 🚀 Inicio Rápido

### 1. Iniciar el servidor local

```bash
cd backend-go
go run main.go
```

El servidor se iniciará en `http://localhost:8080`

### 2. Probar endpoints manualmente

#### Health Check
```bash
curl http://localhost:8080/health
```

#### Test Deployment
```bash
curl http://localhost:8080/api/v1/test-deployment
```

#### Notification Ping Direct
```bash
curl http://localhost:8080/api/v1/notifications/ping-direct
```

#### Notification Ping
```bash
curl http://localhost:8080/api/v1/notifications/ping
```

#### Notification Status
```bash
curl http://localhost:8080/api/v1/notifications/status
```

#### Check Notifications (POST)
```bash
curl -X POST http://localhost:8080/api/v1/notifications/check
```

#### Test Direct
```bash
curl http://localhost:8080/api/v1/notifications/test-direct
```

### 3. Usar scripts de prueba

#### Script completo (con jq para formateo JSON)
```bash
./debug_local.sh
```

#### Script simple (sin dependencias)
```bash
./test_endpoints.sh
```

## 📋 Verificar Rutas Registradas

Cuando inicias el servidor, deberías ver en los logs:

```
📋 Registered routes summary:
   GET /health
   GET /
   GET /api/v1/events/
   POST /api/v1/events/
   GET /api/v1/events/:id
   PUT /api/v1/events/:id
   DELETE /api/v1/events/:id
   GET /api/mobile/events/today
   GET /api/mobile/events/upcoming
   GET /api/mobile/events/range
   GET /api/mobile/events/search
   GET /api/mobile/stats
   GET /api/v1/notifications/ping
   POST /api/v1/notifications/check
   GET /api/v1/notifications/status
   POST /api/v1/notifications/test
   GET /api/v1/notifications/test-direct
   GET /api/v1/notifications/ping-direct
   GET /api/v1/test-deployment
✅ Total routes registered: 18
```

## 🐛 Debugging

### Si un endpoint retorna 404:

1. **Verifica que el servidor esté corriendo**
   ```bash
   curl http://localhost:8080/health
   ```

2. **Verifica los logs del servidor**
   - Busca la línea `📋 Registered routes summary:`
   - Verifica que la ruta esté listada

3. **Verifica el método HTTP**
   - Algunos endpoints son POST, no GET
   - Usa `curl -X POST` para POST endpoints

4. **Verifica la URL exacta**
   - Algunos endpoints tienen trailing slash
   - Verifica mayúsculas/minúsculas

### Debugging con curl verbose

```bash
curl -v http://localhost:8080/api/v1/notifications/ping
```

Esto mostrará:
- Request headers
- Response headers
- Status code
- Response body

### Ver logs del servidor

Cuando ejecutas `go run main.go`, deberías ver:

```
🚀 Starting Calendar API v3 - NOTIFICATION ROUTES FIXED...
📧 Notification Service Configuration:
  ✅ SendGrid API Key: Configured (from email: ...)
  OR
  ⚠️ SendGrid API Key: NOT configured - Email notifications will be skipped
🔔 Initializing notification scheduler...
🚀 Starting notification scheduler...
✅ Notification scheduler started - checking every 5 minutes
✅ Notification scheduler initialized and running
🔧 Setting up all routes...
✅ All routes setup completed
🔧 Setting up notification routes...
✅ Notification service is available
✅ Notification controller created
✅ Scheduler is available
✅ Notification routes setup completed
📋 Registered routes summary:
   [lista de rutas]
✅ Total routes registered: 18
Server starting on port 8080
```

## 🔧 Configuración de Variables de Entorno

Crea un archivo `.env.local` en `backend-go/`:

```bash
PORT=8080
DATABASE_URL=calendar.db
SENDGRID_API_KEY=tu_api_key_aqui
FROM_EMAIL=noreply@tudominio.com
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=whatsapp:+1234567890
```

## ✅ Checklist de Debugging

- [ ] Servidor está corriendo (verifica con `/health`)
- [ ] Rutas están registradas (verifica logs)
- [ ] Método HTTP correcto (GET vs POST)
- [ ] URL exacta correcta (incluyendo `/api/v1/`)
- [ ] Sin errores en los logs del servidor
- [ ] CORS configurado correctamente (para frontend)

## 📝 Notas

- El servidor usa el puerto `8080` por defecto
- Si el puerto está ocupado, verás: `listen tcp :8080: bind: address already in use`
- Para matar un proceso en el puerto 8080:
  ```bash
  lsof -ti:8080 | xargs kill -9
  ```

