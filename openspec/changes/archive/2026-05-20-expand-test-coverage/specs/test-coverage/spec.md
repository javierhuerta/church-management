## ADDED Requirements

### Requirement: Pruebas e2e de los flujos críticos

El sistema SHALL incluir pruebas e2e (Supertest) que ejerciten autenticación, validación estricta, RBAC, rate limiting y health check sobre la app real montada en test.

#### Scenario: Login y rate limit
- **WHEN** se hace login válido y luego se exceden 5 intentos en un minuto
- **THEN** los primeros 5 responden 200/401 según corresponda y el sexto responde 429

#### Scenario: Validación estricta
- **WHEN** se envía un payload con una propiedad no declarada en el DTO
- **THEN** la API responde 400 con el envelope `{ statusCode, message, error }`

#### Scenario: Control de acceso por rol
- **WHEN** un usuario sin rol editor intenta crear un evento de calendar
- **THEN** la API responde 403; con un rol editor, responde 201

#### Scenario: Health check
- **WHEN** se consulta `GET /api/health`
- **THEN** la API responde 200 con el estado de la base de datos

### Requirement: Mock de servicios externos en tests

El sistema SHALL mockear las llamadas a servicios externos (Unsplash) en los tests, cubriendo éxito, fallo HTTP, ausencia de configuración y cache.

#### Scenario: Provider sin configuración
- **WHEN** `UNSPLASH_ACCESS_KEY` no está definida y se invoca `search`
- **THEN** el provider lanza un error indicando que no está configurado, sin tocar la red

#### Scenario: Respuesta de error de Unsplash
- **WHEN** Unsplash responde 5xx (mock)
- **THEN** el provider registra el fallo y lanza un error que el llamador puede manejar

#### Scenario: Cache hit
- **WHEN** se invoca `search` con la misma query/page dos veces consecutivas
- **THEN** la segunda llamada NO invoca `fetch`
