# 🚀 Quick Debug Local - Guía Rápida

## 1. Iniciar el servidor

```bash
cd backend-go
go run main.go
```

## 2. En otra terminal, probar endpoints

### Health Check (debe funcionar)
```bash
curl http://localhost:8080/health
```

### Test Deployment
```bash
curl http://localhost:8080/api/v1/test-deployment
```

### Notification Ping Direct
```bash
curl http://localhost:8080/api/v1/notifications/ping-direct
```

### Notification Ping
```bash
curl http://localhost:8080/api/v1/notifications/ping
```

### Notification Check (POST)
```bash
curl -X POST http://localhost:8080/api/v1/notifications/check
```

## 3. Ver logs del servidor

Cuando inicias el servidor, deberías ver:
- ✅ Rutas registradas con su método y path
- ✅ Total de rutas registradas
- ✅ Status de servicios de notificación

## 4. Si un endpoint da 404

1. Verifica los logs del servidor - busca "📋 Registered routes summary:"
2. Compara la URL exacta del curl con las rutas listadas
3. Verifica el método HTTP (GET vs POST)

## 5. Scripts de prueba

```bash
# Script simple
./test_endpoints.sh

# Script completo (requiere jq)
./debug_local.sh
```

## 6. Debugging verbose

```bash
curl -v http://localhost:8080/api/v1/notifications/ping
```

Esto mostrará headers, status code y response completo.

