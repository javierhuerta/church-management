## 1. Backend — Estado ARCHIVED y migración

- [x] 1.1 Añadir `ARCHIVED = 'ARCHIVED'` al enum `ProgramStatus` en `service-template-type.enum.ts`
- [x] 1.2 Generar migración TypeORM `ALTER TYPE program_status_enum ADD VALUE 'ARCHIVED'` (nombrarla `1779500000000-AddArchivedProgramStatus`)
- [x] 1.3 Ejecutar la migración y verificar que no hay errores

## 2. Backend — Endpoint GET con filtros

- [x] 2.1 Añadir DTO de query params `GetProgramsFilterDto` con campos opcionales: `createdById`, `templateId`, `dateFrom`, `dateTo`, `status` (con decoradores `@ApiPropertyOptional` y `@IsOptional`)
- [x] 2.2 Actualizar el método `findAll` del servicio para aplicar los filtros con `QueryBuilder` de TypeORM, ordenando por `date DESC`
- [x] 2.3 Actualizar el controller `GET /worship-programs` para recibir el DTO y documentarlo con `@ApiQuery`
- [x] 2.4 Verificar manualmente en Swagger que los nuevos params aparecen y funcionan

## 3. Backend — Endpoints DELETE

- [x] 3.1 Añadir método `archiveProgram(id, user)` en el servicio (cambia status a ARCHIVED, solo Admin)
- [x] 3.2 Añadir endpoint `PATCH /worship-programs/:id/archive` en el controller con guard de rol Admin
- [x] 3.3 Añadir método `deleteProgram(id, user)` en el servicio (elimina registro, solo Admin)
- [x] 3.4 Añadir endpoint `DELETE /worship-programs/:id` en el controller con guard de rol Admin
- [x] 3.5 Añadir método `deleteGroup(programId, groupId, user)` en el servicio (verifica permisos de edición)
- [x] 3.6 Añadir endpoint `DELETE /worship-programs/:programId/groups/:groupId` en el controller
- [x] 3.7 Añadir método `deleteSection(programId, sectionId, user)` en el servicio (verifica permisos de edición)
- [x] 3.8 Añadir endpoint `DELETE /worship-programs/:programId/sections/:sectionId` en el controller
- [x] 3.9 Documentar todos los nuevos endpoints con `@ApiOperation` y `@ApiResponse`

## 4. Backend — Regenerar cliente OpenAPI

- [x] 4.1 Arrancar el backend (`npm run start:dev` en `/backend`) y verificar que no hay errores de compilación
- [x] 4.2 Ejecutar `npm run generate:api` en `/frontend` para regenerar cliente
- [x] 4.3 Verificar que `src/lib/api/core/request.ts` no quedó vacío; si sí, restaurar con `git checkout`

## 5. Frontend — Componente ConfirmDialog

- [x] 5.1 Verificar que `AlertDialog` de shadcn está instalado (buscar en `src/components/ui/`); si no, añadirlo con `npx shadcn-ui add alert-dialog`
- [x] 5.2 Crear `frontend/src/components/ui/confirm-dialog.tsx` con props: `open`, `onOpenChange`, `title`, `description`, `confirmLabel`, `onConfirm`, `variant` (default / destructive)
- [x] 5.3 Verificar que el componente se renderiza correctamente y el botón de confirmar aplica `variant="destructive"` cuando corresponde

## 6. Frontend — Reemplazar alert/confirm y window.location.reload en detalle

- [x] 6.1 Añadir `useQueryClient` a `program-detail-page.tsx` e identificar los 6 puntos de `window.location.reload()`
- [x] 6.2 Reemplazar el `confirm()` de publicar por `ConfirmDialog` con el mensaje adecuado
- [x] 6.3 Reemplazar el `window.location.reload()` post-publicar por `queryClient.invalidateQueries(['programs', id])`
- [x] 6.4 Reemplazar el `confirm()` de eliminar programa por `ConfirmDialog` con `variant="destructive"`
- [x] 6.5 Reemplazar los `window.location.reload()` de guardar secciones por `queryClient.invalidateQueries(['programs', id])`
- [x] 6.6 Verificar que no queda ningún `window.location.reload()` ni `confirm()` en `program-detail-page.tsx`

## 7. Frontend — Eliminar grupos y secciones desde el detalle

- [x] 7.1 Añadir mutación `useDeleteGroup(programId)` en `use-worship-services.ts` (llama al nuevo endpoint DELETE)
- [x] 7.2 Añadir mutación `useDeleteSection(programId)` en `use-worship-services.ts`
- [x] 7.3 Añadir botón de eliminar (icono `Trash2`) en el componente de grupo en `program-detail-page.tsx`, visible solo para usuarios con permiso de edición
- [x] 7.4 Conectar el botón de eliminar grupo al `ConfirmDialog` y a la mutación `useDeleteGroup`
- [x] 7.5 Añadir botón de eliminar en el componente de sección, visible solo con permiso de edición
- [x] 7.6 Conectar el botón de eliminar sección al `ConfirmDialog` y a la mutación `useDeleteSection`
- [x] 7.7 Verificar que al eliminar un grupo desaparece del detalle sin reload y sus secciones también

## 8. Frontend — Filtros en el listado

- [x] 8.1 Añadir mutación/query `useDeleteProgram()` en `use-worship-services.ts` y actualizar `usePrograms` para aceptar los parámetros de filtro del nuevo DTO
- [x] 8.2 Crear componente `ProgramFilters` en `programs-list-page.tsx` con: select de estado, select de plantilla, select de creador, date pickers "desde"/"hasta"
- [x] 8.3 Gestionar el estado de los filtros activos con `useState` y pasarlos a `usePrograms`
- [x] 8.4 Verificar que el listado por defecto ordena de más reciente a más antiguo (el backend ya lo garantiza)
- [x] 8.5 Añadir botón "Eliminar" en cada `ProgramCard` visible solo para Admin, con `ConfirmDialog` y la mutación `useDeleteProgram`
- [x] 8.6 Añadir badge de estado "Archivado" en `ProgramCard` (gris) junto a los ya existentes Publicado/Borrador

## 9. Verificación final

- [ ] 9.1 Probar flujo completo: filtrar → abrir programa → editar sección (sin reload) → publicar (dialog) → archivar → eliminar grupo → eliminar sección
- [ ] 9.2 Probar como Admin: eliminar programa desde listado
- [ ] 9.3 Probar como Anciano: confirmar que no aparece botón eliminar en listado y que programas archivados son read-only
- [x] 9.4 Confirmar que TypeScript compila sin errores (`npx tsc --noEmit` en backend y frontend)
