## ADDED Requirements

### Requirement: Logging de requests

El sistema SHALL registrar cada petición HTTP con su método, ruta, código de estado y latencia en milisegundos, asociada a un id de correlación.

#### Scenario: Petición exitosa
- **WHEN** se completa una petición HTTP
- **THEN** el sistema emite una línea de log con método, ruta, status y latencia (ms) y el id de correlación

#### Scenario: Id de correlación
- **WHEN** una petición incluye el header `x-request-id`
- **THEN** el sistema reutiliza ese valor como id de correlación; si no viene, genera uno

### Requirement: Logging de errores no controlados

El sistema SHALL registrar las excepciones no controladas (500) con su stack y el id de correlación, sin exponer detalles internos en la respuesta.

#### Scenario: Excepción no controlada
- **WHEN** un handler lanza un error que no es `HttpException`
- **THEN** el sistema registra el error con stack y requestId, y responde 500 con el envelope genérico

#### Scenario: Excepción HTTP esperada
- **WHEN** un handler lanza una `HttpException`
- **THEN** el sistema la registra a nivel reducido (sin stack) y responde con su código

### Requirement: Nivel de log configurable

El sistema SHALL permitir configurar el nivel de log por entorno.

#### Scenario: Nivel por entorno
- **WHEN** se define `LOG_LEVEL` en la configuración
- **THEN** el sistema emite solo los logs de ese nivel o superior
