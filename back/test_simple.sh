#!/bin/bash

echo "🚀 Iniciando pruebas simples de la API del Calendario"
echo "====================================================="

# Iniciar la aplicación en background
echo "1. Iniciando la aplicación..."
./calendar-backend &
APP_PID=$!

# Esperar a que la aplicación esté lista
echo "2. Esperando a que la aplicación esté lista..."
sleep 5

# Probar health check
echo "3. Probando health check..."
curl -s http://localhost:8080/health

echo -e "\n4. Probando información de la API..."
curl -s http://localhost:8080/

echo -e "\n5. Probando creación de evento..."
curl -X POST http://localhost:8080/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Reunión de trabajo",
    "description": "Reunión semanal del equipo",
    "date": "2024-01-15",
    "time": "14:00",
    "location": "Oficina principal",
    "email": "usuario@ejemplo.com",
    "phone": "+1234567890",
    "reminder_day": true,
    "reminder_day_before": true
  }'

echo -e "\n6. Probando obtención de eventos..."
curl -s http://localhost:8080/api/v1/events

echo -e "\n\n✅ Pruebas completadas!"
echo "Para detener la aplicación, ejecuta: kill $APP_PID"
