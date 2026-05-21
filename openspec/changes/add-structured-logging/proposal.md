## Why

La auditoría contra `nestjs-best-practices` marcó `devops-use-logging` y `api-use-interceptors` como gaps: hoy solo hay un `Logger` puntual (Unsplash) y ningún logging estructurado de requests. Sin trazas consistentes de peticiones, errores y latencia, operar y depurar la API en producción es a ciegas.

## What Changes

- **Interceptor global de logging de requests**: método, ruta, status, latencia (ms) y un id de correlación por petición.
- **`Logger` de NestJS consistente** en los servicios (reemplazar/expandir el uso ad-hoc), con contexto por clase.
- **El exception filter global registra** las excepciones no controladas (500) con stack, sin filtrar detalles al cliente.
- **Nivel de log configurable** por entorno (`LOG_LEVEL`).

## Capabilities

### New Capabilities
- `structured-logging`: logging consistente y estructurado de requests, errores y latencia en toda la API.

### Modified Capabilities
- `global-error-handling`: el filtro ahora también registra (log) las excepciones no controladas.

## Impact

- **Módulos**: `AppModule` (interceptor global vía `APP_INTERCEPTOR`), `common/filters` (logging en el filtro), servicios que ganan `Logger`.
- **Dependencias**: ninguna obligatoria (usar `Logger` nativo de Nest); opcional `nestjs-pino` si se quiere JSON — fuera de alcance inicial.
- **Roles/permisos**: sin cambios.

## Fuera del alcance

- Transporte a un agregador externo (ELK, Loki, Datadog).
- Logs en formato JSON / pino (se puede agregar luego).
- Métricas (Prometheus) y tracing distribuido.
