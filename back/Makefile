.PHONY: help build run test clean docker-build docker-run docker-stop

# Default target
help:
	@echo "Comandos disponibles:"
	@echo "  build        - Compilar la aplicación"
	@echo "  run          - Ejecutar la aplicación localmente"
	@echo "  test         - Ejecutar tests"
	@echo "  clean        - Limpiar archivos compilados"
	@echo "  docker-build - Construir imagen Docker"
	@echo "  docker-run   - Ejecutar con Docker Compose"
	@echo "  docker-stop  - Detener Docker Compose"
	@echo "  install      - Instalar dependencias"

# Instalar dependencias
install:
	go mod tidy
	go mod download

# Compilar la aplicación
build:
	go build -o calendar-backend main.go

# Ejecutar la aplicación
run:
	go run main.go

# Ejecutar tests
test:
	go test ./...

# Limpiar archivos compilados
clean:
	rm -f calendar-backend
	rm -f calendar.db

# Construir imagen Docker
docker-build:
	docker build -t calendar-backend .

# Ejecutar con Docker Compose
docker-run:
	docker-compose up -d

# Detener Docker Compose
docker-stop:
	docker-compose down

# Ver logs de Docker Compose
docker-logs:
	docker-compose logs -f

# Ejecutar en modo desarrollo con hot reload (requiere air)
dev:
	air

# Verificar que la aplicación compile
check:
	go vet ./...
	go fmt ./...

# Backup de la base de datos
backup:
	./scripts/backup.sh

# Backup con nombre personalizado
backup-name:
	@read -p "Nombre del backup: " name; \
	./scripts/backup.sh $$name

# Instalar dependencias de PostgreSQL
install-postgres:
	go get gorm.io/driver/postgres

# Limpiar backups antiguos
clean-backups:
	rm -rf backups/
