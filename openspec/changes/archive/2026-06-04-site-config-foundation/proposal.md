## Why

El sitio web público (`website/`, export de Claude Artifacts servido tal cual) ya
está integrado: se sirve en `/` y el admin quedó bajo `/admin`. El calendario y el
acceso administrativo ya consumen el backend. El siguiente paso es **adaptar cada
sección del sitio para que su contenido sea administrable** desde el sistema, en
vez de estar hardcodeado en el diseño.

Para no repetir infraestructura en cada sección, este change crea la **base común**
sobre la que se montarán todas las secciones:

1. Un **menú de Configuraciones** en el admin (`/admin/configuraciones`) con un
   layout por **tabs**, donde cada sección del sitio (Inicio, Liderazgo, Calendario,
   Cultos, Transmisiones, Galería, …) tendrá su propia pestaña de personalización.
2. Un **almacén genérico de configuraciones** (`SiteSetting`, clave/valor) para
   textos, banderas y rutas de imágenes que no justifican una tabla propia.
3. Un **espacio de API público** (`/api/public/*`) para que el sitio (que usa
   `fetch` plano + Babel en navegador) lea contenido sin autenticación ni CORS.
4. El **puente de integración** del sitio (`website/integration.js`) como punto
   único y documentado donde cada sección engancha su `fetch` al backend.

Cada sección del sitio será un **change independiente** que depende de esta base:
agrega su tab en Configuraciones, su almacenamiento/CRUD admin, su endpoint público
y el cableado de la página correspondiente del sitio.

## What Changes

- **Backend** — módulo `site-config`:
  - Entidad `SiteSetting` (clave/valor) para settings simples del sitio.
  - Servicio con helpers `getSetting`/`setSetting` reutilizables.
  - Controlador admin base (`/api/site-config`, solo `Admin`).
  - Controlador público base (`/api/public`, sin guard) donde cada sección añade
    su endpoint de lectura agregada.
  - Patrón de subida de imágenes del sitio a `uploads/site/` (multer) reutilizable.

- **Frontend (admin)** — sección "Configuraciones":
  - Nueva entrada en el sidebar: "Configuraciones".
  - Layout con navegación por **tabs**, una por sección del sitio. La base entrega
    el shell, el routing `/admin/configuraciones/:tab` y un registro de tabs vacío
    (cada section change registra la suya).
  - Página de bienvenida/índice cuando no hay tab seleccionada.

- **Sitio público (`website/`)**:
  - `integration.js` como bridge documentado (`window.IASD_API`) con un cliente
    `fetch` mínimo hacia `/api/public/*` y helpers de mapeo.
  - `INTEGRATION.md` documenta los parches mínimos a re-aplicar si llega una
    actualización del diseño.
  - **Quitar la sección "Documentos"** del sitio público (es privada y se gestiona
    en el módulo de Documentos del admin): remover de la navegación, de
    `VALID_PAGES`, del `switch` de `app.jsx` y quitar `PageDocumentos`.

- **Tipos de tab**: la base soporta dos tipos de pestaña — **editor** (administra
  contenido aquí) y **explicativa/redirección** (la sección se nutre de un módulo
  existente; la tab explica y redirige). Ej. explicativas: Calendario y Cultos.

## Capabilities

### New Capabilities
- `site-config-admin`: Sección "Configuraciones" del admin con menú por tabs y
  almacén genérico de settings clave/valor para el sitio público.
- `public-site-content`: Espacio de API público (`/api/public/*`) y el puente
  `integration.js` del sitio para consumir contenido sin autenticación.

## Impact

- **Backend Module**: nuevo módulo `site-config` (registrado en `app.module.ts`).
- **New Entities**: `SiteSetting`.
- **Migrations**: tabla `site_settings`.
- **API Endpoints**:
  - `GET/PUT /api/site-config/settings/:key` (genérico, admin) — opcional, base.
  - `/api/public/*` namespace (cada sección agrega su `GET`).
- **Frontend**: nuevo layout `ConfiguracionesLayout` + ruta `/admin/configuraciones`,
  entrada de sidebar, registro de tabs extensible.
- **Sitio**: `website/integration.js`, `website/INTEGRATION.md`.
- **Depende de**: nada (es la base). Todos los `site-section-*` dependen de este.

## Fuera del alcance

- El contenido concreto de cada sección (Inicio, Liderazgo, Calendario, Cultos,
  Transmisiones, Galería): cada uno es su propio change.
- Eliminar la pantalla demo `#acceso` y los stores demo (localStorage) del diseño:
  se retiran a medida que cada sección queda conectada.
- Autenticación del sitio público (sigue siendo solo lectura anónima).
