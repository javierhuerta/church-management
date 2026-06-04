## Context

El sitio público (`website/`) muestra la sección Liderazgo en `PageNosotros`
(líneas ~378-570 de `pages-1.jsx`). La página renderiza tres bloques:

1. **Foto grupal** de la junta de iglesia (`PhotoSlot id="liderazgo-grupal"`).
2. **Junta directiva** («Responsables principales»): grid de 3 columnas con
   tarjetas que muestran foto retrato circular, rol (en gold, mono, uppercase)
   y nombre. Hardcodeado: `board = [{ role, name, slot }]` con `PhotoSlot`
   estáticos.
3. **Ministerios** («Líderes por área»): grid responsive con celdas que muestran
   «Min. <nombre>» y el nombre del responsable. Hardcodeado: `ministries =
   [{ role, name }]`.

El backend ya tiene un borrador funcional en el módulo `site-config` que provee
el endpoint `GET /api/public/leadership` con exactamente la forma que esta página
necesita. La base `site-config-foundation` define el shell de Configuraciones por
tabs donde se insertará la tab «Liderazgo».

Este change formaliza el borrador: agrega la UI de administración y el cableado
del sitio, documentando el estado ya construido y lo que falta.

### Estado actual (head-start ya en el repo)

Lo siguiente **ya existe** en el repositorio, construido como borrador previo:

| Artefacto | Ubicación | Estado |
|---|---|---|
| `PrincipalLeader` entity | `backend/src/modules/site-config/entities/` | ✅ Listo |
| `SiteSetting` entity | `backend/src/modules/site-config/entities/` | ✅ Listo |
| Migración `CreateSiteConfig` | `backend/src/migrations/1780100000000-` | ✅ Listo |
| DTOs (Create, Update, Response, PublicLeadership, UploadImage) | `backend/src/modules/site-config/dto/` | ✅ Listo |
| `SiteConfigService` (CRUD leaders, board photo, ministries, getPublicLeadership) | `backend/src/modules/site-config/site-config.service.ts` | ✅ Listo |
| `SiteConfigController` (endpoints admin) | `backend/src/modules/site-config/site-config.controller.ts` | ✅ Listo |
| `PublicSiteController` (`GET /api/public/leadership`) | `backend/src/modules/site-config/public-site.controller.ts` | ✅ Listo |
| Upload config (`uploads/site/`) | `backend/src/modules/site-config/config/upload.config.ts` | ✅ Listo |
| `integration.js` (base con `IASD_API`) | `website/integration.js` | ✅ Parcial (falta `fetchLeadership`) |

Lo que **falta**:

| Artefacto | Estado |
|---|---|
| Tab «Liderazgo» en el admin (UI) | ❌ Pendiente |
| `fetchLeadership` en `integration.js` | ❌ Pendiente |
| Cableado de `PageNosotros` en `pages-1.jsx` | ❌ Pendiente |
| Documentación del parche en `INTEGRATION.md` | ❌ Pendiente |
| Mover lo genérico a `site-config-foundation` (si aplica) | ❌ Coordinación |

## Goals / Non-Goals

**Goals:**
- Proveer una UI administrativa para CRUD de líderes principales y foto grupal.
- Exponer los datos vía endpoint público sin autenticación.
- Cablear el sitio público para que `PageNosotros` consuma datos vivos en vez
  de arrays hardcodeados.
- Documentar los parches para re-aplicarlos si el diseño se actualiza.

**Non-Goals:**
- CRUD de departamentos o directores desde esta tab (se hace en Departamentos).
- Editor de contenido enriquecido para la sección.
- Ordenamiento personalizado de ministerios.

## Decisions

### 1. Entidad `PrincipalLeader` — líder de junta directiva

**Decisión:** entidad dedicada (no `SiteSetting`) porque es una colección
estructurada con campos propios: rol, nombre, foto, orden, estado activo.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | |
| `role` | varchar(120) | ej. «Pastor», «Tesorero», «Secretaria» |
| `name` | varchar(160) | nombre completo |
| `photoPath` | varchar(255) null | ruta relativa bajo `uploads/` |
| `displayOrder` | int, default 0 | orden en el grid de la página |
| `isActive` | boolean, default true | solo activos aparecen en el sitio |
| `createdAt`/`updatedAt` | timestamptz | de `BaseEntity` |

**Ya existe.** No requiere cambios.

### 2. Foto grupal: `SiteSetting` clave `leadership.board_photo`

**Decisión:** una foto única no justifica una tabla. Se guarda como setting
clave/valor con la ruta relativa a `uploads/site/<archivo>`. `SiteConfigService`
expone `getBoardPhotoUrl()` y `setBoardPhoto(file)`.

**Ya existe.** No requiere cambios.

### 3. Ministerios: derivados de departamentos + directores

**Decisión:** los ministerios son los mismos departamentos del sistema, con sus
directores obtenidos via JOIN `user_departments`. `SiteConfigService.listMinistries()`
ejecuta una query SQL cruda que agrupa los nombres de los directores con
`string_agg`. El endpoint público los incluye en `PublicLeadershipDto.ministries[]`.

Esto es **solo lectura** desde la tab Liderazgo. Para cambiar qué usuarios dirigen
un departamento se usa la gestión de Departamentos.

**Ya existe.** No requiere cambios. Los departamentos sin directores asignados
aparecen con `leaders: null`, lo cual es aceptable: el sitio puede mostrar
«Sin responsable» o simplemente el nombre del ministerio.

### 4. `PublicLeadershipDto` — forma del endpoint público

**Decisión:** el endpoint `GET /api/public/leadership` devuelve una carga
agregada:

```typescript
{
  boardPhotoUrl: string | null,       // URL completa de la foto grupal
  board: PrincipalLeaderResponseDto[], // líderes activos, ordenados
  ministries: MinistryLeadershipDto[], // departamentos + nombres de directores
}
```

`MinistryLeadershipDto` incluye `id`, `name`, `sigla`, `color`, `leaders` (string
con nombres unidos por « y »).

**Ya existe.** Esta forma es suficiente para que `integration.js` mapee a los
arrays que espera `PageNosotros` sin cambios en el diseño.

### 5. Admin UI: tab «Liderazgo»

**Decisión:** la tab muestra:

- **Sección «Junta directiva»**: tabla/listado de `PrincipalLeader` con columnas:
  foto (thumbnail circular), rol, nombre, orden, activo (switch). Botón «+ Agregar»
  y acciones por fila (editar, eliminar, subir foto).
- **Sección «Foto grupal»**: widget de upload con preview de la foto actual y
  botón para reemplazarla.
- **Sección «Ministerios»**: tabla de solo lectura mostrando departamento y
  directores, con un aviso «Gestionado en Departamentos → Directores» y un link.

Formulario de líder: drawer o modal con campos rol (input), nombre (input),
orden (number), activo (switch). Subida de foto retrato: botón de upload dentro
del formulario o en la fila de la tabla (después de crear el líder).

Patrón mobile/desktop: en mobile, la tabla de líderes colapsa a tarjetas
verticales; la foto grupal ocupa ancho completo.

### 6. Cableado del sitio: `integration.js` + `PageNosotros`

**Decisión:** `integration.js` agrega una función `fetchLeadership()` que:

1. Hace `fetch('/api/public/leadership')`.
2. Mapea `board[]` a `{ role, name, photoUrl }` (quitando campos internos).
3. Mapea `ministries[]` a `{ role: name, name: leaders ?? 'Sin responsable' }`.
4. Devuelve `{ boardPhotoUrl, board, ministries }`.

`PageNosotros` se modifica para:

1. Reemplazar los arrays `board` y `ministries` hardcodeados por una variable
   de estado inicializada con `useState` y poblada por `useEffect` que llama a
   `window.IASD_API.fetchLeadership()`.
2. Reemplazar `PhotoSlot id="liderazgo-grupal"` por una etiqueta `<img>` con
   `src={boardPhotoUrl}` (o mantener `PhotoSlot` si acepta `src` dinámico).
3. Reemplazar los `PhotoSlot` de retratos por `<img>` con `src={p.photoUrl}`,
   con fallback a placeholder si no hay foto.
4. Fallback elegante: si la API falla, usar los datos hardcodeados actuales
   (conservados como valores por defecto).

Los pasos concretos del parche se documentan en `INTEGRATION.md`.

## Permisos

- Escritura (CRUD líderes, upload fotos): `Admin`.
- Lectura pública: anónima, solo líderes activos y departamentos públicos.

## Riesgos / Notas

- La query `listMinistries()` usa SQL crudo (`string_agg`). Si se migra a otro
  dialecto SQL hay que adaptarla.
- El borrador backend no tiene `site-config.module.ts` separado — está integrado
  directamente en `app.module.ts`. Al mover lo genérico a `site-config-foundation`
  puede ser necesario crear el módulo formal.
- La foto grupal se guarda como ruta relativa en `SiteSetting`. Si el archivo
  se borra manualmente del disco, la URL queda rota. La UI debe mostrar un
  placeholder en ese caso.

## Diseño visual

Cargar la skill `church-ui-design` antes de implementar componentes. Paleta de
marca (navy `#1B3A6B`, gold `#C8963E`, surface, bg, line). Aplicar colores con
clases semánticas Tailwind, no `style` inline (salvo cuando el diseño del sitio
lo requiera).

- **Tab Liderazgo**: layout con secciones encabezadas (`h2` + descripción).
  Separadores visuales entre «Junta directiva», «Foto grupal» y «Ministerios».
  En mobile, las secciones se apilan verticalmente con scroll natural.
- **Tabla de líderes**: columnas: Foto (40px circle thumbnail), Rol, Nombre,
  Orden, Activo (Switch), Acciones (editar, eliminar, foto). En mobile: tarjetas
  con foto + nombre arriba, rol y orden debajo, acciones al pie.
- **Formulario de líder**: drawer desde la derecha (desktop) o bottom sheet
  (mobile). Campos: Rol*, Nombre*, Orden (number), Activo (switch). Subida de
  foto: botón «Subir foto» con preview.
- **Widget foto grupal**: zona de drop/upload con preview de la imagen actual
  (proporción ~16:9 o la que use el diseño). Botón «Cambiar foto».
- **Tabla ministerios (solo lectura)**: columnas: Color (círculo de 12px),
  Ministerio, Responsables. Sin acciones. Badge informativo arriba:
  «Estos datos se gestionan en Departamentos».
- Tipografía: seguir jerarquía de la skill (`h2` serif, `h3` serif-medium,
  `body` sans, `mono` para badges/etiquetas). Soporte dark mode.

## UI Scenarios

### Scenario: Admin accede a la tab Liderazgo y ve los líderes

- **URL**: `/admin/configuraciones/liderazgo`
- **Description**: Un administrador accede a la tab Liderazgo dentro de
  Configuraciones y ve los líderes principales con sus fotos.
- **Steps**:
  1. `login` as `Admin`
  2. `navigate` to `/admin/configuraciones`
  3. `click` tab `Liderazgo`
  4. `expect` heading `Liderazgo` visible
  5. `expect` section heading `Junta directiva` visible
  6. `expect` element `[data-testid="leaders-table"]` visible
  7. `expect` section heading `Foto grupal` visible
  8. `expect` section heading `Ministerios` visible

```
+----------------------------------------------------------+
| Configuraciones                                          |
| [Inicio] [Liderazgo] [Calendario] [...]                  |
+----------------------------------------------------------+
| Junta directiva                                   [+ Nuevo]|
| ┌──────┬────────────┬────────────────┬───┬───┬────────┐  |
| │ Foto │ Rol        │ Nombre         │ # │ A │ Acciones│  |
| ├──────┼────────────┼────────────────┼───┼───┼────────┤  |
| │ (img)│ Pastor     │ Israel Jaramillo│ 0 │ ✓ │ ✏️🗑️📷 │  |
| │ (img)│ Tesorero   │ Jaime Leal      │ 1 │ ✓ │ ✏️🗑️📷 │  |
| └──────┴────────────┴────────────────┴───┴───┴────────┘  |
|                                                          |
| Foto grupal                                              |
| ┌──────────────────────────────────────────────────┐     |
| │              [preview de la foto]                 │     |
| │              [Cambiar foto]                       │     |
| └──────────────────────────────────────────────────┘     |
|                                                          |
| Ministerios (solo lectura — gestionado en Departamentos) |
| ┌────────────────┬──────────────────────────────┐        |
| │ ● ASA          │ Luis Contreras               │        |
| │ ● Comunicaciones│ Alejandro Care               │        |
| └────────────────┴──────────────────────────────┘        |
+----------------------------------------------------------+
```

### Scenario: Admin crea un nuevo líder principal

- **URL**: `/admin/configuraciones/liderazgo`
- **Description**: Un administrador crea un nuevo líder de junta directiva con
  rol y nombre.
- **Steps**:
  1. `login` as `Admin`
  2. `navigate` to `/admin/configuraciones/liderazgo`
  3. `click` button `[data-testid="add-leader-button"]`
  4. `type` into `[data-testid="leader-role-input"]` text `Vicepresidente`
  5. `type` into `[data-testid="leader-name-input"]` text `Carlos Martínez`
  6. `type` into `[data-testid="leader-order-input"]` text `2`
  7. `click` button `[data-testid="leader-save-button"]`
  8. `expect` table `[data-testid="leaders-table"]` contains `Carlos Martínez`

```
+----------------------------------------------------------+
| Nuevo líder de junta directiva                           |
+----------------------------------------------------------+
| Rol *             [ Vicepresidente           ]           |
| Nombre *          [ Carlos Martínez          ]           |
| Orden             [ 2                        ]           |
| Activo            [ ✓                        ]           |
|                                        [Cancelar] [Guardar]|
+----------------------------------------------------------+
```

### Scenario: Admin sube foto de la junta directiva

- **URL**: `/admin/configuraciones/liderazgo`
- **Description**: Un administrador sube o reemplaza la foto grupal de la junta.
- **Steps**:
  1. `login` as `Admin`
  2. `navigate` to `/admin/configuraciones/liderazgo`
  3. `expect` element `[data-testid="board-photo-section"]` visible
  4. `click` button `[data-testid="change-board-photo-button"]`
  5. `upload` file `test-assets/board-photo.jpg` to `[data-testid="board-photo-upload"]`
  6. `expect` preview `[data-testid="board-photo-preview"]` updates with new image

```
+----------------------------------------------------------+
| Foto grupal                                              |
| ┌──────────────────────────────────────────────────┐     |
| │              [ nueva foto preview ]               │     |
| │              [ Cambiar foto ]                     │     |
| └──────────────────────────────────────────────────┘     |
+----------------------------------------------------------+
```

### Scenario: Visitante ve Liderazgo en el sitio público con datos vivos

- **URL**: `http://localhost:5173/#/nosotros` (o ruta del hash routing del sitio)
- **Description**: Un visitante anónimo carga la página Liderazgo y ve los datos
  administrados en vez del hardcodeo.
- **Steps**:
  1. `navigate` to sitio público (sin login)
  2. `click` navigation link to `Liderazgo` / `Nosotros`
  3. `expect` page heading `Quienes sirven` visible
  4. `expect` foto grupal visible (si hay imagen configurada)
  5. `expect` grid `Junta directiva` shows leaders with roles and names
  6. `expect` grid `Líderes por área` shows ministries with leaders
  7. `expect` líderes visibles corresponden a los datos del endpoint público

```
+----------------------------------------------------------+
| Liderazgo                                                |
| Quienes sirven cada semana                               |
|                                                          |
| ┌──────────────────────────────────────────────────┐     |
| │              [foto grupal]                        │     |
| └──────────────────────────────────────────────────┘     |
|                                                          |
| Junta directiva                                          |
| Responsables principales                                 |
| ┌──────────┬───────────┬──────────┐                      |
| │  (foto)  │  (foto)   │  (foto)  │                      |
| │  PASTOR  │ TESORERO  │SECRETARIA│                      |
| │ I.Jaramillo│ J.Leal  │ R.García │                      |
| └──────────┴───────────┴──────────┘                      |
|                                                          |
| Ministerios — Líderes por área                           |
| ┌────────────────┬────────────────┬────────────────┐     |
| │ Min. ASA       │ Min. Comunic.  │ Min. Diáconos  │     |
| │ Luis Contreras │ Alejandro Care │ B. Lafontant   │     |
| └────────────────┴────────────────┴────────────────┘     |
+----------------------------------------------------------+
```
