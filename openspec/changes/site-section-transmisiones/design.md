## Contexto

El sitio público (`website/`) usa React 18 UMD + Babel-en-navegador, servido tal
cual desde `website/`. La sección "En Vivo" (`PageEnVivo` en `pages-3.jsx`) es una
pantalla con diseño oscuro (#0E1730) que muestra un reproductor/embed de YouTube,
un badge de "EN VIVO AHORA" condicional, y una grilla de predicaciones anteriores
hardcodeadas.

Este change reemplaza los datos hardcodeados por contenido real del canal de YouTube
de la iglesia (`https://www.youtube.com/@IASDCentralOsorno`), integrándose con la
YouTube Data API v3. El canal handle y el channel ID se configuran en el admin para
no hardcodearlos en el sitio.

Depende de `site-config-foundation`, que ya provee:
- `SiteSetting` (clave/valor) para configuraciones simples.
- `PublicSiteController` base (`/api/public/*`, sin guard).
- `integration.js` con `window.IASD_API.apiGet()`.
- Layout de Configuraciones por tabs.

## Goals / Non-Goals

**Goals:**
- Detectar en tiempo real si el canal está transmitiendo en vivo.
- Obtener los últimos videos publicados del canal.
- Permitir al Admin configurar el channelId/handle, opciones de embed y un toggle manual de respaldo.
- Cablear `PageEnVivo` para que consuma los endpoints públicos en vez de datos hardcodeados.
- Usar caché agresiva para no exceder la cuota gratuita de YouTube Data API (10,000 unidades/día).

**Non-Goals:**
- YouTube Analytics, playlists, chat en vivo.
- Múltiples canales.
- Webhooks/notificaciones de YouTube.

## Decisiones

### 1. YouTube Data API v3: enfoque de detección de "en vivo"

**Problema:** la YouTube Data API no tiene un endpoint directo tipo "is the channel
live?". La aproximación más común es usar `search.list` con `eventType=live` y
`channelId=X`, pero este endpoint **consume 100 unidades de cuota por llamada**
(contra 10,000 diarias gratuitas = solo 100 llamadas/día).

**Decisión:** usar `search.list` con `eventType=live` + `type=video` para detectar
el stream en vivo, pero con **caché agresiva**:

| Recurso | TTL de caché | Justificación |
|---------|-------------|---------------|
| `GET /public/live` | 60 segundos | Un minuto es suficiente para "en vivo ahora"; el badge no necesita actualización sub-segundo. 1,440 llamadas/día = 144,000 unidades — excede la cuota. → Necesitamos un TTL mayor en producción real: **300s (5 min)** = 288 llamadas/día = 28,800 unidades. Con 300s aún excede ligeramente. **600s (10 min)** = 144 llamadas/día = 14,400 unidades. El excedente de ~4,400 unidades puede manejarse con el toggle manual si la cuota se agota. |
| `GET /public/videos` | 600 segundos (10 min) | Los videos no cambian con frecuencia; 144 llamadas/día, search.list para videos consume 100 unidades → 14,400 unidades/día. Usar `playlistItems.list` con el uploads playlist del canal en vez de search: solo **1 unidad** por llamada. → 144 unidades/día. **Esta es la ruta preferida.** |

**Alternativa documentada pero no implementada en v1:** usar `search.list` para live
es caro. Una alternativa más barata es `videos.list` con el `id` del último video del
canal y verificar `snippet.liveBroadcastContent === 'live'`. Esto consume **1 unidad**
por llamada pero requiere saber el video ID primero (otra llamada). La combinación
`playlistItems` (uploads) → `videos.list` (live check) consume ~2 unidades por ciclo.

**Decisión pragmática para v1:**
1. Usar `search.list` con `eventType=live` para detectar si hay live (100 unidades). Caché de 600s.
2. Usar `playlistItems.list` del uploads playlist para videos recientes (1 unidad). Caché de 600s.
3. Si la cuota diaria se agota, el toggle manual `transmisiones.manualLiveOverride` permite al Admin forzar "en vivo" manualmente desde Configuraciones.
4. Documentar en el código la ruta de migración a la alternativa barata (`playlistItems → videos.list`) para v2.

### 2. Configuración: API key por env var, channelId por SiteSetting

**Decisión:** separar secreto de configuración:

| Dato | Dónde se guarda | Por qué |
|------|----------------|---------|
| `YOUTUBE_API_KEY` | Variable de entorno del backend (`.env`) | Es un secreto. No debe estar en BD ni ser visible en el admin. |
| `transmisiones.channelId` | `SiteSetting` | Es público (forma parte de URLs de YouTube). El Admin puede cambiarlo sin tocar el servidor. |
| `transmisiones.channelHandle` | `SiteSetting` | Ídem, público. |
| `transmisiones.embedEnabled` | `SiteSetting` | Flag de funcionalidad. |
| `transmisiones.manualLiveOverride` | `SiteSetting` | Toggle de respaldo manual. |

El `YouTubeService` lee `YOUTUBE_API_KEY` de `process.env` (o `ConfigService` de
NestJS) y los demás valores de `SiteConfigService.getSetting()`.

### 3. Endpoints públicos: forma de la respuesta

**`GET /api/public/live`** responde:
```json
{
  "isLive": true,
  "title": "Culto Divino · Sábado 11:00",
  "channelId": "UCxxxxxxxxxxxxxxxxxxxxx",
  "videoId": "dQw4w9WgXcQ",
  "embedUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0",
  "viewerCount": 42,
  "thumbnailUrl": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  "scheduledStartTime": null
}
```

Si no hay live:
```json
{
  "isLive": false,
  "channelId": "UCxxxxxxxxxxxxxxxxxxxxx",
  "embedUrl": "https://www.youtube.com/embed/live_stream?channel=UCxxxxxxxxxxxxxxxxxxxxx&autoplay=0",
  "upcomingTitle": null,
  "upcomingScheduledStart": "2026-06-06T15:00:00Z"
}
```

**`GET /api/public/videos`** responde un array:
```json
[
  {
    "id": "dQw4w9WgXcQ",
    "title": "La paciencia de Job",
    "description": "Pr. Esteban Soto · 17 may 2026",
    "thumbnailUrl": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    "publishedAt": "2026-05-17T15:30:00Z",
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }
]
```

Limitado a los últimos 9 videos (la grilla del diseño es 3×3).

### 4. Caché: reutilizar CacheModule global

El `app.module.ts` ya registra `CacheModule.registerAsync({ isGlobal: true })`. El
`YouTubeService` inyecta `@Inject(CACHE_MANAGER) Cache` y usa `cache.get/set` con
TTLs diferenciados. Las claves de caché incluyen el channelId para invalidación
automática si el Admin cambia de canal.

### 5. Tab "Transmisiones" en Configuraciones

Formulario admin con:

| Campo | Tipo | SiteSetting key | Validación |
|-------|------|----------------|-----------|
| ID del canal | text input | `transmisiones.channelId` | Formato UC + 22 chars |
| Handle del canal | text input | `transmisiones.channelHandle` | Sin @, solo letras/números |
| Habilitar embed | switch | `transmisiones.embedEnabled` | boolean |
| Forzar "en vivo" (manual) | switch + badge warning | `transmisiones.manualLiveOverride` | boolean |

Además, un indicador de estado de la API key (lee de un endpoint dedicado o
simplemente verifica si `process.env.YOUTUBE_API_KEY` está definido vía un
endpoint `GET /api/site-config/youtube/status` que devuelva `{ apiKeyConfigured:
boolean }`).

### 6. Parche a PageEnVivo (pages-3.jsx)

Cambios mínimos y documentados en `INTEGRATION.md` para facilitar re-aplicación
ante actualizaciones del diseño:

```javascript
// ANTES (hardcodeado):
function PageEnVivo({ isLive }) {
  const past = [{ d: '17 may 2026', t: '...', p: '...', url: YOUTUBE_CHANNEL_URL }, ...];
  // ...
}

// DESPUÉS (consumiendo API):
function PageEnVivo() {
  const [liveData, setLiveData] = useState(null);
  const [videos, setVideos] = useState([]);
  
  useEffect(() => {
    window.IASD_API.fetchLiveStatus().then(setLiveData).catch(() => setLiveData({ isLive: false }));
    window.IASD_API.fetchRecentVideos().then(setVideos).catch(() => setVideos([]));
  }, []);
  
  const isLive = liveData?.isLive || false;
  const embedUrl = liveData?.embedUrl || YOUTUBE_FALLBACK_EMBED_URL;
  // ...
}
```

### 7. Manejo de errores y degradación

| Escenario | Comportamiento |
|-----------|---------------|
| API key no configurada | `live` → `isLive: false`; `videos` → `[]`. El servicio loguea warning. |
| Cuota de YouTube excedida (403 quotaExceeded) | Ídem, pero respeta `manualLiveOverride`. Log de error. |
| Canal no encontrado (404) | `live` → `isLive: false`; `videos` → `[]`. Log de warning. |
| Timeout de YouTube API (>5s) | Circuit-breaker simple: tras 3 fallos consecutivos, servir caché stale o degradar por 5 min. |
| `manualLiveOverride = true` | `live.isLive = true` **siempre**, independientemente de la API. Útil para cultos especiales. |

El frontend del sitio (`PageEnVivo`) siempre muestra algo: si no hay datos de la
API, muestra el estado por defecto con el mensaje "Próxima transmisión · Sábado
11:00" y oculta la grilla de videos (o muestra un placeholder).

## Permisos

- **Escritura de configuración (tab Transmisiones):** `Admin`.
- **Lectura de endpoints públicos (`/api/public/live`, `/api/public/videos`):**
  anónima (sin token).

## Riesgos / Notas

- **Cuota de YouTube:** el endpoint `search.list` para live es caro (100 unidades).
  Con 600s de caché = 144 llamadas/día = 14,400 unidades. La cuota gratuita es
  10,000/día. Se necesita solicitar cuota adicional a Google (formulario gratuito,
  suele aprobarse para iglesias/organizaciones sin fines de lucro) o migrar al
  enfoque alternativo en v2. Mientras tanto, el toggle manual mitiga el riesgo.
- **Dependencia externa:** si YouTube cambia su API o el canal es eliminado, el
  sistema degrada sin romperse.
- **Caché en memoria:** si el backend tiene múltiples instancias, cada una tiene
  su propia caché. Para producción con >1 instancia, considerar Redis (el
  `CacheModule` de NestJS lo soporta con cambio de configuración mínimo).
- **CORS:** innecesario porque el sitio público y la API comparten origen en
  producción (mismo nginx).

## Diseño visual

Cargar la skill `church-ui-design` antes de implementar componentes del admin.

### Tab "Transmisiones" (admin)

- **Layout:** formulario vertical con secciones agrupadas: "Canal de YouTube",
  "Opciones de embed", "Control manual".
- **Colores:** usar clases semánticas Tailwind según la skill (`bg-card`,
  `text-foreground`, `border-border`). El badge de estado de API key usa colores
  de la skill: verde esmeralda para "Configurada", rojo para "No configurada".
- **Tipografía:** jerarquía de la skill (`title-lg` para el título de sección,
  `body-base` para labels, `body-sm` para textos de ayuda).
- **Mobile/desktop:** en desktop, formulario en una columna centrada (max-w-2xl).
  En mobile, full-width con padding lateral.
- El toggle `manualLiveOverride` muestra un badge amarillo de advertencia cuando
  está activo: "⚠️ El estado 'En vivo' está forzado manualmente".

### Sitio público (PageEnVivo)

- **Sin cambios visuales:** el diseño actual de `PageEnVivo` se conserva (fondo
  #0E1730, tipografía serif/mono con colores #F0E8D2, #C9A26B, #D4B07A, layout
  del reproductor 16:9, grilla de videos 3 columnas).
- Los únicos cambios son en los **datos**: `isLive`, `embedUrl`, y el array de
  videos vienen de la API en vez de estar hardcodeados.

## UI Scenarios

### Scenario: Admin configura el canal de YouTube para Transmisiones

- **URL**: `/admin/configuraciones/transmisiones`
- **Description**: Un administrador configura el channel ID, handle, y opciones de embed para la sección de transmisiones.
- **Steps**:
  1. `login` as `Admin`
  2. `navigate` to `/admin/configuraciones`
  3. `click` tab `data-testid="config-tab-transmisiones"`
  4. `expect` page heading text `Transmisiones`
  5. `expect` input `data-testid="transmisiones-channelId-input"` visible
  6. `type` into `data-testid="transmisiones-channelId-input"` text `UCxxxxxxxxxxxxxxxxxxxxx`
  7. `type` into `data-testid="transmisiones-channelHandle-input"` text `IASDCentralOsorno`
  8. `click` switch `data-testid="transmisiones-embedEnabled-switch"` (on)
  9. `click` button `data-testid="transmisiones-save-button"`
  10. `expect` success toast "Configuración guardada"

```
+------------------------------------------------------+
| Configuraciones                                      |
+------------------------------------------------------+
| [Inicio] [Liderazgo] [Transmisiones] ...             |
+------------------------------------------------------+
| Transmisiones                                        |
|                                                      |
| Canal de YouTube                                     |
| ┌──────────────────────────────────────────────────┐ |
| │ ID del canal     [UCxxxxxxxxxxxxxxxxxxxxx      ] │ |
| │ Handle           [IASDCentralOsorno           ] │ |
| └──────────────────────────────────────────────────┘ |
|                                                      |
| Opciones de embed                                    |
| ┌──────────────────────────────────────────────────┐ |
| │ Habilitar embed  [on]                            │ |
| └──────────────────────────────────────────────────┘ |
|                                                      |
| Control manual                                       |
| ┌──────────────────────────────────────────────────┐ |
| │ Forzar "en vivo" [off]                           │ |
| │ ⚠️ Solo activar si YouTube no detecta el stream  │ |
| └──────────────────────────────────────────────────┘ |
|                                                      |
| Estado de API                                        |
| 🔴 API Key de YouTube: No configurada                |
|                                                      |
|                          [Guardar configuración]     |
+------------------------------------------------------+
```

### Scenario: Visitante ve la página En Vivo con datos reales

- **URL**: `/#en-vivo`
- **Description**: Un visitante anónimo del sitio público ve la sección "En Vivo" con datos reales del canal de YouTube.
- **Steps**:
  1. `navigate` to site public URL (no login)
  2. `navigate` to section "En Vivo" or hash `#en-vivo`
  3. `expect` page shows YouTube player area
  4. `expect` if channel is live: badge "EN VIVO AHORA" visible
  5. `expect` if channel not live: text "Próxima transmisión" visible
  6. `expect` grid of recent videos visible (3 columns on desktop)
  7. `expect` each video card has title and date

```
+------------------------------------------------------+
|                        EN VIVO                        |
|  ┌────────────────────────────────────────────────┐  |
|  │  🔴 EN VIVO AHORA                              │  |
|  └────────────────────────────────────────────────┘  |
|                                                      |
|  Culto Divino en vivo                                |
|  Únete cada sábado a las 11:00 h por YouTube.       |
|                                                      |
|  ┌────────────────────────────────────────────────┐  |
|  │                                                │  |
|  │         REPRODUCTOR YOUTUBE (16:9)             │  |
|  │                                                │  |
|  │              [▶]  DIRECT   YouTube · IASD      │  |
|  └────────────────────────────────────────────────┘  |
|                                                      |
|  [Ver en vivo en YouTube]  [Suscribirse al canal]    |
|                                                      |
|  PREDICACIÓN · MATEO 6:25–34                         |
|  No se preocupen por la vida                         |
|  Pr. Israel Jaramillo · Sábado 23 de mayo, 2026      |
|                                                      |
|  ───────────────────────────────────────────────     |
|  Predicaciones anteriores                            |
|  Vuelve a escuchar                                   |
|                                                      |
|  ┌─────────┐ ┌─────────┐ ┌─────────┐               |
|  │ Video 1 │ │ Video 2 │ │ Video 3 │               |
|  └─────────┘ └─────────┘ └─────────┘               |
|                                                      |
|  [Ver canal completo en YouTube]                     |
+------------------------------------------------------+
```
