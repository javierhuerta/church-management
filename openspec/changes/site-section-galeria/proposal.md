## Why

La página "Galería" del sitio público (`PageGaleria` en `website/pages-1.jsx`) muestra una galería de imágenes organizadas en colecciones temáticas ("Cultos y predicaciones", "Bautismos y compromisos", "Ministerios", "Eventos especiales"), cada una con múltiples fotos distribuidas en una grilla asimétrica. Hoy todo el contenido —las colecciones, las imágenes y sus leyendas— está hardcodeado en el JSX.

El administrador necesita gestionar este contenido desde el admin: crear álbumes, subir imágenes, reordenarlas, marcar cuáles se publican, y definir textos introductorios. El sitio debe consumir solo el contenido publicado, en vivo.

Este change crea el módulo de galería completo (backend + frontend admin + endpoint público + cableado del sitio), montándose sobre la base de `site-config-foundation`.

## What Changes

- **Backend** — nuevo módulo `gallery`:
  - Entidades `GalleryAlbum` (título, descripción, orden, publicado, portada) y `GalleryImage` (FK a álbum con `@JoinColumn`, ruta de archivo, caption, orden, publicado).
  - CRUD admin de álbumes e imágenes (`/api/gallery/*`), con subida de imágenes a `uploads/gallery/`, eliminación desde disco, reordenamiento y toggle de publicación.
  - Endpoint público `GET /api/public/gallery` que devuelve álbumes publicados con sus imágenes publicadas, en la forma que `PageGaleria` espera.
  - Migración para las tablas `gallery_albums` y `gallery_images`.
  - **Seeder con datos reales**: los 4 álbumes y 17 imágenes actualmente hardcodeados en `PageGaleria` ("Cultos y predicaciones", "Bautismos y compromisos", "Ministerios", "Eventos especiales") deben ser creados por el `GallerySeeder` con sus títulos, kickers, descripciones, orden y estado publicado, replicando exactamente el contenido actual del sitio.

- **Frontend admin** — gestión de galería:
  - Sub-sección "Galería" en el sidebar de admin (o dentro de una sección de Contenido del sitio), con listado de álbumes, vista de detalle con imágenes del álbum, formularios de creación/edición, subida/eliminación/reorden de imágenes, y toggle de publicación.
  - Tab "Galería" en Configuraciones (`/admin/configuraciones/galeria`) con opciones de presentación de la sección: texto introductorio, título del encabezado, vía `SiteSetting` (`galeria.*`).

- **Sitio público** — cableado de `PageGaleria`:
  - Helper `IASD_API.fetchGallery()` en `website/integration.js` que consulta `GET /api/public/gallery` y mapea la respuesta al formato de colecciones que la página espera.
  - Parche mínimo en `website/pages-1.jsx` (`PageGaleria`) para consumir desde `window.IASD_API` en vez de datos hardcodeados, con degradación elegante.

- **Permisos**: escritura (CRUD, subida, toggle) para `Admin`; lectura pública anónima (solo contenido publicado).

## Capabilities

### New Capabilities
- `gallery-management`: Gestión de álbumes e imágenes de la galería del sitio público, con subida, reordenamiento y control de publicación.
- `public-gallery-content`: Exposición de la galería publicada al sitio público vía `GET /api/public/gallery`.

### Modified Capabilities
- `site-config-admin`: Se agrega la tab "Galería" en Configuraciones con settings `galeria.*`.
- `public-site-content`: Se agrega el endpoint `GET /api/public/gallery` al controlador público y el helper `fetchGallery` en `integration.js`.

## Impact

- **Backend Module**: nuevo módulo `gallery` (registrado en `app.module.ts`).
- **New Entities**: `GalleryAlbum`, `GalleryImage`.
- **Migrations**: crear tablas `gallery_albums` y `gallery_images`.
- **API Endpoints**:
  - `GET/POST /api/gallery/albums`, `GET/PATCH/DELETE /api/gallery/albums/:id`
  - `GET /api/gallery/albums/:id/images`, `POST /api/gallery/albums/:id/images` (subida)
  - `PATCH /api/gallery/images/:id` (caption, orden, publicado), `DELETE /api/gallery/images/:id`
  - `PATCH /api/gallery/albums/:id/reorder` (reordenar imágenes del álbum)
  - `GET /api/public/gallery` (público, sin auth)
- **Frontend**: páginas de gestión de galería (`/admin/galeria` o similar), tab "Galería" en Configuraciones, regeneración del cliente API.
- **Sitio**: parche en `website/pages-1.jsx` (`PageGaleria`), helper en `website/integration.js`, documentación en `website/INTEGRATION.md`.
- **Depende de**: `site-config-foundation` (para `SiteSetting`, tabs de Configuraciones, `integration.js`, patrón de subida de imágenes y DTO formal binario).

## Fuera del alcance

- Edición de imágenes (recorte, filtros, redimensión): se suben tal cual.
- Optimización automática de imágenes (WebP, tamaños responsivos): queda para una iteración futura de performance.
- Galería de videos o contenido embebido (solo imágenes estáticas).
- Categorías o tags más allá de la pertenencia a un álbum.
- Contador de visitas o analytics de la galería.
- Impresión o descarga de la galería completa desde el sitio público.
