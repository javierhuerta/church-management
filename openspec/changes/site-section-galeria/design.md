## Contexto

La página "Galería" (`PageGaleria` en `website/pages-1.jsx`) presenta imágenes organizadas en colecciones con títulos, agrupadas por tema ("Cultos y predicaciones", "Bautismos", "Ministerios", "Eventos especiales"). Cada imagen ocupa un slot en una grilla asimétrica con distintas alturas y anchos. Hoy todo está hardcodeado como objetos JS literales.

`site-config-foundation` ya estableció:
- El shell de Configuraciones por tabs (donde "Galería" será una tab más).
- `SiteSetting` clave/valor para opciones simples.
- El patrón de subida de imágenes con DTO formal binario (`@ApiProperty({ type: 'string', format: 'binary' })`).
- El puente `integration.js` y el espacio `/api/public/*`.

Este change crea el módulo `gallery` con sus entidades propias (es una colección estructurada, justifica tablas dedicadas) y cablea el sitio.

## Goals / Non-Goals

**Goals:**
- CRUD admin de álbumes de galería con imágenes, orden, caption y publicación.
- Endpoint público que devuelve solo álbumes e imágenes publicados, en la forma que el sitio espera.
- Cablear `PageGaleria` para consumir datos vivos vía `integration.js`.
- Tab "Galería" en Configuraciones con texto introductorio y título.

**Non-Goals:**
- Edición/optimización de imágenes.
- Videos o galerías multimedia.
- Categorías/tags.
- Analytics.

## Decisiones

### 1. Modelo: `GalleryAlbum` y `GalleryImage`

**Decisión:** entidades dedicadas (no `SiteSetting` genérico) porque la galería es una colección estructurada con relaciones, orden y múltiples imágenes.

#### `GalleryAlbum`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | |
| `title` | string | "Cultos y predicaciones" |
| `description` | string nullable | texto descriptivo del álbum |
| `sortOrder` | integer | orden de presentación (0, 1, 2…) |
| `isPublished` | boolean | `false` por defecto |
| `coverImagePath` | string nullable | ruta relativa de la imagen de portada (`gallery/<archivo>`) |
| `createdAt`/`updatedAt` | timestamp | |

#### `GalleryImage`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | |
| `albumId` | UUID FK | `@JoinColumn({ name: 'album_id' })` |
| `album` | FK `GalleryAlbum` | con `onDelete: 'CASCADE'` |
| `filePath` | string | ruta relativa (`gallery/<archivo>`) |
| `caption` | string nullable | leyenda de la imagen |
| `sortOrder` | integer | orden dentro del álbum (0, 1, 2…) |
| `isPublished` | boolean | `false` por defecto |
| `createdAt`/`updatedAt` | timestamp | |

**Por qué FK con `@JoinColumn`:** requerido por la convención del proyecto (evita columna camelCase duplicada). `@JoinColumn({ name: 'album_id' })` en la relación `@ManyToOne`.

### 2. Almacenamiento de imágenes

**Decisión:** mismo patrón que `department-showcase` y `site-config-foundation`. Multer disk storage a `uploads/gallery/`, nombre aleatorio `${uuidv4()}${ext}`, filtro `image/*`, límite 10 MB. Se guarda la ruta relativa (`gallery/<archivo>`) y se expone como URL `/uploads/gallery/<archivo>`. Al eliminar una imagen, se borra también del disco.

DTO formal de upload: `UploadGalleryImageDto` con `@ApiProperty({ type: 'string', format: 'binary' })` para evitar el bug de codegen.

### 3. API pública

**Decisión:** `GET /api/public/gallery` devuelve un arreglo de álbumes, cada uno con su arreglo de imágenes. Solo álbumes e imágenes con `isPublished = true`. Ordenados por `sortOrder` ascendente.

**Forma de la respuesta** (diseñada para que `PageGaleria` la consuma directamente):

```json
[
  {
    "id": "uuid",
    "title": "Cultos y predicaciones",
    "kicker": "Sábados",
    "description": "...",
    "coverImageUrl": "/uploads/gallery/abc.jpg",
    "images": [
      {
        "id": "uuid",
        "url": "/uploads/gallery/def.jpg",
        "caption": "Culto Divino",
        "sortOrder": 0
      }
    ]
  }
]
```

El campo `kicker` proviene de `SiteSetting` o de la descripción del álbum, según lo que defina la tab de Configuraciones. En v1, el `kicker` puede ser un campo opcional en `GalleryAlbum` o derivado de un `SiteSetting` por álbum. **Se opta por un campo `kicker` nullable en `GalleryAlbum`** (más simple que settings por álbum).

### 4. Tab "Galería" en Configuraciones

**Decisión:** la tab "Galería" en `/admin/configuraciones/galeria` permite editar:
- `galeria.header_title` → título del encabezado (default: "Vida de la congregación").
- `galeria.intro_text` → texto introductorio bajo el título.

Estos se guardan como `SiteSetting`. La tab es un formulario simple con dos campos de texto.

### 5. Frontend admin: estructura de páginas

**Decisión:** dos vistas:

1. **Listado de álbumes** (`/admin/galeria`): tabla/tarjetas con título, número de imágenes, estado (publicado/borrador), acciones (editar, eliminar, toggle publicar). Botón "Nuevo álbum".
2. **Detalle de álbum** (`/admin/galeria/:albumId`): grid de imágenes con drag-and-drop para reordenar, miniaturas, toggle de publicación, botón de eliminar. Botón "Subir imagen". Formulario de edición del álbum (título, kicker, descripción).

**No se usa drag-and-drop complejo en v1:** botones "subir"/"bajar" para reordenar imágenes, o un input de orden numérico. El DnD queda para una iteración futura.

### 6. Cableado del sitio

**Decisión:** `integration.js` agrega `fetchGallery()`:

```js
async fetchGallery() {
  const data = await apiGet('/public/gallery');
  return data.map(album => ({
    title: album.title,
    kicker: album.kicker || 'Galería',
    images: album.images.map(img => ({
      id: img.id,
      url: img.url,
      caption: img.caption,
      height: 360, // default; el layout del diseño adapta
      kind: '',    // default
    })),
  }));
}
```

`PageGaleria` se modifica para llamar `window.IASD_API.fetchGallery()` en un `useEffect`/`useState` y mapear las imágenes a slots de la grilla existente. Si la API falla, muestra un mensaje "Galería no disponible" o el contenido hardcodeado actual como fallback.

El parche se documenta en `website/INTEGRATION.md`.

### 7. Permisos

- **Admin**: CRUD completo de álbumes e imágenes, subida, eliminación, toggle de publicación, acceso a Configuraciones.
- **Público**: solo lectura de contenido publicado vía `/api/public/gallery`.

## Riesgos / Trade-offs

- **Reordenamiento sin DnD:** botones subir/bajar es funcional pero menos fluido. Se acepta para v1; el DnD se agrega después sin cambio de modelo.
- **Sin optimización de imágenes:** las imágenes se sirven en tamaño original. En producción, un reverse proxy (nginx) puede agregar `image_filter` o servir WebP. No es responsabilidad del backend en v1.
- **El diseño del sitio usa un grid asimétrico donde cada slot tiene un `height` fijo y un `kind` ("wide" o "").** La respuesta de la API no incluye estos metadatos de layout en v1; el sitio aplica defaults (altura 360, kind vacío) o un cálculo simple. Si se necesita control fino de layout por imagen, se agrega en v2.

### 7. Seeder con datos reales del sitio

**Decisión:** el `GallerySeeder` debe replicar exactamente los 4 álbumes y 17 imágenes actualmente hardcodeados en `PageGaleria` (`website/pages-1.jsx`), con `isPublished = true` tanto para álbumes como para imágenes.

#### Álbumes a crear (en orden `sortOrder`):

| sortOrder | title | kicker | description |
|---|---|---|---|
| 0 | Cultos y predicaciones | Sábados | null |
| 1 | Bautismos y compromisos | Momentos especiales | null |
| 2 | Ministerios | Vida en comunidad | null |
| 3 | Eventos especiales | A través del año | null |

#### Imágenes por álbum (cada una con `isPublished = true`):

**Cultos y predicaciones** (5 imágenes):
- sortOrder 0: caption "Culto Divino"
- sortOrder 1: caption "Predicación"
- sortOrder 2: caption "Escuela Sabática"
- sortOrder 3: caption "Coro"
- sortOrder 4: caption "Lectura bíblica"

**Bautismos y compromisos** (3 imágenes):
- sortOrder 0: caption "Bautismo"
- sortOrder 1: caption "Bautismo · río"
- sortOrder 2: caption "Imposición de manos"

**Ministerios** (6 imágenes):
- sortOrder 0: caption "Ministerio de Jóvenes"
- sortOrder 1: caption "Ministerio de Niños"
- sortOrder 2: caption "Conquistadores"
- sortOrder 3: caption "Damas"
- sortOrder 4: caption "Música"
- sortOrder 5: caption "Acción solidaria"

**Eventos especiales** (3 imágenes):
- sortOrder 0: caption "Semana Santa"
- sortOrder 1: caption "Día del Pastor"
- sortOrder 2: caption "Aniversario de la iglesia"

**Idempotencia:** el seeder verifica si ya existe un álbum con el título "Cultos y predicaciones" antes de crear. Si existe, omite la creación completa (no crea álbumes duplicados ni imágenes duplicadas).

**Archivos de imagen reales:** las 17 fotos reales del sitio (extraídas del estado original de `<image-slot>` en `website/.image-slots.state.json`) se versionan optimizadas como JPEG en `backend/src/seeds/gallery/assets/`. El `GallerySeeder` las copia a `uploads/gallery/` con nombres únicos al ejecutarse, de modo que en producción los álbumes y fotos iniciales quedan completos sin armarlos a mano. Cada álbum también recibe una portada (`coverImagePath`).

## Plan de migración

1. Migración: crear tabla `gallery_albums`.
2. Migración: crear tabla `gallery_images` con FK a `gallery_albums`.
3. Registrar el módulo `gallery` en `app.module.ts`.
4. Agregar la tab "Galería" al arreglo de tabs de Configuraciones.
5. Agregar `fetchGallery` a `integration.js`.
6. Parchear `PageGaleria` y documentar en `INTEGRATION.md`.

## Diseño visual

Cargar la skill `church-ui-design` antes de implementar cualquier componente visual.

- **Listado de álbumes:** patrón mobile/desktop obligatorio. En desktop: tabla con columnas (título, imágenes, estado, acciones). En mobile: tarjetas apiladas con badge de estado.
- **Detalle de álbum:** grid de miniaturas (3-4 columnas en desktop, 2 en mobile). Cada miniatura muestra la imagen, caption, badge de publicado/borrador, y botones de acción (editar caption, toggle publicar, subir, bajar, eliminar).
- **Badge de estado:** usar `STATUS_COLORS` de `church-ui-design`: verde para "Publicado", gris para "Borrador".
- **Formulario de álbum:** modal o página con campos título, kicker (opcional), descripción, imagen de portada.
- **Subida de imagen:** botón con preview, acepta solo imágenes, muestra progreso.
- **Tab "Galería" en Configuraciones:** formulario simple con dos campos de texto (título del encabezado, texto introductorio) y botón guardar.
- **Tipografía:** según jerarquía de `church-ui-design`. Sin tags HTML semánticos (`<h1>`, `<h2>`) en componentes; usar clases de Tailwind o `style` inline con los tamaños de la skill.
- **Dark mode:** todos los componentes deben funcionar en dark mode usando las variables CSS del tema.
- **Colores:** usar clases semánticas Tailwind de la skill (no colores hardcodeados). Fondos: `bg-surface`, `bg-background`. Textos: `text-foreground`, `text-muted-foreground`. Acentos: `text-gold`, `bg-navy`.

## UI Scenarios

### Scenario: Admin ve el listado de álbumes de galería

- **URL**: `/admin/galeria`
- **Description**: Un administrador accede a la gestión de galería y ve los álbumes existentes.
- **Steps**:
  1. `login` as `Admin`
  2. `navigate` to `/admin/galeria`
  3. `expect` page heading text `Galería`
  4. `expect` element `data-testid="gallery-album-list"` visible
  5. `expect` element `data-testid="gallery-album-new-button"` visible

```
+---------------------------------------------------+
| Galería                              [+ Nuevo álbum]|
+---------------------------------------------------+
| Álbum                    Imágenes   Estado         |
| Cultos y predicaciones   5          Publicado      |
| Bautismos                3          Borrador       |
| Ministerios              6          Publicado      |
+---------------------------------------------------+
```

### Scenario: Admin crea un álbum y sube imágenes

- **URL**: `/admin/galeria`
- **Description**: Un administrador crea un nuevo álbum y le sube imágenes.
- **Steps**:
  1. `login` as `Admin`
  2. `navigate` to `/admin/galeria`
  3. `click` button `data-testid="gallery-album-new-button"`
  4. `type` into `data-testid="gallery-album-title-input"` text `Eventos 2026`
  5. `type` into `data-testid="gallery-album-kicker-input"` text `A través del año`
  6. `click` button `data-testid="gallery-album-save-button"`
  7. `expect` redirect to album detail page
  8. `click` button `data-testid="gallery-image-upload-button"`
  9. `upload` file `test-image.jpg` to `data-testid="gallery-image-file-input"`
  10. `expect` element `data-testid="gallery-image-item-0"` visible

```
+---------------------------------------------------+
| ← Volver    Álbum: Eventos 2026                    |
+---------------------------------------------------+
| Título: Eventos 2026   Kicker: A través del año    |
| [ Subir imagen ]                                  |
+---------------------------------------------------+
| [img] caption...  [Borrador ▼] [▲][▼][✕]         |
| [img] caption...  [Borrador ▼] [▲][▼][✕]         |
+---------------------------------------------------+
```

### Scenario: Admin publica un álbum y sus imágenes

- **URL**: `/admin/galeria/:albumId`
- **Description**: Un administrador marca un álbum y sus imágenes como publicados.
- **Steps**:
  1. `login` as `Admin`
  2. `navigate` to album detail page
  3. `click` toggle `data-testid="gallery-album-publish-toggle"` to `on`
  4. `expect` badge shows `Publicado`
  5. `click` toggle `data-testid="gallery-image-publish-toggle-0"` to `on`
  6. `expect` image badge shows `Publicado`

```
+---------------------------------------------------+
| Álbum: Eventos 2026          [ Publicado ● ]      |
+---------------------------------------------------+
| [img] caption...  [Publicado ●] [▲][▼][✕]         |
| [img] caption...  [Borrador ○] [▲][▼][✕]          |
+---------------------------------------------------+
```

### Scenario: Visitante ve la galería en el sitio público

- **URL**: `/#galeria`
- **Description**: Un visitante anónimo navega a la sección Galería y ve las imágenes publicadas.
- **Steps**:
  1. `navigate` to site public URL
  2. `click` link to Galería section
  3. `expect` heading text visible
  4. `expect` gallery images visible
  5. `expect` no borrador images visible

```
+---------------------------------------------------+
| Galería                                           |
| Vida de la congregación                           |
| Momentos de adoración, comunión y servicio.       |
+---------------------------------------------------+
| Sábados                                           |
| Cultos y predicaciones                            |
| [img] [img] [img]                                 |
+---------------------------------------------------+
```
