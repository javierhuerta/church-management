# Integración del sitio público con el backend

Este directorio es el **export de Claude Artifacts** del sitio público (React 18
UMD + Babel en navegador). Se sirve tal cual para poder reemplazarlo cuando llegue
una actualización del diseño.

Para conectar el sitio con la aplicación (admin en `/admin`, API en `/api`) se
hicieron **cambios mínimos y localizados**. Si llega una versión nueva del diseño,
re-aplicar solo estos parches:

## Archivos nuevos (no parte del export, se conservan siempre)

- `integration.js` — puente con la API del backend. Expone `window.IASD_API`:
  - `fetchEvents()` → eventos publicados (`GET /api/calendar`) mapeados al shape
    del diseño `{ id, date, start, title, loc, featured }`.
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

## Pendiente (próximas etapas)

- Programa del día (`store.program`) y Documentos (`store.docs`) siguen en modo
  demo (localStorage). Conectar a `/api/worship-services` y `/api/document-center`.
- Liderazgo (`PageNosotros`) y ministerios: mapear a `GET /api/departments`.
- La pantalla demo `#acceso` (`PageAcceso` en `auth.jsx`) quedó sin enlaces; se
  puede eliminar cuando se confirme que no se usa.
