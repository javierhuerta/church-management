## MODIFIED Requirements

### Requirement: Espacio de API publico para el sitio

El sistema SHALL exponer un espacio de endpoints publicos bajo `/api/public/*`, sin autenticacion, destinado a alimentar el sitio web publico. Estos endpoints SHALL devolver unicamente contenido publicado/activo, ya agregado para la seccion que lo consume, sin exponer borradores ni datos sensibles. El endpoint `GET /api/public/gallery` SHALL estar disponible en este espacio, devolviendo los albumes e imagenes de galeria publicados.

#### Scenario: Galeria en el espacio publico
- **WHEN** el sitio consulta `/api/public/gallery`
- **THEN** el sistema responde con los albumes e imagenes publicados, sin token de autenticacion

### Requirement: Puente de integracion del sitio

El sitio publico SHALL contar con un puente (`window.IASD_API` en `website/integration.js`) que centraliza el consumo de `/api/public/*` mediante `fetch` de mismo origen, con manejo de errores y helpers de mapeo al formato que espera el diseno. Si la API falla, el sitio SHALL degradar de forma elegante (contenido por defecto/cache, sin romper la pagina).

El objeto `window.IASD_API` SHALL incluir ademas la funcion `fetchGallery()` que consume `/api/public/gallery` y mapea la respuesta al formato que `PageGaleria` espera, con manejo de errores y degradacion elegante.

#### Scenario: Consumo de galeria desde el sitio
- **WHEN** `PageGaleria` carga
- **THEN** obtiene los albumes publicados via `window.IASD_API.fetchGallery()` y los renderiza en la grilla de imagenes

#### Scenario: Degradacion ante error de API en galeria
- **WHEN** la API de galeria no responde
- **THEN** `PageGaleria` muestra un mensaje de contenido no disponible sin romper la pagina
