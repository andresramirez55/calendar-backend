#!/bin/bash

echo "🚀 Deployando Frontend del Calendario"
echo "======================================"

# Build del proyecto
echo "📦 Construyendo proyecto..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build exitoso"
    
    # Crear archivo ZIP para deploy manual
    echo "📁 Creando archivo para deploy..."
    cd dist
    zip -r ../calendar-frontend.zip .
    cd ..
    
    echo "✅ Archivo calendar-frontend.zip creado"
    echo ""
    echo "🌐 Opciones de Deploy:"
    echo "1. Netlify Drop: https://app.netlify.com/drop"
    echo "2. Vercel: https://vercel.com/new"
    echo "3. GitHub Pages: Subir a repositorio"
    echo ""
    echo "📋 Instrucciones:"
    echo "- Sube el archivo calendar-frontend.zip"
    echo "- Configura la variable VITE_API_URL si es necesario"
    echo "- El backend está en: https://calendar-backend-4k8h.onrender.com"
    echo ""
    echo "🔔 Para probar notificaciones:"
    echo "- Asegúrate de que el sitio esté en HTTPS"
    echo "- Acepta los permisos de notificación"
    echo "- Usa el panel de prueba de notificaciones"
    
else
    echo "❌ Error en el build"
    exit 1
fi
