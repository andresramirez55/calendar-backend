# Calendar API

API REST en Go para gestionar los eventos del calendario familiar. Incluye CRUD de eventos, consultas optimizadas para móvil y recordatorios programados.

## Arquitectura

```text
HTTP request
  ↓
internal/urlmapping/{event,notification}
                          Registra URL + método HTTP por módulo
  ↓
internal/controller/{event,notification}
                          Convierte HTTP/DTO ↔ casos de uso por módulo
  ↓
internal/service/{event,notification}
                          Reglas de negocio y casos de uso por módulo
  ↓
internal/domain           Entidades y contratos (puertos)
  ↓
internal/repository/event Implementación de persistencia con GORM
  ↓
internal/infrastructure   Base de datos y configuración
```

El único punto de composición es `main.go`: crea la conexión, la implementación del repositorio, los servicios y los controladores. Los controladores no acceden a GORM y los servicios no conocen DTOs HTTP ni la implementación concreta de persistencia.

Cada módulo funcional conserva juntas sus capas: por ejemplo, la lógica de eventos vive en `controller/event`, `service/event`, `repository/event` y `urlmapping/event`; la de recordatorios usa el mismo criterio bajo `notification/`.

## Ejecutar localmente

```bash
go run .
```

La API escucha en `http://localhost:8080` por defecto. Para usar PostgreSQL o habilitar el envío de correo, copiá `env.example` a `.env` y configurá las credenciales necesarias.

## Endpoints principales

- `GET /health`
- `GET|POST /api/v1/events/`
- `GET|PUT|DELETE /api/v1/events/:id`
- `GET /api/mobile/events/today`
- `GET /api/mobile/events/upcoming`
- `GET /api/mobile/events/range`
- `GET /api/mobile/events/search`
- `GET /api/mobile/stats`

Las rutas de diagnóstico y notificación se describen en `QUICK_DEBUG.md` y `RAILWAY_SETUP.md`.

## Notificaciones

La API ya contiene un scheduler de recordatorios. El subdirectorio `notification-service/` ofrece una alternativa como microservicio independiente. Elegí una única opción antes de activar envíos en producción para evitar duplicados.
