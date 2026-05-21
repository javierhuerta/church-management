## ADDED Requirements

### Requirement: Cache de lecturas idempotentes públicas

El sistema SHALL cachear en memoria las respuestas de endpoints de lectura idempotentes y públicos, con TTL configurable.

#### Scenario: Lectura repetida sirve desde cache
- **WHEN** se invoca dos veces consecutivas `GET /api/hymns` dentro del TTL
- **THEN** la segunda respuesta se sirve desde cache sin consultar la base de datos

#### Scenario: Endpoint privado no se cachea
- **WHEN** un endpoint depende del usuario autenticado (sin ser estrictamente público)
- **THEN** sus respuestas NO se cachean para evitar filtrar contenido entre usuarios

### Requirement: Invalidación al mutar

El sistema SHALL invalidar las entradas de cache correspondientes cuando una mutación cambia los datos cacheados.

#### Scenario: Crear un nuevo himno
- **WHEN** se crea, actualiza o elimina un himno
- **THEN** las entradas de cache de los listados de himnos se invalidan

#### Scenario: Modificar un template
- **WHEN** se crea, actualiza o elimina un template
- **THEN** las entradas de cache `templates:all` y `templates:<id>` se invalidan
