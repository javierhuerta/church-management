## Why

La sección HORARIOS del sitio público (`PageHorarios` en `website/pages-2.jsx`) muestra
los servicios semanales de la iglesia — Escuela Sabática, Culto Divino, Culto Joven los
sábados, y los cultos de oración entre semana — organizados por día con su hora, nombre
y descripción. Todo este contenido está hardcodeado en el diseño: la página itera un
array fijo `week` con día, items `[hora, nombre, descripción]`, y textos introductorios
como "Cada semana, un lugar para ti".

Para que la iglesia pueda mantener esta información al día — agregar o quitar servicios,
cambiar horarios, ajustar descripciones — este change hace la sección **administrable**
desde la pestaña "Horarios" de Configuraciones, montándose sobre la base
`site-config-foundation`.

A diferencia de otras secciones que usan `SiteSetting` (clave/valor), los horarios son
una **colección estructurada y ordenable**: requieren una entidad dedicada con CRUD,
ordenamiento y activación/desactivación por ítem.

## What Changes

- **Backend** — entidad `ScheduleItem` (`schedule_items`):
  - Tabla dedicada con CRUD admin completo.
  - Cada ítem: día/etiqueta, hora, nombre del servicio, descripción opcional,
    orden, indicador de día acentuado (Sábado) y activo/inactivo.
  - Migración para la tabla.

- **Backend** — endpoint público `GET /api/public/schedule`:
  - Sin autenticación. Devuelve solo ítems activos, ordenados por `sortOrder`.
  - Agrupa los ítems por `dayLabel`, cada día con su indicador `accent`.
  - Incluye los textos introductorios de la página desde `SiteSetting` (claves
    `horarios.*`).

- **Backend** — administración de horarios:
  - Controlador `ScheduleController` (`/api/site-config/schedule`) protegido
    `JwtAuthGuard + Roles(Admin)` con CRUD completo.
  - Reordenamiento vía actualización masiva de `sortOrder`.
  - Textos introductorios se editan con el endpoint genérico de `SiteSetting`.

- **Frontend (admin)** — pestaña "Horarios" en Configuraciones:
  - Listado de horarios con ordenamiento drag-and-drop o botones subir/bajar,
    toggle activo/inactivo, y formulario de creación/edición.
  - Formulario para editar los textos introductorios (`horarios.*`).
  - Registra la tab "Horarios" en el arreglo de `ConfiguracionesLayout`.

- **Sitio público** — cableado de `PageHorarios`:
  - `integration.js`: nuevo helper `window.IASD_API.fetchSchedule()`.
  - `pages-2.jsx`: parche mínimo en `PageHorarios` para consumir `fetchSchedule()`
    en vez del array `week` hardcodeado.
  - Documentado en `INTEGRATION.md`.

## Capabilities

### New Capabilities
- `site-section-horarios`: Administración de la sección Horarios del sitio público.
  Permite al admin gestionar la lista de servicios semanales (día, hora, nombre,
  descripción, orden, activo/inactivo) y editar los textos introductorios de la
  página. El sitio público consume los horarios activos desde un endpoint público
  sin autenticación.

## Impact

- **Backend Module**: módulo `site-config` (existente, se amplía con `ScheduleItem`).
- **New Entity**: `ScheduleItem` (`schedule_items`).
- **New Controller**: `ScheduleController` (`/api/site-config/schedule`, admin) y
  endpoint público en `PublicSiteController` (`GET /api/public/schedule`).
- **New DTOs**: `CreateScheduleItemDto`, `UpdateScheduleItemDto`, `ScheduleItemResponseDto`,
  `PublicScheduleResponseDto`.
- **Migrations**: crear tabla `schedule_items`.
- **API Endpoints**:
  - `GET /api/public/schedule` (público, devuelve horarios activos ordenados + textos).
  - `GET /api/site-config/schedule` (admin, lista todos los horarios con orden).
  - `POST /api/site-config/schedule` (admin, crear horario).
  - `PATCH /api/site-config/schedule/:id` (admin, editar horario).
  - `DELETE /api/site-config/schedule/:id` (admin, eliminar horario).
  - `PATCH /api/site-config/schedule/reorder` (admin, actualizar orden masivo).
- **Site Settings nuevos**: `horarios.page_kicker`, `horarios.page_title`,
  `horarios.page_paragraph`.
- **Frontend (admin)**: pestaña "Horarios" en `ConfiguracionesLayout` con CRUD y
  ordenamiento.
- **Sitio**: `website/integration.js` (+ `fetchSchedule`), `website/pages-2.jsx`
  (parche `PageHorarios`), `website/INTEGRATION.md`.
- **Depende de**: `site-config-foundation` (el shell de Configuraciones, `SiteSetting`,
  namespace `/api/public/*`, `integration.js`, `INTEGRATION.md`).
- **Seeders**: `ScheduleItemSeeder` con los 5 horarios iniciales del diseño actual,
  idempotente.
- **Permisos**: escritura `Admin`; lectura pública anónima (solo ítems activos).

## Fuera del alcance

- La sección "Puesta de sol" (sunset times) que también forma parte de `PageHorarios`:
  los horarios de puesta de sol son datos astronómicos que pueden calcularse o
  consumirse de una API externa. En esta versión, esa sección del diseño se mantiene
  hardcodeada o se retira temporalmente hasta un change futuro específico.
- Horarios especiales para fechas específicas (ej. semana santa, campañas): en v1
  los horarios son fijos recurrentes.
- Sincronización con el módulo de Calendario: los horarios son informativos y no
  generan eventos automáticamente en el calendario.
- Vista previa en tiempo real del sitio público desde el admin.
- Múltiples idiomas o traducciones de los horarios.
