## Why

Una revisión del backend contra la skill `nestjs-best-practices` encontró que la arquitectura y la inyección de dependencias están bien resueltas, pero existen huecos concretos en las categorías que la propia guía marca como CRITICAL/HIGH: manejo de errores, validación de entrada, seguridad de autenticación, rate limiting e integridad transaccional. Estos huecos exponen la API a errores no controlados, mass-assignment, fuerza bruta sobre el login y datos huérfanos ante fallos parciales. Conviene cerrarlos ahora, mientras el sistema tiene pocos módulos, antes de que el patrón inseguro se replique en módulos futuros (Cultos, Misión, etc.).

## What Changes

- **Registrar globalmente el `AllExceptionsFilter`** que hoy existe pero está sin usar, para que toda la API devuelva un envelope de error consistente.
- **Endurecer el `ValidationPipe` global** con `whitelist: true` y `forbidNonWhitelisted: true` para rechazar propiedades no declaradas en los DTOs.
- **Eliminar el secret JWT por defecto hardcodeado** (`'default-secret-change-in-production'`): el arranque debe fallar si `JWT_SECRET` no está definido. **BREAKING** para entornos que dependían del fallback.
- **Excluir `password` de la serialización** de la entidad `User` mediante `ClassSerializerInterceptor` + `@Exclude()`.
- **Agregar rate limiting** (`@nestjs/throttler`) con un límite estricto sobre `/auth/login` y `/auth/refresh`.
- **Agregar cabeceras de seguridad HTTP** con `helmet`.
- **Envolver en transacciones** las escrituras multi-entidad (creación de programas con grupos/secciones, eventos con organizadores/adjuntos).
- **Centralizar la configuración** vía `ConfigService` con validación de esquema de variables de entorno al arranque, y agregar `enableShutdownHooks()` y un endpoint de health check.

## Capabilities

### New Capabilities
- `global-error-handling`: filtro de excepciones registrado globalmente y formato de respuesta de error consistente para toda la API.
- `input-validation-hardening`: política global de validación estricta de DTOs (whitelist y rechazo de propiedades desconocidas).
- `api-rate-limiting`: límite de tasa de peticiones, con protección reforzada en endpoints de autenticación.
- `security-headers`: cabeceras de seguridad HTTP mediante helmet.
- `transactional-writes`: garantía de atomicidad en operaciones que escriben múltiples entidades relacionadas.
- `runtime-configuration`: configuración centralizada con validación de entorno, apagado controlado y health check.

### Modified Capabilities
- `auth`: el secret JWT pasa a ser obligatorio (sin fallback inseguro) y el `password` del usuario nunca se expone en respuestas serializadas.

## Impact

- **Módulos NestJS afectados**: `AppModule` (registro global de filtro, pipe, throttler, helmet, shutdown hooks), `AuthModule` (secret obligatorio, serialización), `WorshipServicesModule` y `CalendarModule` (transacciones), y un nuevo `HealthModule`.
- **Archivos clave**: `src/main.ts`, `src/app.module.ts`, `src/modules/auth/*`, `src/modules/common/filters/all-exceptions.filter.ts`, `src/modules/worship-services/services/program.service.ts`, `src/modules/calendar/calendar.service.ts`.
- **Dependencias nuevas**: `@nestjs/throttler`, `helmet`, `@nestjs/terminus` (health), `joi` o `class-validator` para validación de env.
- **Roles y permisos**: sin cambios en el modelo de roles; los guards y `@Roles` existentes se mantienen. El rate limiting aplica por igual a todos los roles.
- **OpenAPI/Frontend**: el envelope de error consistente y los nuevos códigos (429 por rate limit) deben reflejarse en el contrato; el frontend generado debe contemplar el 429.

## Fuera del alcance

- Revocación/rotación de refresh tokens y blacklist de tokens (el `logout` seguirá siendo idempotente sin persistencia de sesión).
- Estrategias de caching (`perf-use-caching`) y logging estructurado de requests.
- Cobertura de pruebas e2e con Supertest y aumento de cobertura unitaria.
- Versionado de API (`api-versioning`).
- Cualquier cambio en el frontend más allá de tolerar el nuevo código 429 y el envelope de error.
