## Context

Solo existe un `Logger` puntual (Unsplash). El `AllExceptionsFilter` global ya está registrado pero no registra (log) las excepciones. Falta visibilidad de requests/latencia/errores.

## Goals / Non-Goals

**Goals:** logging consistente de requests (método/ruta/status/latencia/correlación), Logger por clase en servicios, log de 500 en el filtro, nivel configurable.

**Non-Goals:** agregador externo, formato JSON/pino, métricas, tracing.

## Decisions

**1. `LoggingInterceptor` global vía `APP_INTERCEPTOR`.** Mide latencia con `Date.now()` alrededor de `next.handle()` y loguea al completar/errores con `Logger`. Alternativa descartada: middleware Express — no tiene acceso al resultado/observable ni al contexto de Nest.

**2. Id de correlación por request.** Generar un `requestId` (uuid) si no viene en header `x-request-id`, adjuntarlo al request y a cada línea de log. Permite correlacionar request + error.

**3. Usar el `Logger` nativo de NestJS, no pino (por ahora).** Cero dependencias nuevas, integra con el formato de Nest. `nestjs-pino`/JSON queda para cuando exista un agregador.

**4. Logging en el `AllExceptionsFilter`.** Las 500 se loguean con stack y el `requestId`; las `HttpException` esperadas se loguean a nivel `warn`/`debug` sin stack.

## Risks / Trade-offs

- **[Riesgo] Loguear payloads filtra datos sensibles** → loguear solo método/ruta/status/latencia/requestId, nunca body ni headers de auth.
- **[Trade-off] Ruido en logs** → nivel configurable por `LOG_LEVEL`; requests de health a nivel `debug`.

## Migration Plan

1. Añadir `LoggingInterceptor` + `APP_INTERCEPTOR`.
2. Añadir logging al filtro de excepciones.
3. Introducir `Logger` por clase en los servicios principales.
4. Configurar `LOG_LEVEL` en el esquema de env.

## Open Questions

- ¿Excluir `/api/health` del log de requests (o dejarlo en `debug`)?
