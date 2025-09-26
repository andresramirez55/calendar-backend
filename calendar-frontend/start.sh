#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting Calendar Frontend on Railway..."

# Set production environment
export NODE_ENV=production

# Build the application
echo "📦 Building application..."
npm run build

# Verify build
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build completed successfully"

# Start the server
echo "🌐 Starting server on port ${PORT:-5173}..."
npx serve -s dist -l ${PORT:-5173} --single
