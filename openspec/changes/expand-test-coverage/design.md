## Context

Hay 55 tests unitarios pero el e2e es mínimo (3 casos básicos) y Unsplash llama a `fetch` real (no se testea su lógica de cache/fallo). Cambios recientes (throttler, validación estricta, filtro global, transacciones, serialización) son justo lo que un e2e debería cubrir.

## Goals / Non-Goals

**Goals:** e2e reales para auth/validation/RBAC/health, mock de `fetch` para Unsplash, mantener tiempo de suite razonable.

**Non-Goals:** frontend e2e, snapshot OpenAPI, load testing, gate de cobertura.

## Decisions

**1. DB para e2e: SQLite in-memory.** Permite e2e rápidos y aislados sin requerir Postgres en CI ni docker. Riesgo: divergencias entre SQLite y Postgres (enums, tipos `timestamptz`); mitigación: usar TypeORM con `synchronize: true` sobre las entidades para los e2e y limitar los flujos a operaciones simples; las migraciones reales siguen para Postgres. Alternativa descartada: Postgres dedicado por test — más fiel pero más lento y requiere infra.

**2. `jest.spyOn(global, 'fetch')` para mockear Unsplash.** Sin librerías extra. Casos: 200 con resultados, 429/500, falta de `UNSPLASH_ACCESS_KEY` (provider no disponible), cache hit (segunda llamada no invoca fetch).

**3. Helper `createE2EApp()`** que monta un `TestingModule` con la AppModule + override de la config de DB para SQLite. Reusable entre suites e2e.

**4. Lo que e2e debe cubrir (mínimo):**
- `POST /api/auth/login` éxito/fallo, 429 al sexto intento.
- `GET /api/health` 200.
- `POST /api/calendar/events` con propiedad desconocida → 400; sin token → 401; con rol no editor → 403; con editor → 201.
- Envelope de error en 401/403/404/500.

## Risks / Trade-offs

- **[Riesgo] SQLite vs Postgres divergencia** → limitar flujos e2e a CRUD básico; las queries específicas de Postgres se cubren con unit tests sobre repos.
- **[Trade-off] Tiempo de CI** → e2e añadirán ~10-15s; aceptable.

## Migration Plan

1. Añadir helper `createE2EApp()` y los e2e de auth/validation/RBAC/health.
2. Añadir `unsplash.provider.spec.ts` con mock de `fetch`.
3. Verificar tiempo total de la suite.

## Open Questions

- ¿Confirmar que SQLite in-memory soporta todas las entidades, o usar Postgres en CI?
