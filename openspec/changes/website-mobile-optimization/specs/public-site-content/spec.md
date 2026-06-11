# public-site-content (delta)

## MODIFIED Requirements

### Requirement: Puente de integracion del sitio

El sitio publico SHALL contar con un puente (`window.IASD_API` en `website/integration.js`) que centraliza el consumo de `/api/public/*` mediante `fetch` de mismo origen, con manejo de errores y helpers de mapeo al formato que espera el diseno. Si la API falla, el sitio SHALL degradar de forma elegante (contenido por defecto/cache, sin romper la pagina).

El objeto `window.IASD_API` SHALL incluir ademas las funciones `fetchLiveStatus()`, `fetchRecentSermons()` y `fetchGallery()` que consumen `/api/public/live`, `/api/public/sermons` y `/api/public/gallery` respectivamente, con mapeo de datos al formato esperado por el diseno del sitio y manejo de errores con degradacion elegante.

El sitio publico SHALL renderizarse correctamente en mobile (viewport ≤ 720px) sin scroll horizontal en ninguna de sus paginas. Los endpoints publicos SHALL mantener la misma forma de respuesta en mobile y desktop; los ajustes son solo de layout rendering (CSS + ajustes inline pequenos), no de logica de integracion ni de payload.

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

#### Scenario: Consumo de galeria desde el sitio
- **WHEN** `PageGaleria` carga
- **THEN** obtiene los albumes publicados via `window.IASD_API.fetchGallery()` y los renderiza en la grilla de imagenes

#### Scenario: Sitio responsive en mobile
- **WHEN** un usuario visita cualquier pagina del sitio publico con viewport ≤ 720px
- **THEN** el sitio renderiza sin scroll horizontal y los grids colapsan a 1-2 columnas
- **AND** los endpoints `/api/public/*` mantienen la misma forma de respuesta que en desktop
