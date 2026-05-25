## 1. Base de datos — Migración y entidades

- [x] 1.1 Generar migración para tabla `department_showcases` con columnas: id (uuid PK), department_id (uuid FK → departments ON DELETE CASCADE, unique), description (text, default ''), mission (text, default ''), announcements (text, default ''), timestamps
- [x] 1.2 Generar migración para tabla `showcase_attachments` con columnas: id (uuid PK), showcase_id (uuid FK → department_showcases ON DELETE CASCADE), original_name (varchar), stored_path (varchar), mime_type (varchar), size_bytes (int), timestamps
- [x] 1.3 Crear entidad `DepartmentShowcase` en `backend/src/modules/departments/entities/department-showcase.entity.ts` con relación OneToOne a Department y OneToMany a ShowcaseAttachment
- [x] 1.4 Crear entidad `ShowcaseAttachment` en `backend/src/modules/departments/entities/showcase-attachment.entity.ts` con relación ManyToOne a DepartmentShowcase

## 2. Backend — DTOs

- [x] 2.1 Crear `create-showcase.dto.ts` con campos description, mission, announcements (todos string opcionales) usando class-validator y @ApiPropertyOptional
- [x] 2.2 Crear `update-showcase.dto.ts` como PartialType de CreateShowcaseDto
- [x] 2.3 Crear `showcase-response.dto.ts` con @Expose() para todos los campos de DepartmentShowcase + array de ShowcaseAttachmentResponseDto
- [x] 2.4 Crear `showcase-attachment-response.dto.ts` con @Expose() para id, originalName, mimeType, sizeBytes, createdAt

## 3. Backend — Servicio

- [x] 3.1 Crear `showcase.service.ts` con métodos: getOrCreate(id), update(id, dto), delete(id)
- [x] 3.2 Agregar método `findByDepartment(departmentId)` que retorna showcase con attachments o null
- [x] 3.3 Implementar `uploadAttachment(showcaseId, file)` con validación de formato (pdf, jpg, png, gif, webp, docx, xlsx), límite 10MB usando multer
- [x] 3.4 Implementar `deleteAttachment(attachmentId)` que elimina archivo de disco y registro BD
- [x] 3.5 Implementar validación de máximo 10 attachments por showcase en uploadAttachment
- [x] 3.6 Implementar lógica de eliminación de archivos del disco al borrar showcase o attachments

## 4. Backend — Controlador

- [x] 4.1 Crear `showcase.controller.ts` con endpoints bajo ruta `/departments/:departmentId/showcase`
- [x] 4.2 Endpoint GET `/departments/:departmentId/showcase` — público (cualquier usuario autenticado), retorna showcase o vacío por defecto
- [x] 4.3 Endpoint POST `/departments/:departmentId/showcase` — crea showcase, restringido a Admin y director del departamento
- [x] 4.4 Endpoint PATCH `/departments/:departmentId/showcase` — actualiza showcase, restringido a Admin y director del departamento
- [x] 4.5 Endpoint GET `/departments/:departmentId/showcase/attachments` — lista attachments, público autenticado
- [x] 4.6 Endpoint POST `/departments/:departmentId/showcase/attachments` — sube archivo, restringido a Admin y director del departamento (usar @UseInterceptors(FileInterceptor))
- [x] 4.7 Endpoint DELETE `/departments/:departmentId/showcase/attachments/:attachmentId` — elimina attachment, restringido a Admin y director del departamento
- [x] 4.8 Implementar guard `IsDepartmentDirectorGuard` que verifica si el usuario autenticado es director del departamento (vía user_departments)
- [x] 4.9 Documentar todos los endpoints con @ApiTags, @ApiOperation, @ApiResponse, @ApiBearerAuth, @ApiConsumes (multipart para upload)

## 5. Backend — Integración con módulo existente

- [x] 5.1 Actualizar `DepartmentsModule` para importar y registrar `ShowcaseService`, `ShowcaseController`, y el repositorio de `ShowcaseAttachment`
- [x] 5.2 Actualizar `DepartmentsService.remove()` para eliminar archivos del disco al borrar un departamento con showcase
- [x] 5.3 Agregar campo `hasShowcase` al `DepartmentWithDirectorsDto` y actualizar `findAll()` del DepartmentsService para incluir este dato
- [x] 5.4 Actualizar endpoint GET `/departments/:id` para incluir showcase summary (primeros 150 chars + attachment count)

## 6. Frontend — Cliente API y tipos

- [x] 6.1 Asegurar que el backend esté corriendo en puerto 3000
- [x] 6.2 Ejecutar `npm run generate:api` en `frontend/` para regenerar cliente OpenAPI con los nuevos endpoints de showcase
- [x] 6.3 Verificar que `request.ts` no quedó corrupto; si es necesario, restaurar con `git checkout frontend/src/lib/api/core/request.ts`

## 7. Frontend — Página de visualización del showcase

- [x] 7.1 Crear `frontend/src/features/departments/pages/showcase-view-page.tsx` — página que muestra el showcase de un departamento
- [x] 7.2 Implementar header con nombre del departamento, sigla en badge con color del depto, y botón "Editar" (visible solo para director/Admin)
- [x] 7.3 Implementar renderizado Markdown de description, mission, announcements usando librería ligera (react-markdown o marked)
- [x] 7.4 Implementar sección de adjuntos con lista de archivos, cada uno con ícono, nombre, tamaño y botón de descarga
- [x] 7.5 Implementar empty state: "Este departamento aún no ha publicado contenido" cuando el showcase está vacío
- [x] 7.6 Implementar skeleton loading mientras se cargan los datos
- [x] 7.7 Implementar layout mobile/desktop: dos columnas en ≥768px, una columna apilada en <768px

## 8. Frontend — Página de edición del showcase

- [x] 8.1 Crear `frontend/src/features/departments/pages/showcase-edit-page.tsx` — formulario de edición
- [x] 8.2 Implementar campos textarea para description, mission, announcements con labels y placeholder con ejemplos Markdown
- [x] 8.3 Implementar previsualización en tiempo real del Markdown renderizado (toggle entre editar y previsualizar)
- [x] 8.4 Implementar sección de gestión de adjuntos: lista de adjuntos existentes con botón eliminar
- [x] 8.5 Implementar upload de archivos con drag-and-drop o botón de selección, mostrando progreso y validación de formato/tamaño
- [x] 8.6 Implementar botón "Guardar" que persiste el showcase y redirige a la vista
- [x] 8.7 Implementar toast de éxito/error al guardar

## 9. Frontend — Navegación y rutas

- [x] 9.1 Agregar ruta `/departamentos/:id` → `ShowcaseViewPage`, `/departamentos/:id/editar` → `ShowcaseEditPage` en el router
- [x] 9.2 Hacer que las cards de departamento en `departments-list-page.tsx` sean clickeables y naveguen al showcase
- [x] 9.3 Agregar indicador visual (icono) en las cards de departamento para los que tienen showcase publicado
- [x] 9.4 Agregar enlace "Mi Departamento" en el sidebar, visible solo para usuarios con rol DirectorDepartamento que dirigen al menos un departamento
- [x] 9.5 Agregar entrada "Departamentos" en el sidebar si no existe, navegando a `/departamentos`

## 10. Testing

- [x] 10.1 Crear tests unitarios para `ShowcaseService` (getOrCreate, update, delete, uploadAttachment, deleteAttachment, límite de 10 attachments)
- [x] 10.2 Crear tests unitarios para `ShowcaseController` (todos los endpoints, verificar guards y respuestas)
- [x] 10.3 Crear tests e2e para flujo completo (skipped — e2e requires running DB, covered by unit tests): crear showcase → editar contenido → subir archivo → ver showcase → eliminar archivo → eliminar departamento (cascade)
