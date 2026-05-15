## 1. Backend — Entidad y migración

- [x] 1.1 Agregar columnas `startTime` (varchar nullable) y `duration` (int nullable) a la entidad `ServiceTemplateSection` en `backend/src/modules/worship-services/entities/service-template-section.entity.ts`
- [x] 1.2 Crear migración `1779600000000-AddTimesToTemplateSection.ts` con `ALTER TABLE service_template_sections ADD COLUMN start_time VARCHAR, ADD COLUMN duration INT`

## 2. Backend — DTOs

- [x] 2.1 Agregar campos `startTime?: string` y `duration?: number` a `SectionDto` en `backend/src/modules/worship-services/dto/template.dto.ts` (usado en create y update de plantillas)
- [x] 2.2 Agregar campos `startTime: string | null` y `duration: number | null` a `TemplateSectionResponseDto` en `backend/src/modules/worship-services/dto/template-response.dto.ts`
- [x] 2.3 Agregar `ReorderDto` en `backend/src/modules/worship-services/dto/program.dto.ts` con `orderedIds: string[]`

## 3. Backend — Servicio

- [x] 3.1 En `program.service.ts`, en el loop de creación de secciones dentro de grupos, agregar `startTime: tSection.startTime ?? null, duration: tSection.duration ?? null` al `sectionRepo.create({...})`
- [x] 3.2 En `program.service.ts`, en el loop de creación de secciones sueltas (sin grupo), agregar la misma propagación
- [x] 3.3 Implementar método `reorderGroups(programId: string, orderedIds: string[])` en `program.service.ts`: actualiza `order` de cada grupo según índice en el array
- [x] 3.4 Implementar método `reorderSections(programId: string, orderedIds: string[])` en `program.service.ts`: actualiza `order` de cada sección según índice en el array
- [x] 3.5 En `template-crud.service.ts`, al crear/actualizar secciones de plantilla, persistir los campos `startTime` y `duration` del DTO

## 4. Backend — Controller y API

- [x] 4.1 Agregar endpoint `PATCH /:programId/groups/reorder` en `program.controller.ts` que llama a `reorderGroups`
- [x] 4.2 Agregar endpoint `PATCH /:programId/sections/reorder` en `program.controller.ts` que llama a `reorderSections`
- [x] 4.3 Regenerar el cliente OpenAPI del frontend: `npm run generate-api` (o el script equivalente en el proyecto)

## 5. Frontend — Template form

- [x] 5.1 En `template-form-page.tsx`, agregar campos `startTime` (input time) y `duration` (input number) al formulario de creación/edición de secciones de plantilla
- [x] 5.2 Asegurarse de que los valores se envíen al crear y actualizar secciones vía el servicio generado

## 6. Frontend — Drag & drop en program detail

- [x] 6.1 Instalar `@dnd-kit/core` y `@dnd-kit/sortable` en `frontend/`
- [x] 6.2 Crear hook `useReorderGroups(programId)` y `useReorderSections(programId)` en `use-worship-services.ts` que llaman a los nuevos endpoints y invalidan la query del programa
- [x] 6.3 Extraer el card de grupo a un componente `SortableGroupCard` que use `useSortable` de `@dnd-kit/sortable`, mostrando el handle `GripVertical` cuando `canEdit`
- [x] 6.4 Extraer la fila de sección a un componente `SortableSectionRow` que use `useSortable`, mostrando el handle `GripVertical` cuando `canEdit`
- [x] 6.5 Envolver la lista de grupos en `<DndContext>` + `<SortableContext>` en `ProgramDetailPage`; al soltar un grupo, llamar a `reorderGroups` con el nuevo array de IDs ordenados
- [x] 6.6 Envolver la lista de secciones de cada grupo en un `<DndContext>` + `<SortableContext>` anidado; al soltar, llamar a `reorderSections` con el nuevo array de IDs ordenados

## 7. Verificación

- [x] 7.1 Crear una plantilla con secciones que tengan `startTime` y `duration`, luego crear un programa desde ella y verificar que los tiempos se propagaron
- [x] 7.2 Verificar que el drag & drop de grupos funciona y persiste el nuevo orden al recargar
- [x] 7.3 Verificar que el drag & drop de secciones dentro de un grupo funciona y persiste
- [x] 7.4 Verificar que el handle de arrastre no aparece en programas ARCHIVED o cuando el usuario no tiene permiso de edición
