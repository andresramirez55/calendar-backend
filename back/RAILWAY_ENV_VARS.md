# 🚂 Variables de Entorno para Railway

Esta guía lista todas las variables de entorno que necesitas configurar en Railway.

## 📋 Variables REQUERIDAS

### **PORT**
- **Descripción**: Puerto donde corre el servidor
- **Valor**: Railway lo configura automáticamente (NO necesitas agregarlo)
- **Nota**: El código tiene un default de `8080` si no está configurado

### **DATABASE_URL**
- **Descripción**: URL de conexión a la base de datos
- **Opciones**:
  1. **Si agregas PostgreSQL en Railway**: Railway lo configura automáticamente
  2. **Si NO usas PostgreSQL**: Déjalo vacío o no lo configures (usará SQLite)
  
- **Ejemplo PostgreSQL** (Railway lo genera automáticamente):
  ```
  postgresql://postgres:password@localhost:5432/railway
  ```

## 📧 Variables OPCIONALES (para notificaciones)

### **SENDGRID_API_KEY**
- **Descripción**: API Key de SendGrid para enviar emails
- **Requerido para**: Notificaciones por email
- **Cómo obtenerlo**:
  1. Crea cuenta en [SendGrid](https://sendgrid.com)
  2. Ve a Settings > API Keys
  3. Crea una nueva API Key
  4. Copia el key y pégalo aquí
- **Ejemplo**:
  ```
  SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  ```
- **Nota**: Si no está configurado, el sistema funcionará pero no enviará emails

### **FROM_EMAIL**
- **Descripción**: Email desde el cual se envían las notificaciones
- **Requerido para**: Notificaciones por email (junto con SENDGRID_API_KEY)
- **Ejemplo**:
  ```
  noreply@tudominio.com
  ```
- **Nota**: Este email debe estar verificado en SendGrid
- **Default**: `noreply@calendar.com` (si no se configura)

### **TWILIO_ACCOUNT_SID**
- **Descripción**: Account SID de Twilio para WhatsApp
- **Requerido para**: Notificaciones por WhatsApp
- **Cómo obtenerlo**: 
  1. Crea cuenta en [Twilio](https://www.twilio.com)
  2. Ve a Dashboard
  3. Copia el Account SID
- **Ejemplo**:
  ```
  ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  ```
- **Nota**: Si no está configurado, el sistema funcionará pero no enviará WhatsApp

### **TWILIO_AUTH_TOKEN**
- **Descripción**: Auth Token de Twilio
- **Requerido para**: Notificaciones por WhatsApp (junto con TWILIO_ACCOUNT_SID)
- **Cómo obtenerlo**:
  1. En Twilio Dashboard
  2. Ve a Auth Token
  3. Copia el token
- **Ejemplo**:
  ```
  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  ```
- **Nota**: Si no está configurado, el sistema funcionará pero no enviará WhatsApp

### **TWILIO_PHONE_NUMBER**
- **Descripción**: Número de teléfono de Twilio para WhatsApp
- **Requerido para**: Notificaciones por WhatsApp
- **Formato**:
  ```
  whatsapp:+14155238886
  ```
- **Nota**: Debe incluir el prefijo `whatsapp:+` y el código de país

## ✅ Checklist de Configuración Mínima

### Para que el servidor funcione (MÍNIMO):
- ✅ `PORT` - Railway lo configura automáticamente
- ✅ `DATABASE_URL` - Railway lo configura si agregas PostgreSQL

### Para notificaciones por EMAIL:
- ✅ `SENDGRID_API_KEY`
- ✅ `FROM_EMAIL`

### Para notificaciones por WHATSAPP:
- ✅ `TWILIO_ACCOUNT_SID`
- ✅ `TWILIO_AUTH_TOKEN`
- ✅ `TWILIO_PHONE_NUMBER`

## 📝 Cómo Configurar en Railway

1. Ve a tu proyecto en Railway
2. Selecciona el servicio del backend
3. Ve a la pestaña **Variables**
4. Agrega cada variable:
   - **Name**: Nombre de la variable (ej: `SENDGRID_API_KEY`)
   - **Value**: Valor de la variable (ej: `SG.xxxxx...`)
5. Haz clic en **Add**
6. Guarda los cambios

## 🧪 Verificar Configuración

Una vez configurado, puedes verificar con:

```bash
# Ver estado del sistema
curl https://tu-railway-url.up.railway.app/api/v1/notifications/status

# Ver configuración en logs (busca esta línea al iniciar)
# 📧 Notification Service Configuration:
#   ✅ SendGrid API Key: Configured (from email: ...)
#   O
#   ⚠️ SendGrid API Key: NOT configured
```

## ⚠️ Notas Importantes

1. **Railway configura automáticamente**:
   - `PORT`
   - `DATABASE_URL` (si agregas PostgreSQL)

2. **No necesitas configurar**:
   - `PORT` (Railway lo hace)
   - `DATABASE_URL` (si usas PostgreSQL plugin de Railway)

3. **El sistema funciona sin**:
   - SendGrid configurado (pero no enviará emails)
   - Twilio configurado (pero no enviará WhatsApp)

4. **Para producción recomendado**:
   - Usar PostgreSQL (agregar plugin en Railway)
   - Configurar SendGrid para emails
   - Opcional: Configurar Twilio para WhatsApp

## 🔍 Debugging

Si tienes problemas, verifica los logs de Railway:

```bash
# Deberías ver:
🚀 Starting Calendar API v4 - ROUTE DEBUGGING ENABLED...
📧 Notification Service Configuration:
  ✅ SendGrid API Key: Configured (from email: ...)
  ⚠️ SendGrid API Key: NOT configured - Email notifications will be skipped
```

Si no ves las variables configuradas, vuelve a revisar la configuración en Railway.





