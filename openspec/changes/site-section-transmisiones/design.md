## Contexto

El sitio público (`website/`) usa React 18 UMD + Babel-en-navegador, servido tal
cual desde `website/`. La sección "En Vivo" (`PageEnVivo` en `pages-3.jsx`) es una
pantalla con diseño oscuro (`#0E1730`) que muestra un reproductor/embed de YouTube,
un badge "EN VIVO AHORA" condicional, una predicación destacada (meta de culto) y
una grilla de predicaciones anteriores hardcodeadas.

Este change reemplaza los datos hardcodeados por contenido real y administrable,
**sin YouTube Data API**: el embed nativo del canal muestra la transmisión activa
automáticamente, un toggle manual controla el badge, y las predicaciones se curan a
mano desde el admin replicando el patrón del módulo `gallery`.

Depende de `site-config-foundation`, que ya provee:
- `SiteSetting` (clave/valor) para configuraciones simples.
- `PublicSiteController` base (`/api/public/*`, sin guard).
- `integration.js` con `window.IASD_API.apiGet()`.
- Layout de Configuraciones por tabs (la tab "Transmisiones" ya está cableada).

## Goals / Non-Goals

**Goals:**
- Mostrar el badge "EN VIVO AHORA" según un toggle manual que el admin enciende
  antes del culto.
- Reproducir la transmisión activa del canal con el embed nativo de YouTube
  (`embed/live_stream?channel=...`), que YouTube resuelve automáticamente.
- Permitir al Admin curar predicaciones anteriores: pegar URL de YouTube → título
  auto-sugerido vía oEmbed → editar predicador/cita/fecha → publicar/reordenar.
- Servir una predicación destacada (la publicada más reciente) y el resto en grilla.
- Cablear `PageEnVivo` para que consuma los endpoints públicos.

**Non-Goals:**
- Detección automática de "en vivo", YouTube Data API, API Key, cuota, caché de cuota.
- Importación automática de videos, playlists, chat en vivo, Analytics.
- Múltiples canales.
- Cambiar el diseño visual de `PageEnVivo`.

## Decisiones

### 1. Detección "En vivo": embed nativo + toggle manual (sin API)

**Problema:** la YouTube Data API no tiene un endpoint barato para "¿el canal está
en vivo?". `search.list eventType=live` cuesta 100 unidades/llamada → excede la
cuota gratuita. Cero dependencia externa es la prioridad del usuario.

**Decisión:**
- **Reproductor**: usa el embed nativo `https://www.youtube.com/embed/live_stream?channel={channelId}&autoplay=0`.
  YouTube muestra automáticamente la transmisión activa si existe, o el último
  contenido si no. No requiere API ni saber el video ID del stream.
- **Badge "EN VIVO AHORA"**: se controla con un toggle manual
  `transmisiones.isLiveManual` (SiteSetting boolean) que el admin enciende/apaga
  antes/después del culto. **No hay detección automática.** El `isLiveManual` ES el
  control del badge — no es un "override" de fallback de cuota porque no hay cuota.

### 2. Predicaciones anteriores: entidad curada (patrón gallery)

**Decisión:** nueva entidad `SermonVideo`, replicando el patrón
`GalleryAlbum`/`GalleryImage` (extiende `BaseEntity` → `id` uuid + timestamps,
`@JoinColumn` cuando aplique, repos propios en seeders).

| Campo          | Tipo                      | Notas |
|----------------|---------------------------|-------|
| `videoId`      | `varchar`                 | Extraído de la URL de YouTube. |
| `title`        | `varchar`                 | Auto-sugerido vía oEmbed; editable. |
| `preacher`     | `varchar`                 | Predicador; inferido del título si es posible. |
| `reference`    | `varchar` nullable        | Cita bíblica, ej. "Mateo 6:25–34". |
| `date`         | `date`                    | Fecha de la predicación. |
| `thumbnailUrl` | `varchar`                 | Derivada: `https://i.ytimg.com/vi/{videoId}/hqdefault.jpg`. |
| `isPublished`  | `boolean` (default false) | Solo publicadas salen en el sitio. |
| `order`        | `integer` (default 0)     | Orden manual en la grilla. |

`thumbnailUrl` se deriva en el servicio al crear/editar, a partir de `videoId`.

**Reglas de DTOs (AGENTS.md, para el codegen):**
- `reference` (`string | null`): `@ApiPropertyOptional({ type: String, nullable: true })`.
- Campos requeridos (`title`, `preacher`, `videoId`): `@ApiProperty({ type: String })`.
- **No** usar `@ApiPropertyOptional({ nullable: true })` sin `type` (genera
  `Record<string, any>`).

### 3. Auto-rellenar título vía oEmbed (sin API Key)

**Decisión:** el servicio expone un helper `resolveOembed(videoIdOrUrl)` que:
1. Normaliza la entrada a `videoId` (acepta URL completa o ID).
2. Hace `GET https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={videoId}&format=json`
   (público, gratis, sin key) usando `HttpService` (axios) de NestJS.
3. Devuelve `{ videoId, title, authorName, thumbnailUrl }`.

El admin lo dispara al pegar la URL para auto-sugerir el título; puede editarlo.
**Heurística opcional**: inferir `preacher` del título cuando contenga un patrón
reconocible (ej. "Pr. Nombre"); si no, queda vacío para que el admin lo complete.

**Degradación:** si oEmbed falla (red, video privado, 404), el endpoint devuelve un
resultado parcial (`title` vacío) y el admin llena el título a mano. Nunca rompe.

### 4. Predicación destacada (lógica de endpoint, no campo)

**Decisión:** no hay campo "destacada". La predicación publicada con la `date` más
reciente se sirve **primero** en `GET /api/public/sermons`; el frontend la muestra
grande arriba (la meta de culto de `PageEnVivo`) y el resto va a la grilla 3×3. El
endpoint ordena por `date DESC` (y `order` como desempate), limitado a ~9–10.

### 5. Config del canal (SiteSettings)

Reusa el patrón `getSetting`/`setSetting` de `gallery.service.ts`:

| Dato                          | Tipo    | SiteSetting key |
|-------------------------------|---------|-----------------|
| ID del canal                  | string  | `transmisiones.channelId` |
| Handle del canal (sin @)      | string  | `transmisiones.channelHandle` |
| ¿Transmitiendo en vivo ahora? | boolean | `transmisiones.isLiveManual` |

**No** se incluye `embedEnabled`, **no** hay endpoint de status de API key, **no**
hay `manualLiveOverride` con lógica de fallback de cuota (ya no hay cuota).

### 6. Endpoints públicos: forma de la respuesta

**`GET /api/public/live`:**
```json
{
  "isLive": true,
  "channelId": "UCxxxxxxxxxxxxxxxxxxxxx",
  "channelHandle": "IASDCentralOsorno",
  "embedUrl": "https://www.youtube.com/embed/live_stream?channel=UCxxxxxxxxxxxxxxxxxxxxx&autoplay=0"
}
```
`isLive` viene directo de `transmisiones.isLiveManual`. Si no hay channelId
configurado, `embedUrl` puede venir `null` y el sitio degrada al estado por defecto.

**`GET /api/public/sermons`:** array (destacada primero), máx. ~9–10:
```json
[
  {
    "id": "uuid",
    "videoId": "dQw4w9WgXcQ",
    "title": "No se preocupen por la vida",
    "preacher": "Pr. Israel Jaramillo",
    "reference": "Mateo 6:25–34",
    "date": "2026-05-23",
    "thumbnailUrl": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }
]
```

Ambos endpoints anónimos (sin token), en `PublicTransmisionesController`
(`@Controller('public')`).

### 7. Tab "Transmisiones" en Configuraciones

La tab, ruta (`/admin/configuraciones/transmisiones`) y card ya existen. Solo se
reemplaza el contenido placeholder de `transmisiones-config-page.tsx` por:

**Bloque A — Config del canal:**

| Campo                          | Tipo                  | Key |
|--------------------------------|-----------------------|-----|
| ID del canal                   | text input            | `transmisiones.channelId` |
| Handle del canal               | text input            | `transmisiones.channelHandle` |
| Estamos transmitiendo en vivo  | switch + badge warning| `transmisiones.isLiveManual` |

El switch `isLiveManual` muestra un badge amarillo cuando está activo: "⚠️ El badge
'EN VIVO AHORA' está encendido en el sitio público".

**Bloque B — CRUD de predicaciones (patrón galería):**
- Lista de cards (cada una con thumbnail, título, predicador, fecha, estado).
- "Agregar predicación": input para pegar URL de YouTube → al pegar, llama al
  helper de oEmbed → auto-rellena título → form con predicador/cita/fecha.
- Acciones por card: editar, publicar/ocultar, reordenar (drag o flechas),
  eliminar (con dialog de confirmación).

### 8. Parche a PageEnVivo (pages-3.jsx)

Cambios mínimos documentados en `INTEGRATION.md`:

```javascript
// ANTES (hardcodeado):
function PageEnVivo({ isLive }) {
  const past = [{ d: '17 may 2026', t: '...', p: '...', url: YOUTUBE_CHANNEL_URL }, ...];
  // YOUTUBE_EMBED_URL con UC_PLACEHOLDER_CHANNEL_ID; meta de culto fija
}

// DESPUÉS (consumiendo API):
function PageEnVivo() {
  const [live, setLive] = useState(null);
  const [sermons, setSermons] = useState([]);
  useEffect(() => {
    window.IASD_API.fetchLiveStatus().then(setLive).catch(() => setLive({ isLive: false }));
    window.IASD_API.fetchRecentSermons().then(setSermons).catch(() => setSermons([]));
  }, []);
  const isLive   = live?.isLive || false;
  const embedUrl = live?.embedUrl || YOUTUBE_FALLBACK_EMBED_URL;
  const featured = sermons[0];        // destacada
  const past     = sermons.slice(1);  // grilla
}
```

`fetchRecentSermons()` mapea cada predicación al shape que la grilla espera
(`{ d, t, p, url, thumb }`). La meta de culto destacada usa `sermons[0]`.

### 9. Manejo de errores y degradación

| Escenario | Comportamiento |
|-----------|---------------|
| channelId no configurado | `live.embedUrl = null`; el sitio muestra estado por defecto. |
| oEmbed falla al agregar predicación | El admin recibe `title` vacío y lo completa a mano. |
| `fetchLiveStatus`/`fetchRecentSermons` fallan en el sitio | `PageEnVivo` muestra "Próxima transmisión · Sábado 11:00" y oculta la grilla, sin errores visibles. |
| `isLiveManual = false` | El badge "EN VIVO AHORA" no se muestra (estado normal). |

## Permisos

- **Escritura (config + CRUD de predicaciones, tab Transmisiones):** `Admin`
  (`JwtAuthGuard + RolesGuard + @Roles(UserRole.Admin)`).
- **Lectura de endpoints públicos (`/api/public/live`, `/api/public/sermons`):**
  anónima (sin token).

## Riesgos / Notas

- **Estado "en vivo" manual:** el badge depende de que el admin lo encienda/apague.
  Es una decisión consciente (cero dependencia externa); se mitiga con UI clara
  (badge de advertencia cuando está activo).
- **oEmbed externo:** depende de `youtube.com/oembed` (público, sin key). Si falla,
  el admin llena el título manualmente — no es bloqueante.
- **Embed nativo:** `live_stream?channel=ID` muestra la transmisión activa si
  existe; si no, muestra el último contenido del canal (comportamiento de YouTube).
- **CORS:** innecesario porque sitio público y API comparten origen en producción
  (mismo nginx).

## Diseño visual

Cargar la skill `church-ui-design` antes de implementar componentes del admin.

### Tab "Transmisiones" (admin)

- **Layout:** dos bloques verticales: "Canal de YouTube" (config) y "Predicaciones"
  (CRUD). Mismo patrón visual que la config de Galería.
- **Colores:** clases semánticas Tailwind según la skill (`bg-card`,
  `text-foreground`, `border-border`). El badge de `isLiveManual` activo usa el
  amarillo de advertencia de la skill.
- **Tipografía:** jerarquía de la skill (sin tags HTML semánticos): título de bloque,
  labels, textos de ayuda según las clases de la skill.
- **Mobile/desktop (patrón obligatorio):** desktop → form en columna centrada
  (`max-w-2xl`) + grilla de cards de predicaciones 2–3 columnas. Mobile → full-width
  con padding lateral, cards apiladas en una columna. Split explícito según la skill.
- Las cards de predicación reusan el patrón de cards de la Galería (thumbnail +
  metadatos + acciones overlay/inline).

### Sitio público (PageEnVivo)

- **Sin cambios visuales:** se conserva el diseño actual (fondo `#0E1730`,
  tipografía serif/mono con `#F0E8D2`, `#C9A26B`, `#D4B07A`, reproductor 16:9,
  grilla de predicaciones 3 columnas). Solo cambian los **datos** (de la API).

## UI Scenarios

### Scenario: Admin configura el canal y enciende el badge "en vivo"

- **URL**: `/admin/configuraciones/transmisiones`
- **Description**: Un administrador configura el channelId/handle y enciende el
  toggle manual de "en vivo" antes de un culto.
- **Steps**:
  1. `login` as `Admin`
  2. `navigate` to `/admin/configuraciones`
  3. `click` tab `data-testid="config-tab-transmisiones"`
  4. `expect` page heading text `Transmisiones`
  5. `expect` input `data-testid="transmisiones-channelId-input"` visible
  6. `type` into `data-testid="transmisiones-channelId-input"` text `UCxxxxxxxxxxxxxxxxxxxxx`
  7. `type` into `data-testid="transmisiones-channelHandle-input"` text `IASDCentralOsorno`
  8. `click` switch `data-testid="transmisiones-isLiveManual-switch"` (on)
  9. `expect` warning badge `data-testid="transmisiones-live-warning"` visible
  10. `click` button `data-testid="transmisiones-save-button"`
  11. `expect` success toast "Configuración guardada"

```
+------------------------------------------------------+
| Configuraciones                                      |
+------------------------------------------------------+
| [Inicio] [Liderazgo] [Transmisiones] [Galería] ...   |
+------------------------------------------------------+
| Transmisiones                                        |
|                                                      |
| Canal de YouTube                                     |
| ┌──────────────────────────────────────────────────┐ |
| │ ID del canal     [UCxxxxxxxxxxxxxxxxxxxxx      ] │ |
| │ Handle           [IASDCentralOsorno           ] │ |
| │ ¿En vivo ahora?  [on]                           │ |
| │ ⚠️ El badge "EN VIVO AHORA" está encendido      │ |
| └──────────────────────────────────────────────────┘ |
|                          [Guardar configuración]     |
+------------------------------------------------------+
```

### Scenario: Admin agrega una predicación pegando una URL de YouTube

- **URL**: `/admin/configuraciones/transmisiones`
- **Description**: El admin agrega una predicación pegando la URL del video; el
  título se auto-rellena vía oEmbed y el admin completa predicador, cita y fecha.
- **Steps**:
  1. `login` as `Admin`
  2. `navigate` to `/admin/configuraciones/transmisiones`
  3. `click` button `data-testid="sermon-add-button"`
  4. `type` into `data-testid="sermon-url-input"` text `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
  5. `expect` input `data-testid="sermon-title-input"` value auto-filled (no vacío)
  6. `type` into `data-testid="sermon-preacher-input"` text `Pr. Israel Jaramillo`
  7. `type` into `data-testid="sermon-reference-input"` text `Mateo 6:25–34`
  8. `type` into `data-testid="sermon-date-input"` text `2026-05-23`
  9. `click` button `data-testid="sermon-save-button"`
  10. `expect` card `data-testid="sermon-card"` visible in list
  11. `click` button `data-testid="sermon-publish-toggle"` (publicar)
  12. `expect` success toast "Predicación guardada"

```
+------------------------------------------------------+
| Predicaciones                          [+ Agregar]   |
+------------------------------------------------------+
| Nueva predicación                                    |
| URL de YouTube  [https://youtube.com/watch?v=...   ] |
| Título          [No se preocupen por la vida      ]  | ← auto (oEmbed)
| Predicador      [Pr. Israel Jaramillo             ]  |
| Cita bíblica    [Mateo 6:25–34                     ]  |
| Fecha           [2026-05-23]                          |
|                                  [Cancelar] [Guardar] |
+------------------------------------------------------+
| ┌────────┐ ┌────────┐ ┌────────┐                    |
| │ thumb  │ │ thumb  │ │ thumb  │   (publicar/editar/  |
| │ título │ │ título │ │ título │    eliminar en hover)|
| └────────┘ └────────┘ └────────┘                    |
+------------------------------------------------------+
```

### Scenario: Visitante ve la página En Vivo con datos reales

- **URL**: `/#en-vivo`
- **Description**: Un visitante anónimo ve la sección "En Vivo" con el badge según
  `isLiveManual`, el embed del canal, la predicación destacada y la grilla.
- **Steps**:
  1. `navigate` to site public URL (no login)
  2. `navigate` to section "En Vivo" or hash `#en-vivo`
  3. `expect` page shows YouTube player area (iframe del canal)
  4. `expect` if `isLiveManual` is on: badge "EN VIVO AHORA" visible
  5. `expect` if `isLiveManual` is off: text "Próxima transmisión" visible
  6. `expect` featured sermon (título + predicador + cita) visible above the grid
  7. `expect` grid of past sermons visible (3 columns on desktop)
  8. `expect` each sermon card has thumbnail, title and date

```
+------------------------------------------------------+
|                        EN VIVO                        |
|  ┌────────────────────────────────────────────────┐  |
|  │  🔴 EN VIVO AHORA   (si isLiveManual = on)     │  |
|  └────────────────────────────────────────────────┘  |
|  Culto Divino en vivo                                |
|  ┌────────────────────────────────────────────────┐  |
|  │   REPRODUCTOR YOUTUBE (embed/live_stream 16:9)  │  |
|  └────────────────────────────────────────────────┘  |
|  [Ver en vivo en YouTube]  [Suscribirse al canal]    |
|                                                      |
|  PREDICACIÓN · MATEO 6:25–34          ← destacada     |
|  No se preocupen por la vida           (sermons[0])   |
|  Pr. Israel Jaramillo · 23 de mayo, 2026             |
|  ───────────────────────────────────────────────     |
|  Predicaciones anteriores                            |
|  ┌─────────┐ ┌─────────┐ ┌─────────┐               |
|  │ Sermón1 │ │ Sermón2 │ │ Sermón3 │  (sermons[1..]) |
|  └─────────┘ └─────────┘ └─────────┘               |
|  [Ver canal completo en YouTube]                     |
+------------------------------------------------------+
```
