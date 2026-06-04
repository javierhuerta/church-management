## Why

El sitio público tiene la sección "Programa del día" (`PagePrograma` en
`website/pages-4.jsx`) que muestra el programa del **Culto Divino del sábado**: su
título, predicador, tema, texto bíblico y la lista de partes (tabla
anuncia/programa/detalle). Hoy ese contenido está mockeado en un store local.

El sistema ya tiene el módulo de cultos (`worship-services`) con plantillas
(`ServiceTemplate`), programas (`ServiceProgram`), grupos y secciones, y estados
(DRAFT/PUBLISHED/ARCHIVED). Un programa típico incluye Escuela Sabática y Culto
Divino. **El sitio solo debe mostrar el Culto Divino** (sin Escuela Sabática).

Enfoque acordado con el usuario:
- Tener una **plantilla "solo culto"** (sin Escuela Sabática) y poder marcar que
  **esa plantilla es la que se muestra en el sitio web**.
- Cuando exista un programa **publicado** basado en esa plantilla para el sábado
  correspondiente, el sistema muestra ese programa en el sitio, con el predicador
  y los demás datos.
- El predicador, tema, texto bíblico y las partes se gestionan en el **módulo de
  Cultos** (no en Configuraciones).
- La tab "Cultos" de Configuraciones es **explicativa/redirección**: explica cómo y
  dónde configurar esto y enlaza al módulo de Cultos.

## What Changes

- **Backend** — nuevos campos en `ServiceProgram` (datos por-sábado del culto):
  - `title` (varchar nullable): título del culto (ej. "Culto Divino").
  - `preacher` (varchar nullable): predicador.
  - `theme` (varchar nullable): tema del sermón.
  - `scripture` (varchar nullable): texto bíblico del día.

- **Backend** — marcar la plantilla pública del sitio:
  - `ServiceTemplate.showOnWebsite` (boolean, default false): indica la plantilla
    "solo culto" cuyos programas publicados alimentan el sitio. Solo una plantilla
    debería tenerla activa a la vez (validación recomendada).

- **Backend** — endpoint público `GET /api/public/worship`:
  - Sin autenticación. Devuelve el programa `Published` del próximo sábado (o el
    sábado actual) cuya plantilla tiene `showOnWebsite = true`.
  - Encabezado: `date`, `title`, `preacher`, `theme`, `scripture`.
  - Items: secciones del programa (la plantilla "solo culto" ya excluye Escuela
    Sabática; como salvaguarda, si existe un grupo "Escuela Sabática" se excluye).
  - `accent` por heurística (secciones con "sermón"/"predicación"/"palabra").
  - Si no hay programa publicado para el sábado, devuelve `null` y el sitio muestra
    contenido por defecto.

- **Frontend (admin)** — tab "Cultos" en Configuraciones (tipo explicativa):
  - Usa `ConfigRedirectCard` (de la base). Explica:
    - Crear una **plantilla "solo culto"** (sin Escuela Sabática) en el módulo Cultos.
    - Marcar esa plantilla como **"mostrar en el sitio web"**.
    - Crear/**publicar** el programa del sábado con predicador, tema y texto bíblico.
  - Botón "Ir a Cultos" → `/admin/cultos`.
  - No edita predicador/tema/scripture aquí (se editan en el programa).

- **Sitio público** — cableado en `integration.js`:
  - `fetchWorship()` consume `GET /api/public/worship` y devuelve el shape que
    `PagePrograma` espera.
  - Parche mínimo en `pages-4.jsx` para reemplazar el store mock por la API.
  - Documentado en `INTEGRATION.md`.

## Capabilities

### New Capabilities
- `public-site-worship`: Sección "Programa/Cultos" del sitio público alimentada
  desde el módulo de cultos, vía `GET /api/public/worship`, mostrando solo el Culto
  Divino del sábado publicado.

### Modified Capabilities
- `worship-services`: Se agregan campos `title`, `preacher`, `theme`, `scripture` a
  `ServiceProgram` y la bandera `showOnWebsite` a `ServiceTemplate`. La edición de
  estos datos se hace en el flujo existente del módulo de Cultos.
- `site-config-admin`: Se agrega la tab "Cultos" (explicativa/redirección) al shell
  de Configuraciones.

## Impact

- **Backend Module**: `worship-services` (campos nuevos + bandera + controlador
  público); `site-config` (tab Cultos explicativa).
- **Modified Entities**: `ServiceProgram` (+4 columnas), `ServiceTemplate`
  (+`show_on_website`).
- **New Controller**: `PublicWorshipController` (`GET /api/public/worship`, sin guard).
- **New DTOs**: `PublicWorshipResponseDto`, `PublicWorshipItemDto`.
- **Migrations**: columnas `title`, `preacher`, `theme`, `scripture` en
  `service_programs`; columna `show_on_website` en `service_templates`.
- **Frontend (admin)**: tab "Cultos" explicativa en `/admin/configuraciones/cultos`;
  en el módulo de Cultos, exponer el campo `showOnWebsite` al crear/editar plantilla
  y los campos predicador/tema/scripture al crear/editar programa.
- **Sitio**: `website/integration.js` (+`fetchWorship`), `website/pages-4.jsx`
  (parche), `website/INTEGRATION.md`.
- **Depende de**: `site-config-foundation` (shell + `ConfigRedirectCard` + `/api/public/*`).
- **Permisos**: la edición de plantillas/programas y de `showOnWebsite` usa los roles
  existentes de cultos (`Admin`, `Pastor`, `Anciano`, `DirectorDepartamento`). La tab
  explicativa es visible para `Admin`. Lectura pública anónima (solo `Published`).

## Fuera del alcance

- Transmisiones en vivo (`site-section-transmisiones`).
- Escuela Sabática en el sitio (se excluye explícitamente).
- Edición del programa desde el sitio (es solo lectura; se edita en el admin).
- Generación de PDF desde el backend (se mantiene client-side `printProgram()`).
- Cultos que no sean de sábado (vespertinos, semana de oración) en esta versión.
- Permitir múltiples plantillas con `showOnWebsite=true` a la vez (se recomienda
  validar que sea única).
