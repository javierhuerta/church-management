## Why

La sección Liderazgo (PageNosotros, «Quienes sirven») del sitio público está
hardcodeada en `website/pages-1.jsx`: nombres de la junta directiva, líderes de
ministerios y la foto grupal son texto fijo en el JSX. Cada cambio requiere editar
el sitio a mano. El sistema de gestión ya tiene departamentos y sus directores
vivos en la base de datos, y existe un borrador de backend para gestionar los
líderes principales y exponerlos al sitio. Este change **formaliza** esa capacidad
bajo el menú de Configuraciones, con la tab «Liderazgo».

Depende de `site-config-foundation` (shell de Configuraciones por tabs,
`SiteSetting` clave/valor, endpoint público `/api/public/*`, `integration.js`).

## What Changes

- **Backend** — formaliza el borrador parcial de `site-config/` para Liderazgo:
  - Entidad `PrincipalLeader`: líderes de la junta directiva con rol, nombre,
    orden, estado activo y foto retrato (ya existe).
  - `SiteSetting` clave `leadership.board_photo` para la foto grupal (ya existe).
  - `SiteConfigService`: CRUD de líderes, subida de foto retrato, subida de foto
    grupal, derivación de ministerios desde departamentos + directores via
    `user_departments` (ya existe).
  - `SiteConfigController`: endpoints admin con `JwtAuthGuard + RolesGuard + Roles(Admin)`
    (ya existe).
  - `PublicSiteController`: endpoint público `GET /api/public/leadership` sin
    autenticación (ya existe).
  - Único cambio nuevo en backend: mover lo **genérico** (`SiteSetting`, upload
    config, `PublicSiteController` vacío) a `site-config-foundation` si aún no
    se ha hecho (se coordina con ese change).

- **Frontend (admin)** — tab «Liderazgo» en Configuraciones:
  - Registrar la tab en el shell de Configuraciones.
  - CRUD de líderes principales: tabla/listado con rol, nombre, foto, orden,
    estado activo/switch; formulario drawer/modal de crear/editar.
  - Subir foto retrato para cada líder.
  - Subir/cambiar foto grupal de la junta (widget de upload + preview).

- **Sitio público**:
  - Agregar `fetchLeadership` en `integration.js` que consuma
    `GET /api/public/leadership` y mapee al formato esperado por `PageNosotros`.
  - Cablear `PageNosotros`: al montar, reemplazar los arrays hardcodeados
    `board` y `ministries` con los datos vivos de `/api/public/leadership`, y
    la foto grupal con `boardPhotoUrl`. Parche mínimo documentado en
    `INTEGRATION.md`.

- **Permisos**: escritura `Admin` en endpoints `/api/site-config/leaders/*`;
  lectura pública anónima en `/api/public/leadership`.

## Capabilities

### New Capabilities
- `site-section-liderazgo`: Gestión de la sección Liderazgo del sitio público:
  líderes principales (junta directiva), foto grupal, ministerios derivados de
  departamentos, y endpoint público para alimentar PageNosotros.

### Modified Capabilities
- `public-site-content` (de `site-config-foundation`): se agrega el endpoint
  `GET /api/public/leadership` y la función `fetchLeadership` en `integration.js`.

## Impact

- **Backend Module**: módulo `site-config` (existente, el borrador ya está
  registrado).
- **Entidades**: `PrincipalLeader`, `SiteSetting` (ya existen).
- **Migración**: `1780100000000-CreateSiteConfig` (ya existe).
- **API Endpoints** (ya existen en el borrador):
  - `GET/POST/PATCH/DELETE /api/site-config/leaders`, `POST /api/site-config/leaders/:id/photo`
  - `GET/POST /api/site-config/leadership/board-photo`
  - `GET /api/public/leadership`
- **Frontend**: tab «Liderazgo» en `/admin/configuraciones/liderazgo` (nuevo).
- **Sitio**: `website/integration.js` + parche en `website/pages-1.jsx` `PageNosotros`.
- **Depende de**: `site-config-foundation`.

## Fuera del alcance

- Ordenamiento de ministerios por prioridad o agrupación personalizada (se usa
  el orden natural alfabético de departamentos).
- Biografías o datos extendidos de líderes (solo rol, nombre y foto).
- Subida de múltiples fotos por líder (solo una foto retrato).
- Edición de ministerios/directores desde la tab Liderazgo (eso se gestiona en
  Departamentos → `user_departments`).
- Galería de fotos de la sección Liderazgo.
- Historial de cambios de la configuración.
