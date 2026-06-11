## 1. Backend — Entidades y migraciones

- [x] 1.1 Crear entidad `GalleryAlbum` (`gallery-album.entity.ts`) con campos: `title`, `description` nullable, `kicker` nullable, `sortOrder`, `isPublished`, `coverImagePath` nullable; extender `BaseEntity`
- [x] 1.2 Crear entidad `GalleryImage` (`gallery-image.entity.ts`) con FK a `GalleryAlbum` usando `@JoinColumn({ name: 'album_id' })`, campos: `filePath`, `caption` nullable, `sortOrder`, `isPublished`; extender `BaseEntity`
- [x] 1.3 Crear migración para la tabla `gallery_albums` (incluir columna `sort_order`, índice)
- [x] 1.4 Crear migración para la tabla `gallery_images` (FK `album_id` con `onDelete: 'CASCADE'`)

## 2. Backend — DTOs

- [x] 2.1 Crear `CreateGalleryAlbumDto` con `@ApiProperty` en cada campo
- [x] 2.2 Crear `UpdateGalleryAlbumDto` (Partial de create, `@ApiPropertyOptional`)
- [x] 2.3 Crear `GalleryAlbumResponseDto` con imágenes anidadas
- [x] 2.4 Crear `CreateGalleryImageDto` (caption nullable, sortOrder)
- [x] 2.5 Crear `UpdateGalleryImageDto` (caption, sortOrder, isPublished)
- [x] 2.6 Crear `GalleryImageResponseDto`
- [x] 2.7 Crear `UploadGalleryImageDto` con `@ApiProperty({ type: 'string', format: 'binary' })` (patrón DTO formal binario)
- [x] 2.8 Crear `ReorderImagesDto` (array de `{ id, sortOrder }`)

## 3. Backend — Servicio y lógica de negocio

- [x] 3.1 Crear `GalleryService` con CRUD de álbumes: `findAll`, `findOne` (con relaciones), `create`, `update`, `delete` (elimina imágenes del disco también)
- [x] 3.2 Agregar método `uploadImage` al servicio: validar MIME (`image/*`), tamaño (10MB), guardar en `uploads/gallery/`, crear registro en BD
- [x] 3.3 Agregar método `deleteImage` al servicio: eliminar archivo del disco, eliminar registro
- [x] 3.4 Agregar método `reorderImages` al servicio: actualizar `sortOrder` de las imágenes según array recibido
- [x] 3.5 Agregar método `togglePublishAlbum` y `togglePublishImage`
- [x] 3.6 Crear `PublicGalleryService` o método `getPublishedAlbums` que devuelve solo álbumes publicados con imágenes publicadas, ordenados por `sortOrder`

## 4. Backend — Controladores

- [x] 4.1 Crear `GalleryAdminController` con endpoints CRUD de álbumes (`GET/POST /api/gallery/albums`, `GET/PATCH/DELETE /api/gallery/albums/:id`), protegidos `JwtAuthGuard + Roles(Admin)`, decoradores OpenAPI completos
- [x] 4.2 Agregar endpoints de imágenes al controlador admin: `GET /api/gallery/albums/:id/images`, `POST /api/gallery/albums/:id/images` (subida con `FileInterceptor`), `PATCH/DELETE /api/gallery/images/:id`, `PATCH /api/gallery/albums/:id/reorder`
- [x] 4.3 Agregar endpoint `GET /api/public/gallery` al `PublicSiteController` (sin guard, anónimo), que llama al servicio público y devuelve álbumes con imágenes publicadas

## 5. Backend — Módulo y registro

- [x] 5.1 Crear `GalleryModule` con entidades, servicio, controlador admin, repositorios
- [x] 5.2 Agregar repositorios para `GalleryAlbum` y `GalleryImage` con `TypeOrmModule.forFeature`
- [x] 5.3 Registrar `GalleryModule` en `app.module.ts` dentro de `imports`
- [x] 5.4 Crear `GallerySeeder` con los 4 álbumes hardcodeados actuales del sitio público ("Cultos y predicaciones", "Bautismos y compromisos", "Ministerios", "Eventos especiales") con sus títulos, kickers, descripciones, orden y estado `isPublished = true`. Para cada álbum, crear las imágenes correspondientes (17 en total) con sus captions, orden y estado publicado. El seeder debe ser idempotente (verificar si ya existen antes de crear). Registrar en el runner de seeders.

## 6. Frontend — Configuraciones (tab Galería)

- [x] 6.1 Cargar skill `church-ui-design` antes de implementar componentes
- [x] 6.2 Regenerar cliente API desde OpenAPI; restaurar `request.ts` con git si queda vacío
- [x] 6.3 Agregar tab "Galería" al arreglo de tabs de `ConfiguracionesLayout` (`{ id: 'galeria', label: 'Galería', path: '/admin/configuraciones/galeria' }`)
- [x] 6.4 Crear página `GaleriaConfigPage` con formulario de dos campos: `galeria.header_title` y `galeria.intro_text`, usando `SiteConfigService` (o el cliente generado para `/api/site-config/settings/:key`)

## 7. Frontend — Gestión de galería (admin)

- [x] 7.1 Agregar entrada "Galería" al sidebar de admin (o sub-sección bajo "Contenido del sitio")
- [x] 7.2 Crear página `GalleryAlbumListPage` con listado de álbumes (tabla en desktop, tarjetas en mobile), contador de imágenes, badge de estado, botón "Nuevo álbum"
- [x] 7.3 Crear formulario/modal `GalleryAlbumForm` para crear/editar álbum (título, kicker, descripción, imagen de portada)
- [x] 7.4 Crear página `GalleryAlbumDetailPage` con grid de imágenes del álbum: miniatura, caption, badge de estado, botones de acción (editar, subir, bajar, toggle publicar, eliminar)
- [x] 7.5 Crear componente `GalleryImageUpload` con botón de subida, preview, y llamado al endpoint de upload
- [x] 7.6 Implementar reordenamiento de imágenes con botones "subir"/"bajar" (v1 sin drag-and-drop)
- [x] 7.7 Implementar toggle de publicación para álbumes e imágenes individuales

## 8. Sitio público — Cableado

- [x] 8.1 Agregar `fetchGallery()` a `website/integration.js` que consuma `GET /api/public/gallery` y mapee al formato que `PageGaleria` espera
- [x] 8.2 Parchear `PageGaleria` en `website/pages-1.jsx` para consumir `window.IASD_API.fetchGallery()` con estado React (`useState`/`useEffect`), reemplazando el arreglo `collections` hardcodeado; fallback a contenido estático si la API falla
- [x] 8.3 Documentar el parche en `website/INTEGRATION.md` con el diff mínimo y las instrucciones para re-aplicarlo

## 9. Verificación

- [x] 9.1 Probar CRUD de álbumes vía API (crear, editar, eliminar)
- [x] 9.2 Probar subida y eliminación de imágenes vía API; verificar archivos en disco
- [x] 9.3 Probar endpoint público `GET /api/public/gallery` (solo publicados, orden correcto)
- [x] 9.4 Probar flujo completo en frontend admin (crear álbum → subir imágenes → reordenar → publicar)
- [x] 9.5 Probar tab "Galería" en Configuraciones (guardar y recuperar settings)
- [x] 9.6 Probar `PageGaleria` en el sitio público con datos vivos
- [x] 9.7 Verificar que las migraciones corren limpio (`npm run migration:run`)
