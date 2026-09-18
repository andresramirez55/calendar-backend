#!/bin/bash

# Script de despliegue para servidor Linux
# Uso: ./scripts/deploy.sh [servidor] [usuario]

SERVER=${1:-"tu-servidor.com"}
USER=${2:-"root"}
APP_NAME="calendar-backend"
APP_DIR="/opt/$APP_NAME"

echo "🚀 Desplegando $APP_NAME en $SERVER"

# 1. Compilar la aplicación
echo "📦 Compilando aplicación..."
go build -o calendar-backend .

# 2. Crear archivo de configuración systemd
echo "⚙️  Creando servicio systemd..."
cat > calendar-backend.service << EOF
[Unit]
Description=Calendar Backend API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$APP_DIR
ExecStart=$APP_DIR/calendar-backend
Restart=always
RestartSec=5
Environment=PORT=8080
Environment=DATABASE_URL=$APP_DIR/calendar.db

[Install]
WantedBy=multi-user.target
EOF

# 3. Subir archivos al servidor
echo "📤 Subiendo archivos al servidor..."
scp calendar-backend $USER@$SERVER:/tmp/
scp calendar-backend.service $USER@$SERVER:/tmp/
scp .env $USER@$SERVER:/tmp/

# 4. Configurar en el servidor
echo "🔧 Configurando en el servidor..."
ssh $USER@$SERVER << 'EOF'
    # Crear directorio de la aplicación
    sudo mkdir -p /opt/calendar-backend
    sudo chown www-data:www-data /opt/calendar-backend
    
    # Mover archivos
    sudo mv /tmp/calendar-backend /opt/calendar-backend/
    sudo mv /tmp/.env /opt/calendar-backend/
    sudo chmod +x /opt/calendar-backend/calendar-backend
    
    # Configurar servicio systemd
    sudo mv /tmp/calendar-backend.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable calendar-backend
    sudo systemctl start calendar-backend
    
    # Configurar nginx (opcional)
    echo "Configurando nginx..."
    sudo tee /etc/nginx/sites-available/calendar-backend << 'NGINX_EOF'
server {
    listen 80;
    server_name tu-dominio.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX_EOF
    
    sudo ln -sf /etc/nginx/sites-available/calendar-backend /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
    
    echo "✅ Despliegue completado!"
    echo "🌐 API disponible en: http://$SERVER"
    echo "📊 Estado del servicio: sudo systemctl status calendar-backend"
EOF

echo "🎉 Despliegue completado!"
echo "🌐 Tu API estará disponible en: http://$SERVER"
