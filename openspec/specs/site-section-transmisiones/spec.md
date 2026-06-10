# site-section-transmisiones

## Purpose

Definir la especificacion principal para la seccion "En Vivo / Transmisiones" del sitio publico, con badge de transmision en vivo controlado manualmente, embed nativo del canal de YouTube y listado de predicaciones anteriores curadas desde el admin (con predicacion destacada). Todo administrable desde Configuraciones, sin YouTube Data API, sin API Key, sin cuota.

## Requirements

### Requirement: Badge "En vivo" controlado manualmente

El sistema SHALL exponer el estado de transmision en vivo del sitio publico a partir de un toggle manual `transmisiones.isLiveManual` (SiteSetting boolean) que el administrador enciende/apaga. NO SHALL existir deteccion automatica ni consulta a la YouTube Data API. El endpoint `GET /api/public/live` SHALL reportar `isLive` igual al valor de `transmisiones.isLiveManual`.

#### Scenario: Toggle manual encendido
- **WHEN** el administrador enciende `transmisiones.isLiveManual` y se consulta `GET /api/public/live`
- **THEN** el sistema responde con `isLive: true`, el `channelId`, el `channelHandle` y la `embedUrl` del canal

#### Scenario: Toggle manual apagado
- **WHEN** `transmisiones.isLiveManual` esta apagado y se consulta `GET /api/public/live`
- **THEN** el sistema responde con `isLive: false` y la misma `embedUrl` del canal

#### Scenario: Canal no configurado
- **WHEN** no hay `transmisiones.channelId` configurado y se consulta `GET /api/public/live`
- **THEN** el sistema responde con `isLive` segun el toggle y `embedUrl: null`, sin error

### Requirement: Reproductor con embed nativo de YouTube

El sistema SHALL construir la URL de embed usando el embed nativo `https://www.youtube.com/embed/live_stream?channel={channelId}&autoplay=0`, que YouTube resuelve automaticamente a la transmision activa del canal si existe. NO SHALL requerir API Key, video ID del stream, ni llamadas a la YouTube Data API.

#### Scenario: Embed con canal configurado
- **WHEN** `transmisiones.channelId` esta configurado y se consulta `GET /api/public/live`
- **THEN** el sistema responde con `embedUrl` apuntando a `embed/live_stream?channel={channelId}&autoplay=0`

### Requirement: Predicaciones curadas desde el admin

El sistema SHALL permitir al administrador gestionar predicaciones anteriores como entidad `SermonVideo` con los campos: `videoId`, `title`, `preacher`, `reference` (cita biblica, opcional), `date`, `thumbnailUrl` (derivada del `videoId`), `isPublished` y `order`. El administrador SHALL poder crear, editar, eliminar, reordenar y publicar/ocultar cada predicacion. Solo las predicaciones con `isPublished = true` SHALL aparecer en el sitio publico.

#### Scenario: Crear predicacion
- **WHEN** un administrador crea una predicacion con un `videoId`, titulo, predicador y fecha validos
- **THEN** el sistema persiste el `SermonVideo`, deriva `thumbnailUrl` como `https://i.ytimg.com/vi/{videoId}/hqdefault.jpg` y lo deja sin publicar por defecto

#### Scenario: Publicar predicacion
- **WHEN** un administrador alterna el estado de publicacion de una predicacion
- **THEN** el sistema actualiza `isPublished` y la predicacion aparece o desaparece del listado publico en consecuencia

#### Scenario: Eliminar predicacion
- **WHEN** un administrador elimina una predicacion
- **THEN** el sistema borra el registro y la predicacion deja de aparecer en el sitio

### Requirement: Auto-rellenar titulo via YouTube oEmbed

El sistema SHALL ofrecer un helper que, dado un `videoId` o una URL de YouTube, consulte el endpoint publico `https://www.youtube.com/oembed` (sin API Key, gratis) y devuelva el titulo y el autor sugeridos para auto-rellenar el formulario de creacion de predicaciones. Si la consulta a oEmbed falla, el sistema SHALL degradar devolviendo un titulo vacio para que el administrador lo complete manualmente.

#### Scenario: oEmbed resuelve el titulo
- **WHEN** el administrador pega una URL de YouTube valida y el sistema consulta oEmbed
- **THEN** el sistema devuelve el `title` y el `authorName` del video para auto-sugerir el formulario

#### Scenario: oEmbed falla
- **WHEN** la consulta a oEmbed falla (red, video privado, 404)
- **THEN** el sistema devuelve un resultado con `title` vacio, sin romper, y el administrador completa el titulo a mano

#### Scenario: Aceptar URL o videoId
- **WHEN** el administrador ingresa una URL completa de YouTube o solo el videoId
- **THEN** el sistema extrae correctamente el `videoId` en ambos casos

### Requirement: Listado publico de predicaciones con destacada

El sistema SHALL exponer `GET /api/public/sermons` con las predicaciones publicadas, ordenadas con la de fecha mas reciente primero (la "destacada") y el resto a continuacion, limitado a ~9-10 elementos. Cada elemento SHALL incluir `id`, `videoId`, `title`, `preacher`, `reference`, `date`, `thumbnailUrl` y `url` (`https://www.youtube.com/watch?v={videoId}`).

#### Scenario: Obtener predicaciones publicadas
- **WHEN** se consulta `GET /api/public/sermons` y hay predicaciones publicadas
- **THEN** el sistema responde con un array (max. ~9-10), la de fecha mas reciente primero, cada una con sus metadatos y la `url` al video

#### Scenario: Sin predicaciones publicadas
- **WHEN** se consulta `GET /api/public/sermons` y no hay predicaciones publicadas
- **THEN** el sistema responde con un array vacio

### Requirement: Configuracion del canal desde el admin

El sistema SHALL permitir al administrador configurar, desde la pestana "Transmisiones" de Configuraciones, el `channelId`, el `channelHandle` (sin `@`) y el toggle `isLiveManual` del canal de YouTube, persistidos como `SiteSetting`. NO SHALL requerir ni exponer ninguna API Key de YouTube.

#### Scenario: Guardar configuracion del canal
- **WHEN** un administrador guarda `channelId`, `channelHandle` e `isLiveManual` en la pestana Transmisiones
- **THEN** el sistema persiste los valores en `transmisiones.channelId`, `transmisiones.channelHandle` y `transmisiones.isLiveManual`, y los endpoints publicos los reflejan

#### Scenario: Solo Admin puede configurar
- **WHEN** un usuario sin rol `Admin` intenta acceder a los endpoints de administracion de transmisiones
- **THEN** el sistema rechaza la peticion (401/403)

### Requirement: Endpoints publicos sin autenticacion

Los endpoints `GET /api/public/live` y `GET /api/public/sermons` SHALL ser accesibles sin autenticacion (anonimos), para que el sitio publico los consuma directamente. SHALL devolver unicamente datos publicos, sin exponer configuraciones internas ni credenciales.

#### Scenario: Acceso anonimo a live
- **WHEN** el sitio publico (sin token) solicita `GET /api/public/live`
- **THEN** el sistema responde con el estado en vivo y la `embedUrl` sin requerir token

#### Scenario: Acceso anonimo a sermons
- **WHEN** el sitio publico (sin token) solicita `GET /api/public/sermons`
- **THEN** el sistema responde con las predicaciones publicadas sin requerir token
