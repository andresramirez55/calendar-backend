#!/bin/bash

# Test healthcheck endpoint
echo "Testing healthcheck endpoint..."

# Wait for server to start (if running locally)
sleep 2

# Test health endpoint
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health)

if [ "$response" = "200" ]; then
    echo "✅ Healthcheck passed - Server is healthy"
    curl -s http://localhost:8080/health | jq .
else
    echo "❌ Healthcheck failed - HTTP Status: $response"
    echo "Response body:"
    curl -s http://localhost:8080/health
fi
