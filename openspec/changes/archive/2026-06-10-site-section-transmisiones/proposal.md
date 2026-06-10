## Why

La sección "En Vivo" del sitio público (`PageEnVivo` en `website/pages-3.jsx`) usa
datos hardcodeados: un flag `isLive` falso por defecto, tres predicaciones de
ejemplo en un array `past`, un `YOUTUBE_EMBED_URL` con un channel ID placeholder
(`UC_PLACEHOLDER_CHANNEL_ID`) y una meta de culto fija ("No se preocupen por la
vida"). No refleja contenido real ni administrable.

La iglesia transmite por YouTube (`https://www.youtube.com/@IASDCentralOsorno`) y
necesita que el sitio público:
1. Muestre un badge **"EN VIVO AHORA"** cuando hay culto en transmisión.
2. Reproduzca automáticamente la transmisión activa del canal.
3. Liste **predicaciones anteriores curadas a mano** desde el admin, con una
   predicación destacada arriba y una grilla con el resto.

**Decisión cerrada con el usuario:** la integración se hace **sin YouTube Data
API, sin API Key, sin cuota**. Se usa el embed nativo de YouTube y curación
manual de predicaciones desde el admin (mismo patrón que la Galería). Esto elimina
toda dependencia de cuota externa (`search.list eventType=live` cuesta 100
unidades/llamada → excede los 10.000/día gratuitos) y da control total a la iglesia.

## What Changes

- **Backend — nuevo módulo `transmisiones`** (sigue exactamente el patrón de
  `backend/src/modules/gallery/`):
  - Nueva entidad `SermonVideo` (predicaciones curadas): `videoId`, `title`,
    `preacher`, `reference` (cita bíblica, nullable), `date`, `thumbnailUrl`
    (derivada de `i.ytimg.com`), `isPublished`, `order`.
  - Migración para la tabla `sermon_videos`.
  - DTOs con OpenAPI completos (reglas de `@ApiProperty`/`@ApiPropertyOptional`
    del AGENTS.md para que el codegen genere `string` y no `Record<string, any>`).
  - `TransmisionesService`: CRUD de predicaciones (crear/editar/eliminar/
    reordenar/publicar) + helper `resolveOembed(videoIdOrUrl)` que consulta
    `youtube.com/oembed` (HTTP GET público, gratis, sin key) para auto-sugerir el
    título y el autor; + config del canal (channelId, channelHandle, isLiveManual)
    vía `SiteSetting` (reusa el patrón `getSetting`/`setSetting`).
  - `TransmisionesAdminController` protegido con `JwtAuthGuard + RolesGuard +
    @Roles(UserRole.Admin)`: CRUD + config + endpoint auxiliar de oEmbed.
  - `PublicTransmisionesController` (sin guard, anónimo):
    - `GET /api/public/live` → `{ isLive, channelId, embedUrl, channelHandle }`.
    - `GET /api/public/sermons` → predicaciones publicadas (destacada primero),
      ~9–10 items.
  - Seeder con las 3–4 predicaciones de ejemplo hoy hardcodeadas en `pages-3.jsx`,
    marcadas `isPublished = true`.

- **Frontend (admin)** — reemplazo del placeholder de la pestaña "Transmisiones":
  - `transmisiones-config-page.tsx` (hoy placeholder) pasa a tener: form de config
    del canal (channelId, channelHandle) + switch "Estamos transmitiendo en vivo"
    (`isLiveManual`) con badge de advertencia cuando está activo.
  - CRUD de predicaciones (patrón galería): lista de cards, agregar pegando URL de
    YouTube → auto-rellena título vía oEmbed → editar predicador/cita/fecha →
    publicar/ocultar/reordenar → eliminar con confirmación.
  - La tab, la ruta en `App.tsx` y la card en el índice de Configuraciones **ya
    existen** — no se recablean.

- **Sitio público (`website/`)**:
  - `integration.js`: se agregan `fetchLiveStatus()` y `fetchRecentSermons()` a
    `window.IASD_API` (patrón idéntico a `fetchGallery`/`fetchWorship`).
  - `pages-3.jsx` (`PageEnVivo`): parche documentado en `INTEGRATION.md` para
    consumir `/api/public/live` y `/api/public/sermons` en vez de datos
    hardcodeados. El diseño visual se conserva intacto (fondo `#0E1730`, etc.).

## Capabilities

### New Capabilities
- `site-section-transmisiones`: Sección "En Vivo / Transmisiones" del sitio
  público con badge de transmisión en vivo controlado manualmente, embed nativo
  del canal de YouTube, y listado de predicaciones anteriores curadas desde el
  admin (con predicación destacada). Todo administrable desde Configuraciones, sin
  YouTube Data API.

### Modified Capabilities
- `public-site-content` (de `site-config-foundation`): se amplía el puente
  `integration.js` con `fetchLiveStatus` y `fetchRecentSermons`; se agregan los
  endpoints públicos `/public/live` y `/public/sermons`.
- `site-config-admin` (de `site-config-foundation`): la tab "Transmisiones" (ya
  registrada) pasa de placeholder a funcional.

## Impact

- **Backend Module**: nuevo módulo `transmisiones` (`backend/src/modules/transmisiones/`).
- **New Entity**: `SermonVideo` → tabla `sermon_videos` (+ migración).
- **New Service**: `TransmisionesService` (CRUD + oEmbed helper + config SiteSettings).
- **New SiteSettings**: `transmisiones.channelId`, `transmisiones.channelHandle`,
  `transmisiones.isLiveManual`.
- **New Endpoints**:
  - Admin (Admin): CRUD de predicaciones, config del canal, helper de oEmbed.
  - Público (anónimo): `GET /api/public/live`, `GET /api/public/sermons`.
- **New Seeder**: `backend/src/seeds/transmisiones/sermon-video.seeder.ts` (3–4
  predicaciones de ejemplo) + registro en `run-all.ts` / `seeder.ts`.
- **Frontend**: `transmisiones-config-page.tsx` reemplaza el placeholder; cliente
  API regenerado.
- **Sitio**: parche a `website/pages-3.jsx` (`PageEnVivo`), `website/integration.js`
  y nuevo `website/INTEGRATION.md` (sección Transmisiones).
- **Depende de**: `site-config-foundation`.
- **Sin variables de entorno nuevas. Sin API Key. Sin cuota. Sin CacheModule para
  transmisiones.**

## Fuera del alcance

- Detección automática de "en vivo" (se usa el toggle manual `isLiveManual`; no hay
  polling ni YouTube Data API).
- YouTube Data API v3, API Key, manejo de cuota, o caché de cuota.
- Importación automática de videos del canal (las predicaciones se curan a mano).
- Reproducción de videos dentro del admin (el admin solo gestiona metadatos).
- Listas de reproducción (playlists), chat en vivo incrustado, YouTube Analytics.
- Soporte para múltiples canales de YouTube (un solo canal por vez).
- Recablear la tab, la ruta o la card de Configuraciones (ya existen).
- Cambiar el diseño visual de `PageEnVivo` (solo se reemplazan los datos).
