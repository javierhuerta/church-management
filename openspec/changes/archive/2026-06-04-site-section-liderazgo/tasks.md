## 1. Coordinación con site-config-foundation

- [x] 1.1 Si `site-config-foundation` aún no movió lo genérico, coordinar para que
  `SiteSetting`, `upload.config.ts` y `PublicSiteController` base queden en
  ese change; lo específico de líderes (`PrincipalLeader`, `SiteConfigService`,
  `SiteConfigController`) se queda en `site-section-liderazgo`.
- [x] 1.2 Verificar que `SiteConfigModule` esté registrado en `app.module.ts`
  (ENTITIES, imports) y que `data-source.ts` incluya las entidades.

## 2. Backend — Entidades y migración (YA EXISTE)

- [x] 2.1 Entidad `PrincipalLeader` (`principal_leaders`): rol, nombre, photo_path,
  display_order, is_active. `backend/src/modules/site-config/entities/principal-leader.entity.ts`
- [x] 2.2 Entidad `SiteSetting` (`site_settings`): key PK, value, updated_at.
  `backend/src/modules/site-config/entities/site-setting.entity.ts`
- [x] 2.3 Migración `1780100000000-CreateSiteConfig` con tablas `principal_leaders`
  y `site_settings`. `backend/src/migrations/1780100000000-CreateSiteConfig.ts`

## 3. Backend — DTOs (YA EXISTEN)

- [x] 3.1 `CreatePrincipalLeaderDto`: role, name, displayOrder?, isActive?
  `backend/src/modules/site-config/dto/create-principal-leader.dto.ts`
- [x] 3.2 `UpdatePrincipalLeaderDto`: todos opcionales.
  `backend/src/modules/site-config/dto/update-principal-leader.dto.ts`
- [x] 3.3 `PrincipalLeaderResponseDto`: id, role, name, photoUrl, displayOrder, isActive.
  `backend/src/modules/site-config/dto/principal-leader-response.dto.ts`
- [x] 3.4 `PublicLeadershipDto`: boardPhotoUrl, board[], ministries[].
  `backend/src/modules/site-config/dto/public-leadership.dto.ts`
- [x] 3.5 `UploadImageDto`: file binario formal para evitar bug de codegen.
  `backend/src/modules/site-config/dto/upload-image.dto.ts`

## 4. Backend — Upload de imágenes (YA EXISTE)

- [x] 4.1 Configuración multer para `uploads/site/` con nombre aleatorio y filtro
  `image/*`. `backend/src/modules/site-config/config/upload.config.ts`

## 5. Backend — Servicio (YA EXISTE)

- [x] 5.1 `SiteConfigService`: helpers `getSetting`/`setSetting`.
- [x] 5.2 CRUD de `PrincipalLeader`: `listLeaders`, `createLeader`, `updateLeader`,
  `removeLeader`, `setLeaderPhoto`.
- [x] 5.3 Gestión de foto grupal: `getBoardPhotoUrl`, `setBoardPhoto` via
  `SiteSetting` clave `leadership.board_photo`.
- [x] 5.4 Derivación de ministerios: `listMinistries` (query SQL cruda con
  `string_agg` sobre `user_departments`).
- [x] 5.5 Carga pública agregada: `getPublicLeadership` que devuelve
  `PublicLeadershipDto` con boardPhotoUrl, board activo y ministries.

## 6. Backend — Controladores (YA EXISTEN)

- [x] 6.1 `SiteConfigController` (`/api/site-config`): endpoints admin protegidos
  `JwtAuthGuard + RolesGuard + Roles(Admin)` para CRUD de líderes y foto grupal.
  `backend/src/modules/site-config/site-config.controller.ts`
- [x] 6.2 `PublicSiteController` (`/api/public`): endpoint `GET /api/public/leadership`
  sin guard, devuelve `PublicLeadershipDto`.
  `backend/src/modules/site-config/public-site.controller.ts`

## 7. Frontend — Regenerar cliente API e infraestructura

- [x] 7.1 Cargar skills `church-ui-design` y `shadcn` antes de implementar componentes.
- [x] 7.2 Regenerar cliente API desde OpenAPI (`npm run generate:api`); restaurar
  `request.ts` con git si queda vacío.

## 8. Frontend — Tab «Liderazgo» en Configuraciones

- [x] 8.1 Registrar la tab `{ id: 'liderazgo', label: 'Liderazgo', path: 'liderazgo' }`
  en el arreglo de tabs de `ConfiguracionesLayout`.
- [x] 8.2 Crear ruta `/admin/configuraciones/liderazgo` que renderice el componente
  `LiderazgoConfigPage`.
- [x] 8.3 Crear `LiderazgoConfigPage` con tres secciones: «Junta directiva»,
  «Foto grupal» y «Ministerios», siguiendo el layout de secciones del design.
- [x] 8.4 Sección «Junta directiva»: tabla/listado de líderes con columnas
  foto (thumbnail), rol, nombre, orden, activo (Switch), acciones.
  Botón «+ Agregar». En mobile: tarjetas.
- [x] 8.5 Formulario de crear/editar líder en drawer (desktop) / bottom sheet
  (mobile): campos rol*, nombre*, orden, activo. Subida de foto retrato con
  crop/zoom usando `react-easy-crop` (aspect 1:1, output 800x800 JPEG).
- [x] 8.6 Acción de eliminar líder con confirmación.
- [x] 8.7 Sección «Foto grupal»: widget de upload con preview de la imagen actual
  y botón «Cambiar foto». Usar endpoint `POST /api/site-config/leadership/board-photo`.
- [x] 8.8 Sección «Ministerios»: tabla de solo lectura con columnas
  color (círculo), ministerio, responsables. Badge informativo «Gestionado en
  Departamentos» con link.

## 9. Sitio público — integration.js + PageNosotros

- [x] 9.1 Agregar función `fetchLeadership()` en `website/integration.js` que
  consuma `GET /api/public/leadership` y mapee los datos al formato esperado
  por `PageNosotros`:
  - `board[]` → `{ role, name, photoUrl, slot }`
  - `ministries[]` → `{ role: name, name: leaders || 'Sin responsable' }`
  - exponer en `window.IASD_API.fetchLeadership`
- [x] 9.2 Modificar `PageNosotros` en `website/pages-1.jsx`:
  - Agregar `useState` + `useEffect` que llame a
    `window.IASD_API.fetchLeadership()`.
  - Reemplazar array `board` hardcodeado por estado dinámico; usar `photoUrl`
    en los retratos en vez de `PhotoSlot` estático.
  - Reemplazar array `ministries` hardcodeado por estado dinámico.
  - Reemplazar `PhotoSlot id="liderazgo-grupal"` por `<img>` con `src={boardPhotoUrl}`.
  - Fallback: si la API falla o no hay datos, usar los arrays hardcodeados
    actuales como valores por defecto.
- [x] 9.3 Documentar en `website/INTEGRATION.md` los parches aplicados a
  `PageNosotros` para poder re-aplicarlos ante una actualización del diseño.

## 10. Verificación

- [ ] 10.1 Probar CRUD de líderes vía `/api/site-config/leaders` (Admin token). _(pendiente: reiniciar backend)_
- [ ] 10.2 Probar subida de foto retrato y foto grupal. _(pendiente: reiniciar backend)_
- [ ] 10.3 Verificar que `GET /api/public/leadership` responde sin token y
  solo incluye líderes activos. _(pendiente: reiniciar backend)_
- [ ] 10.4 Verificar que ministerios incluye departamentos con y sin directores. _(pendiente: reiniciar backend)_
- [ ] 10.5 Probar la UI de Configuraciones → Liderazgo: crear, editar, eliminar,
  subir fotos. _(pendiente: regenerar API client)_
- [ ] 10.6 Verificar que `PageNosotros` muestra datos vivos (no hardcodeados)
  cuando el endpoint responde. _(pendiente: reiniciar backend)_
- [ ] 10.7 Verificar fallback: si el endpoint falla, la página muestra los
  datos hardcodeados por defecto sin romperse. _(listo para probar)_
