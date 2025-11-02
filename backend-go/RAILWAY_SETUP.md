# 🚂 Guía Rápida de Configuración en Railway

## Paso 1: Agregar PostgreSQL (Opcional pero Recomendado)

1. En Railway, ve a tu proyecto
2. Clic en **"New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway configurará automáticamente `DATABASE_URL`
4. ✅ **Listo** - No necesitas configurar nada más para la base de datos

## Paso 2: Variables de Entorno Mínimas

### ✅ Necesarias para que funcione:
- Ninguna - Railway configura `PORT` automáticamente
- Si agregaste PostgreSQL, Railway configura `DATABASE_URL` automáticamente

### 📧 Para Notificaciones por Email (Opcional):

En Railway → Variables → Agregar:

| Variable | Valor | Ejemplo |
|----------|-------|---------|
| `SENDGRID_API_KEY` | Tu API Key de SendGrid | `SG.xxxxxxxxxxxx...` |
| `FROM_EMAIL` | Email verificado en SendGrid | `noreply@tudominio.com` |

### 📱 Para Notificaciones por WhatsApp (Opcional):

En Railway → Variables → Agregar:

| Variable | Valor | Ejemplo |
|----------|-------|---------|
| `TWILIO_ACCOUNT_SID` | Account SID de Twilio | `ACxxxxxxxxxxxx...` |
| `TWILIO_AUTH_TOKEN` | Auth Token de Twilio | `xxxxxxxxxxxx...` |
| `TWILIO_PHONE_NUMBER` | Número con formato | `whatsapp:+14155238886` |

## Paso 3: Verificar Deploy

Después de configurar las variables:

1. **Espera 2-3 minutos** para que Railway despliegue
2. **Prueba el health check**:
   ```bash
   curl https://tu-railway-url.up.railway.app/health
   ```
3. **Verifica las rutas**:
   ```bash
   curl https://tu-railway-url.up.railway.app/api/v1/debug/routes
   ```

## 📋 Resumen de Variables

### Automáticas (Railway):
- ✅ `PORT`
- ✅ `DATABASE_URL` (si agregas PostgreSQL)

### Opcionales (para notificaciones):
- 📧 `SENDGRID_API_KEY` + `FROM_EMAIL` (para emails)
- 📱 `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_PHONE_NUMBER` (para WhatsApp)

## 🎯 Configuración Mínima para Funcionar

**Cero variables necesarias** - Railway configura todo automáticamente.

El servidor funcionará sin configurar nada adicional. Solo configura SendGrid/Twilio si quieres notificaciones.

