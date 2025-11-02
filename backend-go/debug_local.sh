#!/bin/bash

# Script de debugging para probar endpoints localmente
# Uso: ./debug_local.sh

echo "🔍 Calendar Backend - Local Debugging"
echo "======================================"
echo ""

BASE_URL="http://localhost:8080"

echo "1️⃣ Testing Health Endpoint..."
curl -s "$BASE_URL/health" | jq .
echo ""
echo ""

echo "2️⃣ Testing Test Deployment Endpoint..."
curl -s "$BASE_URL/api/v1/test-deployment" | jq .
echo ""
echo ""

echo "3️⃣ Testing Notification Ping Direct..."
curl -s "$BASE_URL/api/v1/notifications/ping-direct" | jq .
echo ""
echo ""

echo "4️⃣ Testing Notification Ping..."
curl -s "$BASE_URL/api/v1/notifications/ping" | jq .
echo ""
echo ""

echo "5️⃣ Testing Notification Status..."
curl -s "$BASE_URL/api/v1/notifications/status" | jq .
echo ""
echo ""

echo "6️⃣ Testing Notification Check (POST)..."
curl -s -X POST "$BASE_URL/api/v1/notifications/check" | jq .
echo ""
echo ""

echo "7️⃣ Testing Test Direct Endpoint..."
curl -s "$BASE_URL/api/v1/notifications/test-direct" | jq .
echo ""
echo ""

echo "8️⃣ Listing all registered routes (if server is running)..."
echo "Check server logs for: [GIN-debug]"
echo ""

echo "✅ Debugging complete!"
echo ""
echo "📝 To test with verbose output, use:"
echo "   curl -v http://localhost:8080/api/v1/notifications/ping"

