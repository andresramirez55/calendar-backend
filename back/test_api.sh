#!/bin/bash

# Script para probar la API del calendario
# Asegúrate de que el servidor esté corriendo en http://localhost:8080

BASE_URL="http://localhost:8080/api/v1"

echo "🚀 Probando la API del Calendario"
echo "=================================="

# Test 1: Health check
echo -e "\n1. Health Check:"
curl -s "$BASE_URL/../health" | jq '.'

# Test 2: Información de la API
echo -e "\n2. Información de la API:"
curl -s "$BASE_URL/.." | jq '.'

# Test 3: Crear un evento
echo -e "\n3. Creando un evento:"
EVENT_RESPONSE=$(curl -s -X POST "$BASE_URL/events" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Reunión de trabajo",
    "description": "Reunión semanal del equipo de desarrollo",
    "date": "2024-01-15",
    "time": "14:00",
    "location": "Oficina principal",
    "email": "usuario@ejemplo.com",
    "phone": "+1234567890",
    "reminder_day": true,
    "reminder_day_before": true
  }')

echo $EVENT_RESPONSE | jq '.'

# Extraer el ID del evento creado
EVENT_ID=$(echo $EVENT_RESPONSE | jq -r '.id')

if [ "$EVENT_ID" != "null" ] && [ "$EVENT_ID" != "" ]; then
    echo -e "\n4. Obteniendo el evento creado (ID: $EVENT_ID):"
    curl -s "$BASE_URL/events/$EVENT_ID" | jq '.'

    echo -e "\n5. Actualizando el evento:"
    curl -s -X PUT "$BASE_URL/events/$EVENT_ID" \
      -H "Content-Type: application/json" \
      -d '{
        "description": "Reunión semanal del equipo de desarrollo - ACTUALIZADO",
        "location": "Sala de conferencias A"
      }' | jq '.'

    echo -e "\n6. Obteniendo todos los eventos:"
    curl -s "$BASE_URL/events" | jq '.'

    echo -e "\n7. Obteniendo eventos por fecha específica:"
    curl -s "$BASE_URL/events?date=2024-01-15" | jq '.'

    echo -e "\n8. Eliminando el evento:"
    curl -s -X DELETE "$BASE_URL/events/$EVENT_ID" | jq '.'

    echo -e "\n9. Verificando que el evento fue eliminado:"
    curl -s "$BASE_URL/events/$EVENT_ID" | jq '.'
else
    echo -e "\n❌ Error: No se pudo crear el evento para continuar con las pruebas"
fi

echo -e "\n✅ Pruebas completadas!"
