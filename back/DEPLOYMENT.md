# 🚀 Guía de Despliegue

Esta guía te ayudará a desplegar tu aplicación de calendario en diferentes plataformas gratuitas.

## 🎯 **Recomendación: Render (Más Fácil)**

### 1. **Preparar el Repositorio**
```bash
# Asegúrate de que tu código esté en GitHub
git add .
git commit -m "Preparar para despliegue"
git push origin main
```

### 2. **Desplegar en Render**
1. Ve a [render.com](https://render.com) y crea una cuenta
2. Haz clic en "New +" → "Web Service"
3. Conecta tu repositorio de GitHub
4. Configura el servicio:
   - **Name**: `calendar-backend`
   - **Environment**: `Go`
   - **Build Command**: `go build -o calendar-backend main.go`
   - **Start Command**: `./calendar-backend`
   - **Plan**: `Free`

### 3. **Configurar Variables de Entorno**
En Render, ve a "Environment" y agrega:
```
PORT=10000
DATABASE_URL=postgresql://... (Render te dará esta URL)
SENDGRID_API_KEY=tu_api_key
FROM_EMAIL=noreply@tudominio.com
TWILIO_ACCOUNT_SID=tu_sid
TWILIO_AUTH_TOKEN=tu_token
TWILIO_PHONE_NUMBER=whatsapp:+14155238886
```

### 4. **Desplegar**
- Haz clic en "Create Web Service"
- Render construirá y desplegará automáticamente
- Tu API estará disponible en: `https://tu-app.onrender.com`

## 🚂 **Alternativa: Railway**

### 1. **Instalar Railway CLI**
```bash
npm install -g @railway/cli
```

### 2. **Desplegar**
```bash
# Login
railway login

# Inicializar proyecto
railway init

# Desplegar
railway up
```

### 3. **Configurar Base de Datos**
```bash
# Crear base de datos PostgreSQL
railway add

# Obtener variables de entorno
railway variables
```

## ☁️ **Alternativa: Heroku**

### 1. **Instalar Heroku CLI**
```bash
# macOS
brew install heroku/brew/heroku

# Windows
# Descargar desde: https://devcenter.heroku.com/articles/heroku-cli
```

### 2. **Desplegar**
```bash
# Login
heroku login

# Crear app
heroku create tu-calendario-app

# Agregar base de datos PostgreSQL
heroku addons:create heroku-postgresql:mini

# Desplegar
git push heroku main

# Ver logs
heroku logs --tail
```

## 🗄️ **Configuración de Base de Datos**

### **SQLite (Desarrollo Local)**
```bash
DATABASE_URL=calendar.db
```

### **PostgreSQL (Producción)**
```bash
# Render te da esta URL automáticamente
DATABASE_URL=postgresql://user:password@host:port/database

# Railway
DATABASE_URL=postgresql://postgres:password@containers-us-west-1.railway.app:5432/railway

# Heroku
DATABASE_URL=postgresql://user:password@host:port/database
```

## 🔧 **Comandos Útiles**

### **Backup de Base de Datos**
```bash
# Backup automático
make backup

# Backup con nombre personalizado
make backup-name

# Limpiar backups antiguos
make clean-backups
```

### **Verificar Despliegue**
```bash
# Health check
curl https://tu-app.onrender.com/health

# Información de la API
curl https://tu-app.onrender.com/
```

## 📊 **Monitoreo**

### **Render**
- Dashboard automático
- Logs en tiempo real
- Métricas de rendimiento

### **Railway**
- Logs en tiempo real
- Métricas de uso
- Alertas automáticas

### **Heroku**
- Logs con `heroku logs --tail`
- Métricas en dashboard
- Alertas configurables

## 🚨 **Solución de Problemas**

### **Error: "Port already in use"**
- Asegúrate de usar la variable `PORT` del entorno
- Render usa puerto 10000
- Railway y Heroku asignan puertos automáticamente

### **Error: "Database connection failed"**
- Verifica que `DATABASE_URL` esté configurada
- Para SQLite, asegúrate de que el archivo sea escribible
- Para PostgreSQL, verifica credenciales y firewall

### **Error: "Build failed"**
- Verifica que `go.mod` esté en la raíz
- Asegúrate de que todas las dependencias estén en `go.mod`
- Revisa los logs de build en la plataforma

## 💡 **Consejos de Producción**

1. **Siempre usa HTTPS** en producción
2. **Configura backups automáticos** de la base de datos
3. **Monitorea los logs** regularmente
4. **Usa variables de entorno** para configuraciones sensibles
5. **Configura alertas** para errores críticos

## 🔄 **Actualizaciones**

Para actualizar tu aplicación:
```bash
# Hacer cambios en tu código
git add .
git commit -m "Nueva funcionalidad"
git push origin main

# Render/Railway se actualizarán automáticamente
# Para Heroku:
git push heroku main
```

## 📞 **Soporte**

- **Render**: [docs.render.com](https://docs.render.com)
- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Heroku**: [devcenter.heroku.com](https://devcenter.heroku.com)

¡Tu aplicación estará funcionando en la nube en minutos! 🎉
