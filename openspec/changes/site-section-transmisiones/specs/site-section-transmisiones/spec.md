## ADDED Requirements

### Requirement: Badge "En vivo" controlado manualmente

El sistema SHALL exponer el estado de transmisión en vivo del sitio público a
partir de un toggle manual `transmisiones.isLiveManual` (SiteSetting boolean) que
el administrador enciende/apaga. NO SHALL existir detección automática ni consulta
a la YouTube Data API. El endpoint `GET /api/public/live` SHALL reportar `isLive`
igual al valor de `transmisiones.isLiveManual`.

#### Scenario: Toggle manual encendido
- **WHEN** el administrador enciende `transmisiones.isLiveManual` y se consulta `GET /api/public/live`
- **THEN** el sistema responde con `isLive: true`, el `channelId`, el `channelHandle`
  y la `embedUrl` del canal

#### Scenario: Toggle manual apagado
- **WHEN** `transmisiones.isLiveManual` está apagado y se consulta `GET /api/public/live`
- **THEN** el sistema responde con `isLive: false` y la misma `embedUrl` del canal

#### Scenario: Canal no configurado
- **WHEN** no hay `transmisiones.channelId` configurado y se consulta `GET /api/public/live`
- **THEN** el sistema responde con `isLive` según el toggle y `embedUrl: null`, sin error

### Requirement: Reproductor con embed nativo de YouTube

El sistema SHALL construir la URL de embed usando el embed nativo
`https://www.youtube.com/embed/live_stream?channel={channelId}&autoplay=0`, que
YouTube resuelve automáticamente a la transmisión activa del canal si existe. NO
SHALL requerir API Key, video ID del stream, ni llamadas a la YouTube Data API.

#### Scenario: Embed con canal configurado
- **WHEN** `transmisiones.channelId` está configurado y se consulta `GET /api/public/live`
- **THEN** el sistema responde con `embedUrl` apuntando a
  `embed/live_stream?channel={channelId}&autoplay=0`

### Requirement: Predicaciones curadas desde el admin

El sistema SHALL permitir al administrador gestionar predicaciones anteriores como
entidad `SermonVideo` con los campos: `videoId`, `title`, `preacher`, `reference`
(cita bíblica, opcional), `date`, `thumbnailUrl` (derivada del `videoId`),
`isPublished` y `order`. El administrador SHALL poder crear, editar, eliminar,
reordenar y publicar/ocultar cada predicación. Solo las predicaciones con
`isPublished = true` SHALL aparecer en el sitio público.

#### Scenario: Crear predicación
- **WHEN** un administrador crea una predicación con un `videoId`, título,
  predicador y fecha válidos
- **THEN** el sistema persiste el `SermonVideo`, deriva `thumbnailUrl` como
  `https://i.ytimg.com/vi/{videoId}/hqdefault.jpg` y lo deja sin publicar por defecto

#### Scenario: Publicar predicación
- **WHEN** un administrador alterna el estado de publicación de una predicación
- **THEN** el sistema actualiza `isPublished` y la predicación aparece o desaparece
  del listado público en consecuencia

#### Scenario: Eliminar predicación
- **WHEN** un administrador elimina una predicación
- **THEN** el sistema borra el registro y la predicación deja de aparecer en el sitio

### Requirement: Auto-rellenar título vía YouTube oEmbed

El sistema SHALL ofrecer un helper que, dado un `videoId` o una URL de YouTube,
consulte el endpoint público `https://www.youtube.com/oembed` (sin API Key, gratis)
y devuelva el título y el autor sugeridos para auto-rellenar el formulario de
creación de predicaciones. Si la consulta a oEmbed falla, el sistema SHALL degradar
devolviendo un título vacío para que el administrador lo complete manualmente.

#### Scenario: oEmbed resuelve el título
- **WHEN** el administrador pega una URL de YouTube válida y el sistema consulta oEmbed
- **THEN** el sistema devuelve el `title` y el `authorName` del video para
  auto-sugerir el formulario

#### Scenario: oEmbed falla
- **WHEN** la consulta a oEmbed falla (red, video privado, 404)
- **THEN** el sistema devuelve un resultado con `title` vacío, sin romper, y el
  administrador completa el título a mano

#### Scenario: Aceptar URL o videoId
- **WHEN** el administrador ingresa una URL completa de YouTube o solo el videoId
- **THEN** el sistema extrae correctamente el `videoId` en ambos casos

### Requirement: Listado público de predicaciones con destacada

El sistema SHALL exponer `GET /api/public/sermons` con las predicaciones publicadas,
ordenadas con la de fecha más reciente primero (la "destacada") y el resto a
continuación, limitado a ~9–10 elementos. Cada elemento SHALL incluir `id`,
`videoId`, `title`, `preacher`, `reference`, `date`, `thumbnailUrl` y `url`
(`https://www.youtube.com/watch?v={videoId}`).

#### Scenario: Obtener predicaciones publicadas
- **WHEN** se consulta `GET /api/public/sermons` y hay predicaciones publicadas
- **THEN** el sistema responde con un array (máx. ~9–10), la de fecha más reciente
  primero, cada una con sus metadatos y la `url` al video

#### Scenario: Sin predicaciones publicadas
- **WHEN** se consulta `GET /api/public/sermons` y no hay predicaciones publicadas
- **THEN** el sistema responde con un array vacío

### Requirement: Configuración del canal desde el admin

El sistema SHALL permitir al administrador configurar, desde la pestaña
"Transmisiones" de Configuraciones, el `channelId`, el `channelHandle` (sin `@`) y
el toggle `isLiveManual` del canal de YouTube, persistidos como `SiteSetting`. NO
SHALL requerir ni exponer ninguna API Key de YouTube.

#### Scenario: Guardar configuración del canal
- **WHEN** un administrador guarda `channelId`, `channelHandle` e `isLiveManual` en
  la pestaña Transmisiones
- **THEN** el sistema persiste los valores en `transmisiones.channelId`,
  `transmisiones.channelHandle` y `transmisiones.isLiveManual`, y los endpoints
  públicos los reflejan

#### Scenario: Solo Admin puede configurar
- **WHEN** un usuario sin rol `Admin` intenta acceder a los endpoints de
  administración de transmisiones
- **THEN** el sistema rechaza la petición (401/403)

### Requirement: Endpoints públicos sin autenticación

Los endpoints `GET /api/public/live` y `GET /api/public/sermons` SHALL ser
accesibles sin autenticación (anónimos), para que el sitio público los consuma
directamente. SHALL devolver únicamente datos públicos, sin exponer
configuraciones internas ni credenciales.

#### Scenario: Acceso anónimo a live
- **WHEN** el sitio público (sin token) solicita `GET /api/public/live`
- **THEN** el sistema responde con el estado en vivo y la `embedUrl` sin requerir token

#### Scenario: Acceso anónimo a sermons
- **WHEN** el sitio público (sin token) solicita `GET /api/public/sermons`
- **THEN** el sistema responde con las predicaciones publicadas sin requerir token

### Requirement: Integración con el sitio público vía integration.js

El sitio público SHALL consumir los endpoints de transmisiones a través de
`window.IASD_API` en `website/integration.js`, con funciones `fetchLiveStatus()` y
`fetchRecentSermons()` que mapean las respuestas al formato esperado por
`PageEnVivo`. La primera predicación SHALL usarse como destacada y el resto en la
grilla. Si la API falla, `PageEnVivo` SHALL mostrar el estado por defecto sin
romperse, conservando el diseño visual existente.

#### Scenario: PageEnVivo consume datos reales
- **WHEN** un visitante carga la sección "En Vivo" del sitio público
- **THEN** `PageEnVivo` obtiene el estado en vivo y las predicaciones desde
  `window.IASD_API.fetchLiveStatus()` y `window.IASD_API.fetchRecentSermons()`, y
  muestra la destacada arriba y el resto en la grilla

#### Scenario: Degradación ante fallo de API en el sitio
- **WHEN** `fetchLiveStatus()` o `fetchRecentSermons()` fallan (red, timeout)
- **THEN** `PageEnVivo` muestra el estado por defecto ("Próxima transmisión · Sábado
  11:00") y oculta la grilla, sin errores visibles ni cambios en el diseño

## MODIFIED Requirements

### Requirement: Ampliación del puente de integración del sitio

El objeto `window.IASD_API` SHALL incluir las funciones `fetchLiveStatus()` y
`fetchRecentSermons()` que consumen `/api/public/live` y `/api/public/sermons`
respectivamente, con mapeo de datos al formato esperado por el diseño del sitio y
manejo de errores con degradación elegante.

> Modifica: `public-site-content` → *Requirement: Puente de integración del sitio* de `site-config-foundation`.

#### Scenario: fetchLiveStatus disponible
- **WHEN** el sitio público carga `integration.js`
- **THEN** `window.IASD_API.fetchLiveStatus` es una función que devuelve una promesa
  con el estado en vivo

#### Scenario: fetchRecentSermons disponible
- **WHEN** el sitio público carga `integration.js`
- **THEN** `window.IASD_API.fetchRecentSermons` es una función que devuelve una
  promesa con el array de predicaciones publicadas
