## ADDED Requirements

### Requirement: Manejo centralizado de excepciones

El sistema SHALL capturar todas las excepciones no controladas mediante un exception filter registrado globalmente, de modo que ningún error escape sin transformarse en una respuesta HTTP estructurada.

#### Scenario: Excepción HTTP conocida
- **WHEN** un handler lanza una `HttpException` (por ejemplo `UnauthorizedException`)
- **THEN** la respuesta tiene el código de estado de la excepción y un cuerpo JSON con `statusCode`, `message` y `error`

#### Scenario: Error inesperado no controlado
- **WHEN** un handler lanza un error que no es una `HttpException`
- **THEN** la respuesta tiene código 500 con cuerpo `{ statusCode: 500, message: "Internal server error", error: "Internal Server Error" }` y no se filtran detalles internos ni stack traces

#### Scenario: Filtro activo en todos los módulos
- **WHEN** cualquier endpoint de cualquier módulo produce una excepción
- **THEN** el envelope de error es idéntico en estructura sin requerir configuración por módulo
