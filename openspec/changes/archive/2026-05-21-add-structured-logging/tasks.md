## 1. Configuración

- [x] 1.1 Añadir `LOG_LEVEL` al esquema joi de `ConfigModule` (default `log`) y aplicar el nivel al `Logger` en `main.ts`

## 2. Interceptor de logging

- [x] 2.1 Crear `common/interceptors/logging.interceptor.ts`: medir latencia, generar/propagar `requestId` (header `x-request-id`), loguear método/ruta/status/ms
- [x] 2.2 Registrar el interceptor como `APP_INTERCEPTOR` en `AppModule` (después del `ClassSerializerInterceptor`)
- [x] 2.3 Dejar `/api/health` en nivel `debug` para no inundar el log

## 3. Logging de errores

- [x] 3.1 En `AllExceptionsFilter`: loguear 500 con stack + requestId; `HttpException` a nivel `warn`/`debug` sin stack

## 4. Logger en servicios

- [x] 4.1 Añadir `Logger` con contexto por clase en `auth`, `calendar`, `worship-services` y `departments` services (eventos relevantes: creación, publicación, fallos)

## 5. Verificación

- [x] 5.1 Confirmar que los logs no incluyen body ni headers de autenticación
- [x] 5.2 Build, lint y tests verdes
