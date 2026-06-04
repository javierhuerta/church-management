## ADDED Requirements

### Requirement: Detección de transmisión en vivo del canal de YouTube

El sistema SHALL detectar si el canal de YouTube configurado está transmitiendo en
vivo en este momento, consultando la YouTube Data API v3 con caché para no exceder
la cuota. El resultado SHALL incluir: si hay transmisión en vivo, el título del
stream, el ID del video, la URL de embed, y la miniatura.

La detección SHALL usar caché con TTL configurable (por defecto 600 segundos) para
limitar las llamadas a la API de YouTube.

#### Scenario: Canal está transmitiendo en vivo
- **WHEN** el canal de YouTube está transmitiendo en vivo y se consulta `GET /api/public/live`
- **THEN** el sistema responde con `isLive: true`, el título del stream, la URL de
  embed con el video ID activo, y la miniatura

#### Scenario: Canal no está transmitiendo
- **WHEN** el canal de YouTube no está transmitiendo en vivo y se consulta `GET /api/public/live`
- **THEN** el sistema responde con `isLive: false` y la URL de embed genérica del canal

#### Scenario: API key de YouTube no configurada
- **WHEN** la variable de entorno `YOUTUBE_API_KEY` no está definida
- **THEN** el endpoint `GET /api/public/live` responde con `isLive: false` sin
  intentar llamar a la API de YouTube, registrando un warning

#### Scenario: Cuota de YouTube excedida
- **WHEN** la YouTube Data API devuelve error 403 por cuota excedida
- **THEN** el sistema responde con `isLive: false` (o respeta el toggle manual si
  está activo), registrando un error, sin romper la respuesta

### Requirement: Listado de últimos videos del canal

El sistema SHALL obtener los últimos videos publicados en el canal de YouTube
configurado, usando la playlist de uploads del canal (`playlistItems.list`) para
minimizar el consumo de cuota (1 unidad por llamada). SHALL devolver hasta 9
videos con título, fecha de publicación, miniatura y URL.

#### Scenario: Obtener videos recientes
- **WHEN** se consulta `GET /api/public/videos` y el canal tiene videos publicados
- **THEN** el sistema responde con un array de videos (máximo 9), cada uno con
  título, fecha, miniatura y URL al video en YouTube

#### Scenario: Canal sin videos
- **WHEN** se consulta `GET /api/public/videos` y el canal no tiene videos públicos
- **THEN** el sistema responde con un array vacío

### Requirement: Toggle manual de respaldo "en vivo"

El sistema SHALL permitir al administrador activar un toggle manual
(`transmisiones.manualLiveOverride`) que fuerce el estado `isLive: true` en el
endpoint público, independientemente del resultado de la YouTube Data API. Esto
sirve como respaldo si la API falla, excede cuota, o para transmisiones en otras
plataformas.

#### Scenario: Toggle manual activado
- **WHEN** el administrador activa `transmisiones.manualLiveOverride` y se consulta
  `GET /api/public/live`
- **THEN** el sistema responde con `isLive: true` incluso si la API de YouTube no
  detecta transmisión

#### Scenario: Toggle manual desactivado
- **WHEN** el administrador desactiva `transmisiones.manualLiveOverride`
- **THEN** el sistema vuelve a usar la detección automática vía YouTube Data API

### Requirement: Configuración del canal de YouTube desde el admin

El sistema SHALL permitir al administrador configurar, desde la pestaña
"Transmisiones" de Configuraciones, el channel ID y el handle del canal de YouTube,
la habilitación del embed, y el toggle manual de respaldo. La API key de YouTube
SHALL configurarse exclusivamente por variable de entorno del backend y NO SHALL
ser visible ni editable desde el admin.

#### Scenario: Configurar channel ID
- **WHEN** un administrador guarda un channel ID válido en la pestaña Transmisiones
- **THEN** el sistema persiste el valor en `transmisiones.channelId` y los endpoints
  públicos usan ese canal

#### Scenario: Channel ID inválido
- **WHEN** un administrador ingresa un channel ID que no cumple el formato UC + 22
  caracteres
- **THEN** el sistema rechaza el valor con un mensaje de validación

#### Scenario: API key visible como estado
- **WHEN** un administrador abre la pestaña Transmisiones
- **THEN** el sistema muestra si la API key está configurada o no en el backend
  (indicador verde/rojo), pero nunca muestra el valor de la clave

### Requirement: Endpoints públicos sin autenticación

Los endpoints `GET /api/public/live` y `GET /api/public/videos` SHALL ser
accesibles sin autenticación (anónimos), para que el sitio público los consuma
directamente. SHALL devolver únicamente datos públicos del canal de YouTube, sin
exponer configuraciones internas.

#### Scenario: Acceso anónimo a live
- **WHEN** el sitio público (sin token) solicita `GET /api/public/live`
- **THEN** el sistema responde con el estado en vivo sin requerir autenticación

#### Scenario: Acceso anónimo a videos
- **WHEN** el sitio público (sin token) solicita `GET /api/public/videos`
- **THEN** el sistema responde con los videos sin requerir autenticación

### Requirement: Integración con el sitio público vía integration.js

El sitio público SHALL consumir los endpoints de transmisiones a través de
`window.IASD_API` en `website/integration.js`, con funciones `fetchLiveStatus()`
y `fetchRecentVideos()` que mapean las respuestas de la API al formato esperado
por `PageEnVivo`. Si la API falla, la página SHALL mostrar el estado por defecto
sin romperse.

#### Scenario: PageEnVivo consume datos reales
- **WHEN** un visitante carga la sección "En Vivo" del sitio público
- **THEN** `PageEnVivo` obtiene el estado en vivo y los videos desde
  `window.IASD_API.fetchLiveStatus()` y `window.IASD_API.fetchRecentVideos()`

#### Scenario: Degradación ante fallo de API en el sitio
- **WHEN** `fetchLiveStatus()` o `fetchRecentVideos()` fallan (error de red, timeout)
- **THEN** `PageEnVivo` muestra el estado por defecto ("Próxima transmisión · Sábado
  11:00") y oculta la grilla de videos sin lanzar errores visibles al usuario

### Requirement: Caché para protección de cuota

El sistema SHALL cachear las respuestas de la YouTube Data API para no exceder la
cuota diaria. La caché de estado en vivo SHALL tener un TTL de 600 segundos; la
caché de videos SHALL tener un TTL de 600 segundos. La caché SHALL invalidarse si
el administrador cambia el channel ID configurado.

#### Scenario: Segunda llamada en ventana de caché
- **WHEN** se consulta `GET /api/public/live` dos veces en menos de 600 segundos
- **THEN** la segunda llamada sirve el valor cacheado sin consumir cuota de YouTube

#### Scenario: Cambio de canal invalida caché
- **WHEN** el administrador cambia el `transmisiones.channelId`
- **THEN** la siguiente consulta a `GET /api/public/live` o `GET /api/public/videos`
  consulta la API de YouTube con el nuevo canal y re-puebla la caché

## MODIFIED Requirements

### Requirement: Ampliación del puente de integración del sitio

El objeto `window.IASD_API` SHALL incluir las funciones `fetchLiveStatus()` y
`fetchRecentVideos()` que consumen `/api/public/live` y `/api/public/videos`
respectivamente, con mapeo de datos al formato esperado por el diseño del sitio
y manejo de errores con degradación elegante.

> Modifica: `public-site-content` → *Requirement: Puente de integración del sitio* de `site-config-foundation`.

#### Scenario: fetchLiveStatus disponible
- **WHEN** el sitio público carga `integration.js`
- **THEN** `window.IASD_API.fetchLiveStatus` es una función que devuelve una promesa
  con el estado en vivo

#### Scenario: fetchRecentVideos disponible
- **WHEN** el sitio público carga `integration.js`
- **THEN** `window.IASD_API.fetchRecentVideos` es una función que devuelve una
  promesa con el array de videos
