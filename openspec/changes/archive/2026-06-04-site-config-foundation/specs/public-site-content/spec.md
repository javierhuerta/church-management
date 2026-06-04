## ADDED Requirements

### Requirement: Espacio de API público para el sitio

El sistema SHALL exponer un espacio de endpoints públicos bajo `/api/public/*`, sin
autenticación, destinado a alimentar el sitio web público. Estos endpoints SHALL
devolver únicamente contenido publicado/activo, ya agregado para la sección que lo
consume, sin exponer borradores ni datos sensibles.

#### Scenario: Lectura anónima
- **WHEN** el sitio público (sin token) solicita contenido a un endpoint `/api/public/*`
- **THEN** el sistema responde con el contenido publicado sin requerir autenticación

#### Scenario: No exponer borradores
- **WHEN** existe contenido en estado borrador/no publicado
- **THEN** los endpoints `/api/public/*` no lo incluyen en la respuesta

### Requirement: Puente de integración del sitio

El sitio público SHALL contar con un puente (`window.IASD_API` en
`website/integration.js`) que centraliza el consumo de `/api/public/*` mediante
`fetch` de mismo origen, con manejo de errores y helpers de mapeo al formato que
espera el diseño. Si la API falla, el sitio SHALL degradar de forma elegante
(contenido por defecto/cache, sin romper la página).

#### Scenario: Consumo de contenido vivo
- **WHEN** una sección del sitio carga
- **THEN** obtiene su contenido vía `window.IASD_API` desde `/api/public/*`

#### Scenario: Degradación ante error de API
- **WHEN** la API no responde o falla
- **THEN** la sección muestra contenido por defecto/cache sin romperse
