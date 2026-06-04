## Why

La sección "En Vivo" del sitio público (`PageEnVivo` en `website/pages-3.jsx`) usa
datos hardcodeados: un flag `isLive` falso por defecto, tres predicaciones de ejemplo
en un array hardcodeado, y un `YOUTUBE_EMBED_URL` con un channel ID placeholder
(`UC_PLACEHOLDER_CHANNEL_ID`). No consume contenido real del canal de YouTube de la
iglesia.

La iglesia transmite por YouTube (`https://www.youtube.com/@IASDCentralOsorno`) y
necesita que el sitio público refleje automáticamente:
1. Si hay una transmisión **en vivo ahora** (con datos del stream/embed).
2. Los **últimos videos publicados** en el canal (predicaciones anteriores).

Además, el administrador necesita configurar los parámetros de integración con
YouTube desde el panel de Configuraciones: el canal a consultar, opciones de embed,
y un toggle manual de respaldo por si la API de YouTube falla o excede cuota.

## What Changes

- **Backend** — módulo `site-config`, ampliación para la sección Transmisiones:
  - Proveedor/servicio `YouTubeService` que encapsula llamadas a la YouTube Data
    API v3 (search, videos) usando una API key configurable por variable de entorno.
  - Caché con `@nestjs/cache-manager` para no exceder la cuota de la API (reutiliza
    el `CacheModule` ya global registrado en `app.module`).
  - Endpoints públicos en `PublicSiteController`:
    - `GET /api/public/live` → estado en vivo (`isLive`, título del stream, embed
      URL, espectadores concurrentes si disponibles).
    - `GET /api/public/videos` → últimos videos publicados del canal (título,
      fecha, miniatura, URL).
  - SiteSettings `transmisiones.*` para configurar el channelId/handle del canal,
    flag de embed habilitado y toggle manual de respaldo "en vivo".
  - Manejo de errores/cuota: si la API de YouTube falla, el endpoint `live` degrada
    devolviendo `isLive: false` (o respetando el toggle manual); el endpoint `videos`
    devuelve array vacío.

- **Frontend (admin)** — pestaña "Transmisiones" en Configuraciones:
  - Tab "Transmisiones" registrada en `ConfiguracionesLayout` con formulario para
    configurar channelId/handle, opciones de embed, y el toggle manual de respaldo
    "marcar en vivo".
  - La API key de YouTube **NO** se configura aquí (va por variable de entorno del
    backend), pero el formulario muestra su estado (configurada / no configurada)
    para feedback.

- **Sitio público (`website/`)**:
  - `integration.js`: se agregan `fetchLiveStatus()` y `fetchRecentVideos()` al
    objeto `window.IASD_API`.
  - `pages-3.jsx`: parche mínimo documentado en `INTEGRATION.md` para que
    `PageEnVivo` consuma `/api/public/live` y `/api/public/videos` en vez de datos
    hardcodeados. El embed de YouTube usa el channel ID devuelto por la API (o el
    del SiteSetting como fallback).

## Capabilities

### New Capabilities
- `site-section-transmisiones`: Sección "En Vivo / Transmisiones" del sitio público
  con detección automática de transmisión en vivo vía YouTube Data API v3 y listado
  de últimos videos del canal, todo administrable desde Configuraciones.

### Modified Capabilities
- `public-site-content` (de `site-config-foundation`): se amplía el puente
  `integration.js` con `fetchLiveStatus` y `fetchRecentVideos`; se amplía
  `PublicSiteController` con los endpoints `/public/live` y `/public/videos`.
- `site-config-admin` (de `site-config-foundation`): se agrega la tab
  "Transmisiones" al layout de Configuraciones.

## Impact

- **Backend Module**: módulo `site-config` (existente, se amplía).
- **New Services**: `YouTubeService` (proveedor con interfaz, encapsula YouTube Data
  API v3 + caché).
- **New SiteSettings**: `transmisiones.channelId`, `transmisiones.channelHandle`,
  `transmisiones.embedEnabled`, `transmisiones.manualLiveOverride`.
- **New Endpoints**:
  - `GET /api/public/live` — estado en vivo del canal.
  - `GET /api/public/videos` — últimos videos del canal.
- **Frontend**: tab/pestaña "Transmisiones" en Configuraciones con formulario.
- **Sitio**: parche a `website/pages-3.jsx` (PageEnVivo) y `website/integration.js`;
  actualización de `website/INTEGRATION.md`.
- **Variable de entorno**: `YOUTUBE_API_KEY` en `.env.example` del backend (secreto,
  NO en SiteSetting).
- **Depende de**: `site-config-foundation`.

## Fuera del alcance

- Reproducción de videos dentro del admin (el admin solo configura, no reproduce).
- Gestión de listas de reproducción (playlists) de YouTube.
- Estadísticas avanzadas de YouTube Analytics (vistas, suscriptores, retención).
- Chat en vivo de YouTube incrustado.
- Soporte para múltiples canales de YouTube (un solo canal por vez).
- Notificaciones o webhooks de YouTube (la detección es por polling con caché).
- Cambiar el diseño visual del reproductor (conserva el diseño actual de
  `pages-3.jsx`, solo se reemplazan los datos hardcodeados).
