## 1. Dependencias y configuración base

- [x] 1.1 Instalar dependencias: `@nestjs/throttler`, `helmet`, `@nestjs/terminus`, `joi`
- [x] 1.2 Definir `validationSchema` (joi) en `ConfigModule.forRoot` validando `DB_*`, `JWT_SECRET`, `PORT` y el origen CORS; marcar requeridas
- [x] 1.3 Confirmar que cada `.env`/`.env.example` incluye `JWT_SECRET` y documentar las variables requeridas
- [x] 1.4 Reemplazar accesos directos a `process.env` por `ConfigService` en `app.module.ts`, `main.ts` y `calendar/providers/unsplash.provider.ts` (nota: `calendar/config/upload.config.ts` se mantiene con `process.env` porque sus constantes se evalúan en tiempo de import antes del DI; son vars opcionales con default ya declaradas en el esquema joi)

## 2. Manejo global de errores y validación

- [x] 2.1 Registrar `AllExceptionsFilter` como provider `APP_FILTER` en `AppModule`
- [x] 2.2 Endurecer el `ValidationPipe` global con `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
- [x] 2.3 Verificar que payloads con propiedades desconocidas devuelven 400 y que los errores conocidos mantienen el envelope `{ statusCode, message, error }`

## 3. Seguridad de autenticación

- [x] 3.1 Eliminar el fallback `'default-secret-change-in-production'` en `auth.module.ts` y `jwt.strategy.ts`; obtener el secret solo desde `ConfigService` (`getOrThrow`)
- [x] 3.2 Añadir `@Exclude()` al campo `password` de la entidad `User`
- [x] 3.3 Registrar `ClassSerializerInterceptor` como interceptor global y verificar que `password` no aparece en ninguna respuesta de usuario

## 4. Rate limiting y cabeceras de seguridad

- [x] 4.1 Configurar `ThrottlerModule` global con un límite por defecto y registrar `ThrottlerGuard` como guard global
- [x] 4.2 Aplicar `@Throttle()` estricto (5/min) en `/auth/login` y `/auth/refresh`; confirmar respuesta 429 al exceder
- [x] 4.3 Aplicar `helmet()` en `main.ts` y verificar cabeceras de seguridad en las respuestas, incluido `/uploads`

## 5. Integridad transaccional

- [x] 5.1 Refactorizar la creación de programa+grupos+secciones en `program.service.ts` para usar `DataSource.transaction()` / `EntityManager`
- [x] 5.2 Refactorizar las escrituras de evento+organizadores en `calendar.service.ts` para que sean atómicas
- [x] 5.3 Ejecutar `program.service.spec.ts` y `template-crud.service.spec.ts` y añadir un caso que verifique rollback ante fallo parcial

## 6. Health check y apagado controlado

- [x] 6.1 Crear `HealthModule` con `@nestjs/terminus` y endpoint `GET /api/health` que verifique la conexión a la base de datos
- [x] 6.2 Añadir `app.enableShutdownHooks()` en `main.ts`

## 7. Verificación e integración con frontend

- [x] 7.1 Verificar que la app falla al arrancar sin `JWT_SECRET` con mensaje claro (`Config validation error: "JWT_SECRET" is required`)
- [ ] 7.2 Regenerar el schema OpenAPI y el cliente del frontend para reflejar el código 429 y el envelope de error (requiere servidor en ejecución contra la DB; pendiente del lado frontend)
- [x] 7.3 Ejecutar lint, build y la suite de tests del backend; confirmar que todo pasa (build OK, 55/55 tests OK; lint mantiene los 84 problemas preexistentes, sin errores nuevos)
