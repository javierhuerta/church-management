# Integración del sitio público con el backend

Este directorio es el **export de Claude Artifacts** del sitio público (React 18
UMD + Babel en navegador). Se sirve tal cual para poder reemplazarlo cuando llegue
una actualización del diseño.

Para conectar el sitio con la aplicación (admin en `/admin`, API en `/api`) se
hicieron **cambios mínimos y localizados**. Si llega una versión nueva del diseño,
re-aplicar solo estos parches:

## Archivos nuevos (no parte del export, se conservan siempre)

- `integration.js` — puente con la API del backend. Expone `window.IASD_API`:
  - `apiGet(path)` → helper genérico para GET requests a `/api/*`. Devuelve JSON.
  - `fetchEvents()` → eventos publicados (`GET /api/calendar`) mapeados al shape
    del diseño `{ id, date, start, title, loc, featured }`.
  - `fetchWorship()` → culto público (`GET /api/public/worship`) para Programa e Inicio,
    incluyendo fallback de plantilla cuando no hay programa publicado.
  - `mapEvent(ev)` → mapea un evento del backend al shape del diseño.
- `Dockerfile`, `nginx.conf`, `.dockerignore` — empaquetado/serving.

## Parches sobre archivos del diseño

1. **`index.html`** — cargar el puente:
   ```html
   <script src="image-slot.js"></script>
   <script src="integration.js"></script>   <!-- AÑADIDO -->
   ```

2. **`auth.jsx`** — acceso administrativo → `/admin/`:
   - Constante al inicio: `const ADMIN_URL = '/admin/';`
   - `UserBadge`: el botón "Acceder" es un `<a href={ADMIN_URL}>` (antes
     `setPage('acceso')`).
   - `useStore()`: efecto que llama `window.IASD_API.fetchEvents()` y reemplaza
     los eventos demo por los reales.

3. **`pages-5.jsx`** — el botón "Iniciar sesión" de Documentos es un
   `<a href={ADMIN_URL}>` (antes `setPage('acceso')`).

4. **`ui.jsx`** — se eliminó el botón "Documentos" de la navegación (Nav).
   Documentos es contenido privado que se gestiona en `/admin/documentos`.

5. **`app.jsx`** — se eliminó `'documentos'` de `VALID_PAGES` y del `switch` de
   páginas. `PageDocumentos` quedó como código muerto en `pages-5.jsx` pero no es
   accesible desde el sitio público.

6. **`pages-1.jsx`** — `PageNosotros` (Liderazgo) consume datos vivos:
   - Se agregaron `useState` y `useEffect` al inicio de la función.
   - Los arrays hardcodeados `board` y `ministries` se conservan como
     `DEFAULT_BOARD` y `DEFAULT_MINISTRIES` (fallback).
   - Al montar, se llama `window.IASD_API.fetchLeadership()` y se reemplazan
     los arrays si la API responde con datos.
   - La foto grupal usa `<img src={boardPhotoUrl}>` si existe, sino `PhotoSlot`.
   - Los retratos de líderes usan `<img src={p.photoUrl}>` si existe, sino
     `PhotoSlot` con fallback.

7. **`pages-1.jsx`** — `PageInicio` consume datos vivos:
   - Se agregaron `useState` y `useEffect` al inicio de la función.
   - Los textos e imágenes hardcodeados se conservan como `DEFAULT_HOME` (fallback).
   - Al montar, se llama `window.IASD_API.fetchHome()` y se reemplazan los datos si la API responde.
    - Se agregaron props `src` a los `PhotoSlot` del hero para mostrar las imágenes subidas desde el admin.
    - Los enlaces de redes sociales y el CTA final ahora son dinámicos.
    - La tarjeta "Próximo culto" ahora consume `window.IASD_API.fetchWorship()`.
      - Muestra siempre fecha + título.
      - Muestra predicador + tema solo cuando `upcoming: true`.
      - Si `upcoming: false`, muestra indicador sutil de "programa aún no publicado".

8. **`pages-4.jsx`** — `PagePrograma` consume datos vivos de culto:
   - Se eliminó edición inline en la vista pública (no `EditBanner`, no add/remove/move).
   - Al montar, llama `window.IASD_API.fetchWorship()` y renderiza el programa desde API.
   - Si no hay programa publicado, renderiza fallback de plantilla (estructura de partes) en vez de pantalla vacía.
   - Se conserva `ToolbarBar` y la generación de PDF.

## Secciones removidas del sitio público

- **Documentos**: contenido privado, se gestiona en el módulo de Documentos del
  admin (`/admin/documentos`). No tiene tab en Configuraciones ni aparece en el
  sitio público.

## Patrón de integración por sección

Cada sección del sitio público se conecta al backend siguiendo este patrón:

1. **Backend**: cada section change agrega su endpoint público en
   `PublicSiteController` (p.ej. `GET /api/public/home`, `GET /api/public/leadership`).

2. **`integration.js`**: cada section change agrega:
   - Un helper `fetchXxx()` que llama a `apiGet('/public/xxx')`.
   - Un helper `mapXxxData(data)` si se necesita transformación.

3. **Página del diseño**: cada section change parchea la página correspondiente
   (p.ej. `PageInicio` en `pages-1.jsx`) para que al montar llame a
   `window.IASD_API.fetchXxx()` y reemplace los datos hardcodeados por los datos
   de la API, con fallback a los valores por defecto si la API falla.

Ejemplos de cambios ya implementados:
- **Calendario**: `fetchEvents()` ya existe y se llama desde `useStore()` en
  `auth.jsx`. Los eventos se mapean con `mapEvent()`.
- **Liderazgo**: pendiente (`site-section-liderazgo`). Agregar
  `fetchLeadership()` y parchear `PageNosotros`.

9. **`pages-2.jsx`** — `PageHorarios` consume datos vivos:
   - Se agregaron `useState` y `useEffect` al inicio de la función.
   - Los arrays hardcodeados `week` y textos se conservan como `DEFAULT_WEEK` y
     `DEFAULT_TEXTS` (fallback).
   - Al montar, se llama `window.IASD_API.fetchSchedule()` y se reemplazan los
     datos si la API responde con días activos.
   - La respuesta de la API (`{ kicker, title, paragraph, days }`) se mapea al
     shape del diseño `{ d, accent, items: [[time, title, description]] }`.
   - Si la API falla, se muestra el contenido hardcodeado sin error visible.

## Sección Calendario

El Calendario del sitio público se alimenta directamente del módulo Calendario
del admin. Solo los eventos con estado `published` son visibles para usuarios
anónimos (sin token).

- **Endpoint**: `GET /api/calendar?startDate=YYYY-MM-DD&limit=100`
- **Integración**: `fetchEvents()` en `integration.js` + `useStore()` en `auth.jsx`
- **Zona horaria**: las fechas se convierten con `new Date(ev.startDate)` en hora
  local del navegador. El backend almacena en UTC.
- **Fallback**: si la API falla, `useStore()` mantiene los eventos demo del diseño.
- **Admin**: crear/publicar un evento en `/admin/calendario` lo refleja
  automáticamente en el sitio público (sin configuración adicional).

## Sección Transmisiones (En Vivo)

Parche aplicado sobre `pages-3.jsx` (`PageEnVivo`) para consumir datos reales del backend.

### Endpoints consumidos

- `GET /api/public/live` → `{ isLive: boolean, channelId: string, channelHandle: string, embedUrl: string|null }`
  - `isLive` viene del toggle manual `transmisiones.isLiveManual` (SiteSetting).
  - `embedUrl` es `null` si `channelId` no está configurado.
- `GET /api/public/sermons` → array de predicaciones publicadas, destacada primero (más reciente).
  - Cada item: `{ id, videoId, title, preacher, reference, date, thumbnailUrl, url, isPublished, order }`.

### Helpers agregados a `integration.js`

- `fetchLiveStatus()` — llama a `apiGet('/public/live')`. El caller hace catch (igual que `fetchWorship`).
- `fetchRecentSermons()` — llama a `apiGet('/public/sermons')`, mapea cada item con `mapSermon()`.
- `mapSermon(s)` — convierte un item del backend al shape de la grilla:
  - `d`: fecha formateada "23 may 2026" (usando `MESES_CORTOS`, mismo estilo que `getSunsetTimes`).
  - `t`: `s.title`
  - `p`: `s.preacher`
  - `url`: `s.url`
  - `thumb`: `s.thumbnailUrl` (miniatura real de YouTube)
  - `reference`: `s.reference` (cita bíblica, para el kicker de la destacada)
  - Campos crudos: `title`, `preacher`, `date`.

### Parches aplicados a `PageEnVivo` en `pages-3.jsx`

Si llega una actualización del diseño de Claude Artifacts, re-aplicar estos cambios:

1. **Firma del componente**: `function PageEnVivo({ isLive: isLiveProp })` (renombrar prop para no colisionar con el estado de la API).

2. **Estado y efecto** (agregar al inicio de la función, usando los hooks aliasados `useS3`/`useE3`):
   ```javascript
   const [live, setLive]       = useS3(null);
   const [sermons, setSermons] = useS3(null);
   useE3(function () {
     if (!window.IASD_API) return;
     window.IASD_API.fetchLiveStatus()
       .then(setLive)
       .catch(function () { setLive({ isLive: false, embedUrl: null }); });
     window.IASD_API.fetchRecentSermons()
       .then(setSermons)
       .catch(function () { setSermons([])); });
   }, []);
   const isLive   = live ? live.isLive : isLiveProp;
   const embedUrl = live && live.embedUrl ? live.embedUrl : null;
   const hasEmbed = !!embedUrl;
   ```

3. **Reproductor**: reemplazar `HAS_EMBED`/`YOUTUBE_EMBED_URL` por `hasEmbed`/`embedUrl` (de la API).
   - Si `hasEmbed` → `<iframe src={embedUrl} ...>`.
   - Si no → fallback con `<Ph>` + botón play que abre `YOUTUBE_LIVE_URL`.

4. **Badge "EN VIVO AHORA"**: controlado por `isLive` (de la API, no el prop hardcodeado).

5. **Predicación destacada** (meta de culto): usar `sermons[0]` cuando exista.
   - `featuredKicker = 'PREDICACIÓN' + (featured.reference ? ' · ' + featured.reference.toUpperCase() : '')`
   - `featuredTitle = featured.t`
   - `featuredSubtitle = featured.p + ' · ' + featured.d`
   - Fallback hardcodeado en `FALLBACK_FEATURED` si la API no responde.

6. **Grilla de predicaciones anteriores**: `sermons.slice(1)` en vez del array `past` hardcodeado.
   - Cada card usa `<img src={s.thumb}>` si existe, sino `<Ph dark label="Predicación" ...>`.
   - La sección entera se oculta si `sermons === null` (cargando) o `past.length === 0` (vacío/error).

7. **Constantes conservadas**: `YOUTUBE_CHANNEL_URL` y `YOUTUBE_LIVE_URL` (se usan en botones).
   - `YOUTUBE_EMBED_URL` y `HAS_EMBED` eliminados (el embed ahora viene de la API).

### Degradación elegante (design decisión 9)

| Escenario | Comportamiento |
|-----------|---------------|
| `channelId` no configurado | `embedUrl = null`; muestra fallback con `<Ph>` + botón play. |
| `fetchLiveStatus` falla | `live = { isLive: false, embedUrl: null }`; badge oculto, fallback de reproductor. |
| `fetchRecentSermons` falla | `sermons = []`; grilla oculta, destacada usa fallback hardcodeado. |
| `sermons === null` (cargando) | Grilla oculta (`showGrid = false`), destacada usa fallback. |
| `isLiveManual = false` | Badge "EN VIVO AHORA" no se muestra. |

## Pendiente (próximas etapas)

- La pantalla demo `#acceso` (`PageAcceso` en `auth.jsx`) quedó sin enlaces; se
  puede eliminar cuando se confirme que no se usa.
