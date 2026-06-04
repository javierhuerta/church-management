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

## Pendiente (próximas etapas)

- Programa del día (`store.program`) sigue en modo demo (localStorage). Conectar
  a `/api/worship-services`.
- Liderazgo (`PageNosotros`) y ministerios: mapear a `GET /api/public/leadership`.
- La pantalla demo `#acceso` (`PageAcceso` en `auth.jsx`) quedó sin enlaces; se
  puede eliminar cuando se confirme que no se usa.
