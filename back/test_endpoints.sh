#!/bin/bash

# Script simple para probar endpoints uno por uno
# Uso: ./test_endpoints.sh

BASE_URL="http://localhost:8080"

test_endpoint() {
    local method=$1
    local endpoint=$2
    local name=$3
    
    echo "🧪 Testing: $name"
    echo "   $method $endpoint"
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" == "200" ]; then
        echo "   ✅ Status: $http_code"
        echo "   📦 Response: $body"
    else
        echo "   ❌ Status: $http_code"
        echo "   📦 Response: $body"
    fi
    echo ""
}

echo "🔍 Testing Calendar Backend Endpoints"
echo "======================================"
echo ""

# Health checks
test_endpoint "GET" "/health" "Health Check"
test_endpoint "GET" "/api/v1/test-deployment" "Test Deployment"

# Notification endpoints
test_endpoint "GET" "/api/v1/notifications/ping-direct" "Ping Direct"
test_endpoint "GET" "/api/v1/notifications/ping" "Ping"
test_endpoint "GET" "/api/v1/notifications/status" "Status"
test_endpoint "POST" "/api/v1/notifications/check" "Check Notifications"
test_endpoint "GET" "/api/v1/notifications/test-direct" "Test Direct"

echo "✅ All tests completed!"

