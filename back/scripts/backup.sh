#!/bin/bash

# Script de backup para la base de datos SQLite
# Uso: ./scripts/backup.sh [backup_name]

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME=${1:-"calendar_backup_$TIMESTAMP.db"}

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

# Ruta completa del backup
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

echo "🔄 Creando backup de la base de datos..."
echo "📁 Backup: $BACKUP_PATH"

# Crear backup usando el comando sqlite3
if command -v sqlite3 &> /dev/null; then
    # Si sqlite3 está disponible, usar comando directo
    sqlite3 calendar.db ".backup '$BACKUP_PATH'"
    echo "✅ Backup creado exitosamente usando sqlite3"
else
    # Si no está disponible, copiar el archivo directamente
    cp calendar.db "$BACKUP_PATH"
    echo "✅ Backup creado exitosamente copiando archivo"
fi

# Verificar que el backup se creó
if [ -f "$BACKUP_PATH" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
    echo "📊 Tamaño del backup: $BACKUP_SIZE"
    echo "🎯 Backup guardado en: $BACKUP_PATH"
else
    echo "❌ Error: No se pudo crear el backup"
    exit 1
fi

# Limpiar backups antiguos (mantener solo los últimos 10)
echo "🧹 Limpiando backups antiguos..."
cd "$BACKUP_DIR"
ls -t calendar_backup_*.db | tail -n +11 | xargs -r rm
echo "✅ Limpieza completada"

echo "🎉 Proceso de backup finalizado!"
