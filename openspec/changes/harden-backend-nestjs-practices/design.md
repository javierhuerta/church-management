## Context

El backend NestJS (TypeORM + PostgreSQL, JWT con roles) ya tiene una arquitectura modular correcta, pero una revisión contra la skill `nestjs-best-practices` reveló huecos transversales en seguridad y robustez. Varios son de bajo esfuerzo y alto impacto (registrar un filtro que ya existe, endurecer un pipe ya instanciado), otros requieren refactor acotado (transacciones). Este cambio es deliberadamente cross-cutting: toca `AppModule`, `AuthModule`, y los servicios de escritura de `WorshipServices` y `Calendar`. El sistema tiene pocos módulos hoy, por lo que es el momento de fijar los patrones antes de replicarlos en módulos futuros (Cultos, Misión).

## Goals / Non-Goals

**Goals:**
- Respuesta de error consistente en toda la API mediante un exception filter global.
- Validación estricta de entrada (rechazo de propiedades no declaradas) por defecto.
- Eliminar el secret JWT por defecto y forzar configuración explícita al arranque.
- Proteger los endpoints de autenticación contra fuerza bruta.
- Garantizar atomicidad en escrituras multi-entidad.
- Configuración centralizada y validada, apagado controlado y health check.

**Non-Goals:**
- Revocación/rotación persistente de refresh tokens (logout sigue idempotente).
- Caching, logging estructurado de requests, e2e, versionado de API.
- Cambios de modelo de datos o de roles.

## Decisions

**1. Registro del exception filter vía `APP_FILTER` (no `useGlobalFilters` en main.ts).**
Usar el provider `{ provide: APP_FILTER, useClass: AllExceptionsFilter }` en `AppModule` permite inyección de dependencias en el filtro (ej. `Logger`) y mantiene la configuración declarativa junto al resto del módulo. Alternativa descartada: `app.useGlobalFilters(new AllExceptionsFilter())` en `main.ts` — más simple pero sin DI y disperso respecto a los demás globals.

**2. `ValidationPipe` global con `whitelist` + `forbidNonWhitelisted` + `transform`.**
`whitelist` elimina props no decoradas; `forbidNonWhitelisted` además devuelve 400 ante props desconocidas, haciendo explícito el rechazo. Se mantiene como pipe global en `main.ts` (o `APP_PIPE`). Trade-off: clientes que enviaban campos extra empezarán a recibir 400 — aceptable y deseable.

**3. `JWT_SECRET` obligatorio: fallar rápido al arranque.**
Se elimina el fallback `'default-secret-change-in-production'` en `auth.module.ts` y `jwt.strategy.ts`. La validación de entorno (decisión 6) hace que la app no levante sin el secret. Alternativa descartada: generar un secret aleatorio en runtime — invalidaría todos los tokens en cada reinicio/replica.

**4. Exclusión de `password` vía `ClassSerializerInterceptor` global + `@Exclude()` en la entidad.**
Defensa en profundidad: aunque hoy el mapeo es manual, marcar el campo y activar el interceptor global evita fugas si algún endpoint futuro retorna la entidad directa. Requiere que las respuestas sean instancias de clase (entidades) o DTOs con class-transformer.

**5. Rate limiting con `@nestjs/throttler`.**
`ThrottlerModule` global con un límite por defecto holgado y un `@Throttle()` estricto en `/auth/login` y `/auth/refresh`. Devuelve 429. Alternativa descartada: rate limiting en un reverse proxy — válido en prod pero no protege en desarrollo ni garantiza el comportamiento a nivel de app.

**6. Configuración centralizada con validación de esquema.**
`ConfigModule.forRoot({ isGlobal: true, validationSchema })` validando las env requeridas (DB_*, JWT_SECRET, PORT, CORS origin) al arranque. Reemplazar accesos directos a `process.env` por `ConfigService` en `app.module.ts`, `main.ts`, `upload.config.ts`, `unsplash.provider.ts`. Se usa `joi` por ser el patrón documentado de NestJS para `validationSchema`.

**7. Transacciones con `DataSource.transaction()` / `EntityManager`.**
Las escrituras multi-entidad (crear programa con grupos+secciones; crear/actualizar evento con organizadores+adjuntos) se envuelven en una transacción usando el `EntityManager` del callback, reemplazando los `repo.save()` secuenciales. `DepartmentsService` ya inyecta `DataSource`, se sigue ese patrón.

**8. Health check con `@nestjs/terminus` + `enableShutdownHooks()`.**
Nuevo `HealthModule` con endpoint `GET /api/health` que verifica la conexión a la DB. `app.enableShutdownHooks()` en `main.ts` para apagado controlado.

## Risks / Trade-offs

- **[BREAKING] Quitar el fallback de `JWT_SECRET` rompe entornos sin la variable definida** → documentar en `.env.example` (ya presente) y validar al arranque con mensaje claro; verificar que `.env` de cada entorno la tenga antes de desplegar.
- **`forbidNonWhitelisted` puede romper clientes que enviaban campos extra** → el frontend se genera desde OpenAPI y solo envía campos del DTO, por lo que el riesgo es bajo; revisar llamadas manuales si las hubiera.
- **`ClassSerializerInterceptor` global exige que las respuestas sean instancias de clase** → endpoints que retornan objetos planos no se ven afectados, pero hay que verificar que ningún endpoint dependa de exponer campos no decorados.
- **Rate limiting demasiado estricto podría bloquear usuarios legítimos** → empezar con un umbral conservador en login (p. ej. 5/min) y dejarlo configurable por env.
- **Refactor transaccional puede alterar el orden/IDs generados** → cubrir con los specs existentes de program/template y correr los `.spec.ts` ya presentes.

## Migration Plan

1. Agregar dependencias (`@nestjs/throttler`, `helmet`, `@nestjs/terminus`, `joi`).
2. Introducir validación de entorno y `ConfigService`; confirmar que cada `.env` tiene `JWT_SECRET`.
3. Registrar filtro, pipe estricto, throttler, helmet, serializer y shutdown hooks.
4. Refactor transaccional en program/calendar services.
5. Agregar `HealthModule`.
6. Regenerar el cliente OpenAPI del frontend para reflejar 429 y el envelope de error.

Rollback: cada bloque es independiente y revertible por commit; el cambio de `JWT_SECRET` es el único con impacto operativo y se mitiga restaurando el fallback temporalmente si fuese necesario.

## Open Questions (resueltas)

- **Umbral de rate limit**: límite global de **100 req/min** por IP y límite estricto de **5 req/min** en `/auth/login` y `/auth/refresh`. El global es holgado para uso normal; el estricto frena fuerza bruta sin afectar logins legítimos. Configurable por env (`THROTTLE_TTL`, `THROTTLE_LIMIT`).
- **Alcance del health check**: solo verificación de la base de datos (`TypeOrmHealthIndicator`). El chequeo de `uploads/` queda fuera por aportar poco valor frente al ruido operativo.
