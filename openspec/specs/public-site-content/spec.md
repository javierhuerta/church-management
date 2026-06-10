# public-site-content

## Purpose

Definir la especificacion principal del espacio de endpoints publicos y del puente de integracion `window.IASD_API` que alimenta el sitio web publico desde `/api/public/*`, sin autenticacion, con degradacion elegante ante errores.

## Requirements

### Requirement: Espacio de API publico para el sitio

El sistema SHALL exponer un espacio de endpoints publicos bajo `/api/public/*`, sin autenticacion, destinado a alimentar el sitio web publico. Estos endpoints SHALL devolver unicamente contenido publicado/activo, ya agregado para la seccion que lo consume, sin exponer borradores ni datos sensibles.

#### Scenario: Lectura anonima
- **WHEN** el sitio publico (sin token) solicita contenido a un endpoint `/api/public/*`
- **THEN** el sistema responde con el contenido publicado sin requerir autenticacion

#### Scenario: No exponer borradores
- **WHEN** existe contenido en estado borrador/no publicado
- **THEN** los endpoints `/api/public/*` no lo incluyen en la respuesta

### Requirement: Puente de integracion del sitio

El sitio publico SHALL contar con un puente (`window.IASD_API` en `website/integration.js`) que centraliza el consumo de `/api/public/*` mediante `fetch` de mismo origen, con manejo de errores y helpers de mapeo al formato que espera el diseno. Si la API falla, el sitio SHALL degradar de forma elegante (contenido por defecto/cache, sin romper la pagina).

El objeto `window.IASD_API` SHALL incluir ademas las funciones `fetchLiveStatus()` y `fetchRecentSermons()` que consumen `/api/public/live` y `/api/public/sermons` respectivamente, con mapeo de datos al formato esperado por el diseno del sitio y manejo de errores con degradacion elegante.

#### Scenario: Consumo de contenido vivo
- **WHEN** una seccion del sitio carga
- **THEN** obtiene su contenido via `window.IASD_API` desde `/api/public/*`

#### Scenario: Degradacion ante error de API
- **WHEN** la API no responde o falla
- **THEN** la seccion muestra contenido por defecto/cache sin romperse

#### Scenario: fetchLiveStatus disponible
- **WHEN** el sitio publico carga `integration.js`
- **THEN** `window.IASD_API.fetchLiveStatus` es una funcion que devuelve una promesa con el estado en vivo

#### Scenario: fetchRecentSermons disponible
- **WHEN** el sitio publico carga `integration.js`
- **THEN** `window.IASD_API.fetchRecentSermons` es una funcion que devuelve una promesa con el array de predicaciones publicadas
