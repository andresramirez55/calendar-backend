# 🔧 Troubleshooting Railway - 404 en /health

Si `/health` está dando 404, sigue estos pasos:

## 1️⃣ Verificar que el Deploy se Completó

### En Railway Dashboard:
1. Ve a tu proyecto
2. Click en el servicio del backend
3. Ve a la pestaña **"Deployments"**
4. Verifica que el último deploy esté **"Active"** y **"Succeeded"**

### En Logs:
Busca este mensaje al inicio:
```
🚀 CALENDAR API v5 - STARTING NOW...
```

Si NO ves este mensaje, Railway NO está ejecutando el código correcto.

## 2️⃣ Verificar Logs de Inicio

En Railway → Logs, deberías ver:

```
========================================
🚀 CALENDAR API v5 - STARTING NOW...
========================================
⏰ Timestamp: 2025-...
🔍 Checking environment...
✅ CRITICAL: /health endpoint registered FIRST
✅ CRITICAL: / (root) endpoint registered FIRST
========================================
🚀 Server starting on port 8080
========================================
✅ Ready to accept connections!
```

### Si NO ves estos logs:
- Railway no está ejecutando el código
- Hay un problema con el build
- Verifica la configuración de build

## 3️⃣ Verificar Build Configuration

### En Railway → Settings → Build:
1. Verifica que **"Builder"** esté configurado como **"Nixpacks"**
2. Verifica que **"Start Command"** sea: `./calendar-backend`
3. Verifica que **"Healthcheck Path"** sea: `/health`

### Archivo `railway.toml`:
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "./calendar-backend"
healthcheckPath = "/health"
healthcheckTimeout = 300
```

## 4️⃣ Verificar que el Binario se Compila

Railway debe compilar el binario automáticamente. Verifica en logs:

```
Building application...
go build -o calendar-backend .
```

### Si ves errores de compilación:
1. Verifica que `go.mod` y `go.sum` estén en el repo
2. Verifica que todas las dependencias estén disponibles
3. Revisa los logs de build para ver errores específicos

## 5️⃣ Probar Endpoints Básicos

Después de esperar 2-3 minutos para el deploy:

### A. Probar Root `/`:
```bash
curl https://tu-railway-url.up.railway.app/
```

**Debería devolver:**
```json
{
  "message": "Welcome to Calendar API",
  "version": "v5",
  "health": "/health",
  "time": "2025-..."
}
```

### B. Probar Health `/health`:
```bash
curl https://tu-railway-url.up.railway.app/health
```

**Debería devolver:**
```json
{
  "status": "ok",
  "message": "Calendar API is running",
  "version": "v5",
  "time": "2025-..."
}
```

## 6️⃣ Si Sigue Dando 404

### Opción A: Verificar URL Correcta
- Railway te da una URL específica
- Verifica que estés usando la URL correcta
- Verifica que no haya un proxy o redirección

### Opción B: Verificar Puertos
- Railway puede asignar un puerto diferente
- Verifica en logs qué puerto está usando
- El código lee `PORT` de las variables de entorno

### Opción C: Re-build Manual
1. En Railway → Settings → Build
2. Click en **"Redeploy"**
3. O **"Clear Build Cache"** y redeploy

### Opción D: Verificar Variables de Entorno
Railway necesita:
- `PORT` - Railway lo configura automáticamente
- `DATABASE_URL` - Si usas PostgreSQL (Railway lo configura)

NO necesitas configurar nada más para que `/health` funcione.

## 7️⃣ Debugging Avanzado

### Agregar endpoint de diagnóstico:
```bash
curl https://tu-railway-url.up.railway.app/api/v1/debug/routes
```

Esto te mostrará todas las rutas registradas.

### Ver logs en tiempo real:
En Railway → Logs → **"Live Logs"**

Deberías ver requests cuando haces curl:
```
[GIN] 2025-... | 200 | ... | GET "/health"
```

## 8️⃣ Checklist Final

- [ ] Deploy completado exitosamente
- [ ] Logs muestran "🚀 CALENDAR API v5 - STARTING NOW..."
- [ ] Logs muestran "✅ CRITICAL: /health endpoint registered FIRST"
- [ ] Logs muestran "✅ Ready to accept connections!"
- [ ] `curl /health` retorna 200 (no 404)
- [ ] `curl /` retorna 200 (no 404)
- [ ] Variables de entorno configuradas correctamente (solo PORT y DATABASE_URL si usas PostgreSQL)

## 🆘 Si Nada Funciona

1. **Verifica la URL exacta de Railway**
   - Puede ser diferente a la que esperas
   - Verifica en Railway → Settings → Domains

2. **Verifica que el servicio esté activo**
   - Railway → Service → Debe estar "Active"

3. **Intenta crear un nuevo servicio desde cero**
   - A veces hay problemas con servicios antiguos
   - Railway → New → Service → Connect repo

4. **Verifica los logs de Railway**
   - Puede haber errores que no estás viendo
   - Railway → Logs → Busca errores en rojo

## 📝 Nota Final

El endpoint `/health` ahora se registra **ANTES** de CORS y cualquier otro middleware. Esto significa que debería funcionar siempre, incluso si hay problemas con otras configuraciones.

Si aún da 404 después de todo esto, el problema es que Railway **NO está ejecutando el código correcto**, o hay un problema con la configuración de Railway mismo.





