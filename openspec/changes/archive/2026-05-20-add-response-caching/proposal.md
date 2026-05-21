## Why

La auditoría marcó `perf-use-caching` como gap (❌). Hay endpoints con respuestas que cambian poco y se piden con frecuencia (listado de himnos, listado de templates publicados, eventos del calendario público por slug). Cachearlos reduce latencia y carga de DB con esfuerzo bajo.

## What Changes

- **`CacheModule` global** con TTL por endpoint (in-memory por ahora).
- **Cachear lecturas seguras** con `CacheInterceptor`/`@CacheKey`/`@CacheTTL`:
  - `GET /api/hymns` y `GET /api/hymns/autocomplete`
  - `GET /api/worship-services/templates` y `GET /api/worship-services/templates/:id`
  - `GET /api/calendar/events/by-slug/:slug` (publicado)
  - `GET /api/health` ya excluido del throttler; no se cachea.
- **Invalidación explícita** en las mutaciones correspondientes (crear/actualizar/archivar template o hymn → invalida la entrada del cache).

## Capabilities

### New Capabilities
- `response-caching`: cache in-memory de respuestas de lectura idempotente con TTL e invalidación al mutar.

### Modified Capabilities
(ninguna a nivel de contrato)

## Impact

- **Módulos**: `AppModule` (`CacheModule.register`), controladores con `@UseInterceptors(CacheInterceptor)`.
- **Dependencias**: `@nestjs/cache-manager` + `cache-manager` (in-memory por defecto).
- **Roles/permisos**: sin cambios. Lecturas privadas (con `user` en el contexto) NO se cachean para evitar filtrar respuestas entre sesiones.

## Fuera del alcance

- Cache distribuido (Redis).
- Cache de queries de DB (TypeORM `cache`).
- Cache de respuestas autenticadas privadas (por usuario).
