## 1. Backend — YouTubeService y endpoints públicos

- [ ] 1.1 Cargar skill `nestjs-best-practices` antes de implementar
- [ ] 1.2 Agregar `YOUTUBE_API_KEY` a `.env.example` y documentar que es un secreto (no va en SiteSetting)
- [ ] 1.3 Crear interfaces/types para respuestas de YouTube Data API v3 (`YouTubeSearchResponse`, `YouTubeVideoResponse`, `YouTubeLiveStatus`)
- [ ] 1.4 Crear `YouTubeService` con `checkLiveStatus()` y `getRecentVideos()` usando `HttpService` (axios) de NestJS
- [ ] 1.5 Configurar caché en `YouTubeService` usando `@Inject(CACHE_MANAGER)` con TTLs diferenciados (live: 60s, videos: 600s)
- [ ] 1.6 Agregar endpoints `GET /public/live` y `GET /public/videos` en `PublicSiteController` (sin guard, anónimo)
- [ ] 1.7 Degradar elegantemente errores de YouTube: `live` devuelve `isLive: false` (o toggle manual si está activo); `videos` devuelve array vacío con log de warning
- [ ] 1.8 Agregar `YouTubeService` como provider en `SiteConfigModule` (o módulo existente que lo contenga)
- [ ] 1.9 Crear/registrar SiteSettings defaults: `transmisiones.channelId`, `transmisiones.channelHandle`, `transmisiones.embedEnabled`, `transmisiones.manualLiveOverride`

## 2. Backend — SiteSettings para Transmisiones

- [ ] 2.1 Documentar las claves `transmisiones.*` en el código (comentarios o constantes) para referencia de otros developers
- [ ] 2.2 Asegurar que `SiteConfigService.getSetting('transmisiones.channelId')` etc. están disponibles para `YouTubeService`
- [ ] 2.3 Crear endpoint admin `PUT /api/site-config/transmisiones` (o reutilizar el endpoint genérico de settings) para guardar channelId, handle, embedEnabled y manualLiveOverride

## 3. Frontend admin — Tab "Transmisiones" en Configuraciones

- [ ] 3.1 Cargar skills `church-ui-design` y `shadcn` antes de implementar componentes
- [ ] 3.2 Regenerar cliente API desde OpenAPI (`npm run generate:api`); restaurar `request.ts` con git si queda vacío
- [ ] 3.3 Registrar la tab `{ id: 'transmisiones', label: 'Transmisiones', path: '/admin/configuraciones/transmisiones' }` en el arreglo de tabs de `ConfiguracionesLayout`
- [ ] 3.4 Crear componente `TransmisionesConfigTab` con formulario para channelId, channelHandle, embedEnabled (switch), manualLiveOverride (switch)
- [ ] 3.5 Mostrar indicador de estado de la API key: "Configurada" (verde) o "No configurada" (rojo) consultando un endpoint de status o deduciéndolo del comportamiento
- [ ] 3.6 Validar que channelId tenga formato UC seguido de 22 caracteres alfanuméricos (validación client-side con Zod)
- [ ] 3.7 Crear sub-ruta `/admin/configuraciones/transmisiones` en el router que renderice `TransmisionesConfigTab`

## 4. Sitio público — Integración de PageEnVivo

- [ ] 4.1 Agregar `fetchLiveStatus()` a `window.IASD_API` en `website/integration.js` → llama a `/api/public/live`
- [ ] 4.2 Agregar `fetchRecentVideos()` a `window.IASD_API` en `website/integration.js` → llama a `/api/public/videos`
- [ ] 4.3 Crear helpers de mapeo para convertir respuestas de la API al formato esperado por `PageEnVivo` (estructura `{ d, t, p, url }` para videos)
- [ ] 4.4 Parchar `website/pages-3.jsx` — `PageEnVivo`:
  - Reemplazar `isLive` prop hardcodeado por consumo de `window.IASD_API.fetchLiveStatus()`
  - Reemplazar array `past` hardcodeado por `window.IASD_API.fetchRecentVideos()`
  - Reemplazar `YOUTUBE_EMBED_URL` con el channel ID dinámico devuelto por la API
  - Mantener el diseño visual existente (colores, layout, tipografía)
  - Degradar: si la API falla, mostrar estado por defecto ("Próxima transmisión · Sábado 11:00") y mensaje informativo
- [ ] 4.5 Documentar los parches en `website/INTEGRATION.md` siguiendo el patrón existente (sección nueva "## Sección Transmisiones")

## 5. Verificación

- [ ] 5.1 Probar `GET /api/public/live` sin token — debe responder con JSON (aun sin API key configurada, debe degradar)
- [ ] 5.2 Probar `GET /api/public/videos` sin token — debe responder array (vacío si no hay API key o el canal no tiene videos)
- [ ] 5.3 Configurar API key válida, channelId real y verificar que `live` responde con datos reales del canal
- [ ] 5.4 Verificar caché: múltiples requests en < 60s no incrementan cuota de YouTube (monitorear en Google Cloud Console)
- [ ] 5.5 Verificar toggle manual: activar `transmisiones.manualLiveOverride` → `live` devuelve `isLive: true` incluso si YouTube no está transmitiendo
- [ ] 5.6 Verificar tab "Transmisiones" en `/admin/configuraciones/transmisiones` — formulario funcional, solo Admin puede acceder
- [ ] 5.7 Verificar sitio público: `PageEnVivo` muestra datos reales del canal (estado live + videos) y degrada sin errores si la API falla
- [ ] 5.8 Verificar que el embed de YouTube carga correctamente en el iframe con el channel ID configurado
