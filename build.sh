#!/bin/bash

# Script para construir el frontend para producción
echo "🚀 Construyendo frontend para producción..."

# Copiar variables de entorno de producción
cp env.production .env.production

# Instalar dependencias
npm install

# Construir para producción
npm run build

echo "✅ Build completado en la carpeta 'dist'"
echo "📁 Archivos listos para deploy:"
ls -la dist/
