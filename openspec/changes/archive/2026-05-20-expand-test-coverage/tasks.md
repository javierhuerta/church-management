## 1. Infraestructura e2e

- [x] 1.1 Crear `test/helpers/create-e2e-app.ts` que monte una `TestingModule` con override de DB (SQLite in-memory) y devuelva la `INestApplication`
- [x] 1.2 Confirmar que las entidades cargan en SQLite (o decidir Postgres dedicado)

## 2. Tests e2e de auth, validación y RBAC

- [x] 2.1 `test/auth.e2e-spec.ts`: login OK / 401, rate limit 429 al sexto intento, refresh
- [x] 2.2 `test/validation.e2e-spec.ts`: 400 ante propiedad desconocida; envelope `{ statusCode, message, error }` en 401/404
- [x] 2.3 `test/calendar.e2e-spec.ts`: crear evento sin token → 401, con rol no editor → 403, con editor → 201; publicar y listar
- [x] 2.4 `test/health.e2e-spec.ts`: `GET /api/health` → 200 con estado de DB

## 3. Mock de Unsplash

- [x] 3.1 `unsplash.provider.spec.ts`: mock de `global.fetch`; casos OK, error HTTP, sin access key, cache hit
- [x] 3.2 Confirmar que el provider no invoca la red en ningún test

## 4. Verificación

- [x] 4.1 Suite total < 30s; lint, build y todos los tests verdes
