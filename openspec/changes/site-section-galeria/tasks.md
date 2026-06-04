## 1. Backend — Entidades y migraciones

- [ ] 1.1 Crear entidad `GalleryAlbum` (`gallery-album.entity.ts`) con campos: `title`, `description` nullable, `kicker` nullable, `sortOrder`, `isPublished`, `coverImagePath` nullable; extender `BaseEntity`
- [ ] 1.2 Crear entidad `GalleryImage` (`gallery-image.entity.ts`) con FK a `GalleryAlbum` usando `@JoinColumn({ name: 'album_id' })`, campos: `filePath`, `caption` nullable, `sortOrder`, `isPublished`; extender `BaseEntity`
- [ ] 1.3 Crear migración para la tabla `gallery_albums` (incluir columna `sort_order`, índice)
- [ ] 1.4 Crear migración para la tabla `gallery_images` (FK `album_id` con `onDelete: 'CASCADE'`)

## 2. Backend — DTOs

- [ ] 2.1 Crear `CreateGalleryAlbumDto` con `@ApiProperty` en cada campo
- [ ] 2.2 Crear `UpdateGalleryAlbumDto` (Partial de create, `@ApiPropertyOptional`)
- [ ] 2.3 Crear `GalleryAlbumResponseDto` con imágenes anidadas
- [ ] 2.4 Crear `CreateGalleryImageDto` (caption nullable, sortOrder)
- [ ] 2.5 Crear `UpdateGalleryImageDto` (caption, sortOrder, isPublished)
- [ ] 2.6 Crear `GalleryImageResponseDto`
- [ ] 2.7 Crear `UploadGalleryImageDto` con `@ApiProperty({ type: 'string', format: 'binary' })` (patrón DTO formal binario)
- [ ] 2.8 Crear `ReorderImagesDto` (array de `{ id, sortOrder }`)

## 3. Backend — Servicio y lógica de negocio

- [ ] 3.1 Crear `GalleryService` con CRUD de álbumes: `findAll`, `findOne` (con relaciones), `create`, `update`, `delete` (elimina imágenes del disco también)
- [ ] 3.2 Agregar método `uploadImage` al servicio: validar MIME (`image/*`), tamaño (10MB), guardar en `uploads/gallery/`, crear registro en BD
- [ ] 3.3 Agregar método `deleteImage` al servicio: eliminar archivo del disco, eliminar registro
- [ ] 3.4 Agregar método `reorderImages` al servicio: actualizar `sortOrder` de las imágenes según array recibido
- [ ] 3.5 Agregar método `togglePublishAlbum` y `togglePublishImage`
- [ ] 3.6 Crear `PublicGalleryService` o método `getPublishedAlbums` que devuelve solo álbumes publicados con imágenes publicadas, ordenados por `sortOrder`

## 4. Backend — Controladores

- [ ] 4.1 Crear `GalleryAdminController` con endpoints CRUD de álbumes (`GET/POST /api/gallery/albums`, `GET/PATCH/DELETE /api/gallery/albums/:id`), protegidos `JwtAuthGuard + Roles(Admin)`, decoradores OpenAPI completos
- [ ] 4.2 Agregar endpoints de imágenes al controlador admin: `GET /api/gallery/albums/:id/images`, `POST /api/gallery/albums/:id/images` (subida con `FileInterceptor`), `PATCH/DELETE /api/gallery/images/:id`, `PATCH /api/gallery/albums/:id/reorder`
- [ ] 4.3 Agregar endpoint `GET /api/public/gallery` al `PublicSiteController` (sin guard, anónimo), que llama al servicio público y devuelve álbumes con imágenes publicadas

## 5. Backend — Módulo y registro

- [ ] 5.1 Crear `GalleryModule` con entidades, servicio, controlador admin, repositorios
- [ ] 5.2 Agregar repositorios para `GalleryAlbum` y `GalleryImage` con `TypeOrmModule.forFeature`
- [ ] 5.3 Registrar `GalleryModule` en `app.module.ts` dentro de `imports`
- [ ] 5.4 Agregar seeder opcional `GallerySeeder` con datos de ejemplo (álbumes e imágenes de demostración) registrado en el runner e idempotente

## 6. Frontend — Configuraciones (tab Galería)

- [ ] 6.1 Cargar skill `church-ui-design` antes de implementar componentes
- [ ] 6.2 Regenerar cliente API desde OpenAPI; restaurar `request.ts` con git si queda vacío
- [ ] 6.3 Agregar tab "Galería" al arreglo de tabs de `ConfiguracionesLayout` (`{ id: 'galeria', label: 'Galería', path: '/admin/configuraciones/galeria' }`)
- [ ] 6.4 Crear página `GaleriaConfigPage` con formulario de dos campos: `galeria.header_title` y `galeria.intro_text`, usando `SiteConfigService` (o el cliente generado para `/api/site-config/settings/:key`)

## 7. Frontend — Gestión de galería (admin)

- [ ] 7.1 Agregar entrada "Galería" al sidebar de admin (o sub-sección bajo "Contenido del sitio")
- [ ] 7.2 Crear página `GalleryAlbumListPage` con listado de álbumes (tabla en desktop, tarjetas en mobile), contador de imágenes, badge de estado, botón "Nuevo álbum"
- [ ] 7.3 Crear formulario/modal `GalleryAlbumForm` para crear/editar álbum (título, kicker, descripción, imagen de portada)
- [ ] 7.4 Crear página `GalleryAlbumDetailPage` con grid de imágenes del álbum: miniatura, caption, badge de estado, botones de acción (editar, subir, bajar, toggle publicar, eliminar)
- [ ] 7.5 Crear componente `GalleryImageUpload` con botón de subida, preview, y llamado al endpoint de upload
- [ ] 7.6 Implementar reordenamiento de imágenes con botones "subir"/"bajar" (v1 sin drag-and-drop)
- [ ] 7.7 Implementar toggle de publicación para álbumes e imágenes individuales

## 8. Sitio público — Cableado

- [ ] 8.1 Agregar `fetchGallery()` a `website/integration.js` que consuma `GET /api/public/gallery` y mapee al formato que `PageGaleria` espera
- [ ] 8.2 Parchear `PageGaleria` en `website/pages-1.jsx` para consumir `window.IASD_API.fetchGallery()` con estado React (`useState`/`useEffect`), reemplazando el arreglo `collections` hardcodeado; fallback a contenido estático si la API falla
- [ ] 8.3 Documentar el parche en `website/INTEGRATION.md` con el diff mínimo y las instrucciones para re-aplicarlo

## 9. Verificación

- [ ] 9.1 Probar CRUD de álbumes vía API (crear, editar, eliminar)
- [ ] 9.2 Probar subida y eliminación de imágenes vía API; verificar archivos en disco
- [ ] 9.3 Probar endpoint público `GET /api/public/gallery` (solo publicados, orden correcto)
- [ ] 9.4 Probar flujo completo en frontend admin (crear álbum → subir imágenes → reordenar → publicar)
- [ ] 9.5 Probar tab "Galería" en Configuraciones (guardar y recuperar settings)
- [ ] 9.6 Probar `PageGaleria` en el sitio público con datos vivos
- [ ] 9.7 Verificar que las migraciones corren limpio (`npm run migration:run`)
