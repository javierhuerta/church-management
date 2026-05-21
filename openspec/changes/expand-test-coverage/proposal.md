## Why

La auditoría marcó `test-e2e-supertest` (solo 3 casos triviales en `app.e2e-spec.ts`) y `test-mock-external-services` (Unsplash con `fetch` real sin mock) como gaps de calidad. Sin e2e reales que ejerciten guards, validación, throttler y filtros, y sin mock de dependencias externas, hay regresiones invisibles para CI.

## What Changes

- **Suite e2e con Supertest** que ejercita los flujos clave: login (incluyendo 429 al exceder throttle), refresh, `/api/health`, validación estricta (400 ante props desconocidas), envelope de error consistente, RBAC (403), y un flujo completo de calendar (crear/publicar/listar).
- **Mock de `fetch` global** en los tests de `UnsplashProvider`, cubriendo: éxito, fallo HTTP, sin `UNSPLASH_ACCESS_KEY`, cache hit.
- **Estructura `test/`** con `setup.ts` que crea una `TestingModule` reusable y aísla la DB (SQLite in-memory o Postgres dedicado por test, según se decida).

## Capabilities

### New Capabilities
- `test-coverage`: pruebas e2e reales con Supertest y mocking de servicios externos para los providers que llaman a la red.

### Modified Capabilities
(ninguna a nivel de comportamiento)

## Impact

- **Archivos clave**: `test/` (nuevos e2e: auth, health, calendar, validation), `unsplash.provider.spec.ts` nuevo.
- **Dependencias**: ninguna nueva (Supertest ya instalado).
- **CI**: la suite total debería seguir corriendo bajo 30s.

## Fuera del alcance

- Test E2E del frontend.
- Snapshot testing del schema OpenAPI.
- Tests de carga/performance.
- Cobertura ≥ X% como gate de CI.
