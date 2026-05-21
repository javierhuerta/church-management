## Context

Endpoints de catálogo (himnos, templates) y vistas públicas (evento por slug) reciben las mismas respuestas durante minutos/horas. Sin cache, cada request va a Postgres.

## Goals / Non-Goals

**Goals:** cache in-memory para lecturas idempotentes públicas con TTL e invalidación al mutar.

**Non-Goals:** cache distribuido (Redis), cache de queries de DB, cache por usuario.

## Decisions

**1. `@nestjs/cache-manager` con store in-memory.** Cero infra. Tamaño máximo de cache acotado por config para evitar leaks. Alternativa descartada: Redis — requiere infra y es prematura para el tamaño actual.

**2. Solo respuestas públicas idempotentes.** El `CacheInterceptor` por defecto NO debe aplicarse a respuestas que dependen del usuario autenticado, porque se compartiría cache entre usuarios. Selección explícita por endpoint con `@UseInterceptors(CacheInterceptor)` en lugar de global.

**3. Invalidación explícita en mutaciones.** Inyectar `CACHE_MANAGER` en los servicios que mutan (hymn, template) y llamar `cacheManager.del('hymns:all')` etc. en los puntos de cambio. Patrón: keys consistentes (`hymns:all`, `hymns:autocomplete:<q>`, `templates:all`, `templates:<id>`).

**4. TTL conservador.** 60s para listados volátiles, 300s para catálogos estables (himnos). Configurable por env (`CACHE_TTL_DEFAULT`).

## Risks / Trade-offs

- **[Riesgo] Cache compartido filtra respuesta de usuario A al usuario B** → no aplicar a endpoints autenticados privados; usar `CacheInterceptor` solo donde el contenido es público o idéntico para todos.
- **[Riesgo] Datos viejos tras mutación** → invalidación explícita; TTL bajo como red de seguridad.
- **[Trade-off] Memoria del proceso** → tamaño máximo del cache acotado por config.

## Migration Plan

1. Instalar deps; registrar `CacheModule` global con TTL configurable.
2. Habilitar cache en los 3 listados (hymns, templates, calendar by-slug) con `@UseInterceptors(CacheInterceptor)`.
3. Invalidar en las mutaciones correspondientes.
4. Medir tiempo de respuesta antes/después en un endpoint (opcional, smoke).

## Open Questions

- ¿Cache para `GET /api/calendar/events` filtrado (paginado/filtrado público)? Probable no — keys explotan con la combinación de filtros.
