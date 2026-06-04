## Contexto

El sitio público vive en `website/` (React 18 UMD + Babel-en-navegador, hash
routing, sin build). Se sirve tal cual para permitir actualizaciones drop-in del
diseño. El admin es la SPA React+Vite bajo `/admin`. Backend NestJS + TypeORM,
prefijo global `/api`, uploads servidos en `/uploads` (ServeStatic desde
`process.cwd()/uploads`). No hay guard JWT global (solo `ThrottlerGuard`): las
rutas sin `@UseGuards(JwtAuthGuard)` son públicas.

Esta base define **cómo** todas las secciones se administran y se publican, para
que cada section change solo aporte su contenido específico.

## Decisiones

### 1. Almacenamiento de configuración: híbrido

- **`SiteSetting` (clave/valor, tabla `site_settings`)** para valores simples:
  textos editables, banderas, rutas de imágenes únicas (p.ej. la foto de la junta).
  Clave `varchar` PK, `value text` nullable, `updated_at`.
- **Entidades dedicadas** cuando el contenido es una colección estructurada
  (p.ej. líderes principales, álbumes de galería). Cada section change decide.

Helpers en `SiteConfigService`: `getSetting(key)`, `setSetting(key, value)`.

### 2. API: separación admin vs público

- **Admin** (`/api/site-config/*`): protegido `JwtAuthGuard + RolesGuard + Roles(Admin)`.
  Gestiona la configuración. Cada section change agrega sus rutas aquí (o en su
  propio módulo, pero bajo el mismo criterio de permisos).
- **Público** (`/api/public/*`): SIN guard. Devuelve solo lo que la página necesita,
  ya agregado y filtrado (nunca borradores ni datos sensibles). Un controlador
  `PublicSiteController` por dominio; cada section change añade su `GET /public/<x>`.

Regla: el endpoint público de cada sección entrega exactamente la forma que la
página del diseño espera (mapeo en backend o en `integration.js`).

### 3. Subida de imágenes del sitio

Multer disk storage a `uploads/site/` con nombre aleatorio (`${ts}-${rand}${ext}`),
filtro `image/*`, límite `COVER_MAX_BYTES` (10MB). Se guarda la **ruta relativa**
(`site/<archivo>`) y se expone como URL `/uploads/site/<archivo>`. DTO formal de
upload (`@ApiProperty({ type: 'string', format: 'binary' })`) para evitar el bug
de codegen (`Record<string,any>`).

### 4. Admin "Configuraciones": shell por tabs

- Ruta `/admin/configuraciones` con `ConfiguracionesLayout` (patrón análogo a
  `MantenedoresLayout`).
- Navegación por **tabs** horizontales (en mobile, selector/scroll). Cada tab =
  una sección del sitio. La base entrega:
  - El layout + `Outlet`.
  - Sub-rutas `/admin/configuraciones/<seccion>` (cada section change registra la suya).
  - Un índice cuando no hay tab activa.
  - Entrada en el sidebar: "Configuraciones" (icono engranaje).
- Registro de tabs extensible: un arreglo declarativo de `{ id, label, path }` que
  cada section change amplía (o se descubre por rutas). Mantener simple: arreglo
  central en el layout que se va completando.

#### Dos tipos de tab

Cada sección decide el tipo de su tab:

- **Tab "editor"**: el contenido de la sección se administra aquí (formularios,
  CRUD, subida de imágenes). Su data vive en `SiteSetting` y/o entidades propias.
  Ej.: Inicio, Liderazgo, Horarios, Galería, Transmisiones.
- **Tab "explicativa / redirección"**: la sección se alimenta de un módulo del
  sistema que ya gestiona esos datos (no se duplica administración). La tab solo
  **explica dónde y cómo** se gestiona y **redirige** al módulo correspondiente
  (botón/enlace), más, opcionalmente, textos introductorios de la página.
  Ej.: **Calendario** (módulo Calendario; aparecen los eventos publicados) y
  **Cultos** (módulo Cultos; aparece el programa publicado marcado para el sitio).

La base provee un componente reutilizable para la tab explicativa
(`ConfigRedirectCard` o similar): título, explicación y botón "Ir a <módulo>".

### 6. Documentos: privado, fuera del sitio público

La sección "Documentos" del diseño (`PageDocumentos` en `website/pages-5.jsx`) es
**contenido privado** y ya se gestiona con el módulo de Documentos del admin
(`/admin/documentos`). Por tanto se **retira del sitio público**: se elimina de la
navegación (`Nav` en `ui.jsx`), de `VALID_PAGES` y del `switch` de `app.jsx`, y se
quita/inhabilita `PageDocumentos`. No tiene tab en Configuraciones.

### 5. Puente del sitio: `integration.js`

`window.IASD_API` expone un cliente mínimo:
- `apiGet(path)` → `fetch('/api' + path)` con `Accept: application/json`, maneja
  errores y devuelve JSON (`data` o array).
- Helpers de mapeo por sección (cada section change agrega el suyo).
- Mismo origen: en dev lo proxea Vite (`/api`), en prod el nginx del contenedor
  `website`. Sin CORS.

Parches mínimos en archivos del diseño se documentan en `INTEGRATION.md` para
re-aplicarlos ante una actualización del diseño.

## Permisos

- Escritura de configuración: `Admin`.
- Lectura pública: anónima (solo contenido publicado/activo).

## Riesgos / Notas

- El registro de tabs debe quedar desacoplado para que cada section change agregue
  la suya sin tocar a las demás (evitar conflictos de merge entre changes).
- `SiteSetting` es genérico: documentar las claves usadas en cada section change.
- El sitio usa Babel-en-navegador: `integration.js` es JS plano (sin JSX) para
  cargarse como `<script>` normal y estar disponible antes del render.

## Estado actual (head-start ya en el repo)

Parte de esta base ya fue iniciada durante la integración previa:
- `website/integration.js` e `INTEGRATION.md` existen (con `fetchEvents` del
  calendario y el redirect de "Acceder" a `/admin`).
- Existe un borrador de módulo backend `site-config` (entidades, servicio,
  controladores) creado para Liderazgo; se debe re-encuadrar: lo **genérico**
  (SiteSetting, upload de imágenes, PublicSiteController base) pertenece a esta
  base; lo **específico de líderes** pertenece a `site-section-liderazgo`.
