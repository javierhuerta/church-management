## 1. Backend — Entidad SermonVideo, migración, DTOs, servicio y módulo

- [x] 1.1 Cargar skills `nestjs-best-practices` y `typescript-advanced-types` antes de implementar
- [x] 1.2 Crear módulo `backend/src/modules/transmisiones/` siguiendo el patrón de `modules/gallery/`
- [x] 1.3 Crear entidad `SermonVideo` (`entities/sermon-video.entity.ts`) extendiendo `BaseEntity`: `videoId`, `title`, `preacher`, `reference` (nullable), `date`, `thumbnailUrl`, `isPublished` (default false), `order` (default 0)
- [x] 1.4 Generar migración para la tabla `sermon_videos` (`npm run migration:generate`)
- [x] 1.5 Crear DTOs con OpenAPI completo (create/update/response + config) respetando las reglas de `@ApiProperty`/`@ApiPropertyOptional` del AGENTS.md (campos `string | null` con `type: String, nullable: true`; requeridos con `type: String`)
- [x] 1.6 Crear `TransmisionesService` con CRUD de predicaciones: crear, editar, eliminar, listar, reordenar, toggle publicar
- [x] 1.7 Derivar `thumbnailUrl` en el servicio a partir de `videoId` (`https://i.ytimg.com/vi/{videoId}/hqdefault.jpg`)
- [x] 1.8 Añadir helper `resolveOembed(videoIdOrUrl)` al servicio: normaliza a `videoId`, consulta `youtube.com/oembed` con `HttpService`, devuelve `{ videoId, title, authorName, thumbnailUrl }`; degradar a `title` vacío si oEmbed falla
- [x] 1.9 Añadir config del canal vía `SiteSetting` (helpers `getSetting`/`setSetting` como en `gallery.service.ts`): `transmisiones.channelId`, `transmisiones.channelHandle`, `transmisiones.isLiveManual`
- [x] 1.10 Crear `TransmisionesModule` (`TypeOrmModule.forFeature([SermonVideo, SiteSetting])`, `AuthModule`, `HttpModule`) y registrarlo en `app.module.ts`

## 2. Backend — Controladores (admin protegido + público) y config

- [x] 2.1 Crear `TransmisionesAdminController` protegido con `JwtAuthGuard + RolesGuard + @Roles(UserRole.Admin)`: CRUD de predicaciones (crear/editar/eliminar/listar/reordenar/publicar)
- [x] 2.2 Añadir endpoints de config del canal al admin controller: leer y guardar `channelId`, `channelHandle`, `isLiveManual`
- [x] 2.3 Añadir endpoint auxiliar de oEmbed al admin controller (recibe URL/videoId → devuelve título/autor sugeridos)
- [x] 2.4 Crear `PublicTransmisionesController` (`@Controller('public')`, sin guard) con `GET /live` → `{ isLive, channelId, channelHandle, embedUrl }` (isLive desde `isLiveManual`)
- [x] 2.5 Añadir `GET /public/sermons` al controlador público → predicaciones publicadas, destacada primero (`date DESC`, `order` desempate), limitado a ~9–10, cada item con `url` derivada
- [x] 2.6 Documentar OpenAPI en todos los endpoints (`@ApiTags`, `@ApiOperation`, `@ApiResponse` con DTOs tipados) para que el codegen del frontend funcione

## 3. Backend — Seeder de predicaciones de ejemplo

- [x] 3.1 Crear `backend/src/seeds/transmisiones/sermon-video.seeder.ts` con las 3–4 predicaciones hoy hardcodeadas en el array `past` de `website/pages-3.jsx` (incluida la destacada "No se preocupen por la vida")
- [x] 3.2 Marcar todas las predicaciones del seeder con `isPublished = true` y `order` secuencial; derivar `thumbnailUrl` de cada `videoId`
- [x] 3.3 Sembrar también los SiteSettings por defecto del canal (`transmisiones.channelHandle = IASDCentralOsorno`, `isLiveManual = false`)
- [x] 3.4 Registrar el seeder en `backend/src/seeds/seeder.ts` y `scripts/seeders/run-all.ts` (cada entidad con su repo propio, sin cascade implícito, según AGENTS.md)

## 4. Frontend admin — Config del canal y CRUD de predicaciones

- [x] 4.1 Cargar skills `church-ui-design`, `shadcn` y `react-hook-form` antes de implementar
- [x] 4.2 Regenerar cliente API desde OpenAPI (`npm run generate:api`); restaurar `src/lib/api/core/request.ts` con git si queda vacío
- [x] 4.3 Reemplazar el placeholder en `frontend/src/features/site-config/pages/transmisiones-config-page.tsx` por el bloque de config del canal: inputs `channelId`/`channelHandle` + switch `isLiveManual` con badge de advertencia cuando está activo (`data-testid` según UI Scenarios)
- [x] 4.4 Implementar el bloque CRUD de predicaciones (patrón de `frontend/src/features/gallery/pages/`): lista de cards con thumbnail/título/predicador/fecha/estado
- [x] 4.5 Implementar "Agregar predicación": input de URL de YouTube → al pegar, llamar al endpoint de oEmbed → auto-rellenar título; form con predicador/cita/fecha
- [x] 4.6 Implementar acciones por card: editar, publicar/ocultar, reordenar, eliminar con dialog de confirmación
- [x] 4.7 Aplicar el patrón mobile/desktop obligatorio de la skill (form centrado `max-w-2xl` + grilla de cards; columna única en mobile)

## 5. Sitio público — integration.js, parche PageEnVivo, INTEGRATION.md

- [x] 5.1 Agregar `fetchLiveStatus()` a `window.IASD_API` en `website/integration.js` → llama a `/api/public/live` (patrón de `fetchGallery`/`fetchWorship`)
- [x] 5.2 Agregar `fetchRecentSermons()` a `window.IASD_API` → llama a `/api/public/sermons`, con función de mapeo al shape esperado por la grilla (`{ d, t, p, url, thumb }`)
- [x] 5.3 Parchar `website/pages-3.jsx` (`PageEnVivo`): reemplazar el array `past` hardcodeado por `fetchRecentSermons()`; usar `sermons[0]` como predicación destacada y `sermons.slice(1)` en la grilla
- [x] 5.4 Parchar el reproductor: usar `embedUrl` de `/api/public/live` (embed nativo `live_stream?channel=...`); reemplazar `YOUTUBE_EMBED_URL`/`UC_PLACEHOLDER_CHANNEL_ID`
- [x] 5.5 Parchar el badge "EN VIVO AHORA": controlarlo con `live.isLive` (de `isLiveManual`) en vez del prop hardcodeado
- [x] 5.6 Degradar elegantemente: si la API falla, mostrar estado por defecto ("Próxima transmisión · Sábado 11:00") y ocultar la grilla, manteniendo el diseño visual intacto
- [x] 5.7 Crear/actualizar `website/INTEGRATION.md` con la sección "## Sección Transmisiones" documentando los parches para re-aplicación

## 6. Verificación

- [x] 6.1 Test unitario del servicio público: `GET /public/live` devuelve `isLive` según `isLiveManual` y arma `embedUrl` con el `channelId`
- [x] 6.2 Test unitario del servicio público: `GET /public/sermons` devuelve solo publicadas, ordenadas (destacada primero), con `url` y `thumbnailUrl` derivadas
- [x] 6.3 Test del helper `resolveOembed`: parsea videoId de URL y de ID, y degrada a título vacío ante fallo de oEmbed (mock de `HttpService`)
- [x] 6.4 Probar `GET /api/public/live` y `GET /api/public/sermons` sin token (anónimos) — responden JSON válido
- [x] 6.5 Verificar tab "Transmisiones" en `/admin/configuraciones/transmisiones`: solo Admin accede; guardar config persiste los SiteSettings; CRUD de predicaciones funciona _(validado manualmente — sin Playwright disponible en el entorno)_
- [x] 6.6 Verificar sitio público: `PageEnVivo` muestra badge según `isLiveManual`, embed del canal, destacada + grilla con datos reales, y degrada sin errores si la API falla _(validado manualmente — sin Playwright disponible en el entorno)_
