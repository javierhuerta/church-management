## Why

El listado y la vista de detalle de programas de culto tienen deficiencias de usabilidad que dificultan la gestión diaria: no hay filtros para encontrar programas rápidamente, los diálogos de confirmación usan `alert()` nativo del navegador (que bloquea UI y no respeta el estilo del sistema), no es posible eliminar grupos ni secciones desde el detalle, y cualquier operación de guardado provoca un refresh completo de la pantalla que interrumpe el flujo de trabajo.

## What Changes

- **Filtros en el listado de programas**: por usuario creador, plantilla utilizada, rango de fechas y estado (DRAFT / PUBLISHED / ARCHIVED). El listado se ordena por fecha del evento de forma descendente por defecto.
- **Eliminación desde el listado (solo Admin)**: botón de eliminar visible en cada fila del listado para usuarios con rol Admin.
- **Estado ARCHIVED**: se añade un tercer estado al ciclo de vida del programa (`ARCHIVED`) para poder filtrar y ocultar programas antiguos sin borrarlos.
- **Diálogos de confirmación**: reemplazar todos los `alert()` / `confirm()` del navegador por componentes `Dialog` de shadcn/ui con estilos consistentes.
- **Eliminar grupos y secciones desde el detalle**: botón de eliminar en cada grupo y sección del detalle del programa, con diálogo de confirmación.
- **Actualizaciones sin refresh completo**: las operaciones de guardado de secciones, grupos y cambios de estado deben usar mutaciones de React Query con invalidación local en lugar de recargar la página completa.

## Capabilities

### New Capabilities

- `worship-program-filters`: Filtrado y ordenamiento del listado de programas (por usuario, plantilla, fechas, estado). Ordenamiento por fecha de evento descendente por defecto.

### Modified Capabilities

- `worship-service-programs`: Se añade estado `ARCHIVED`, eliminación de grupos/secciones desde el detalle, eliminación desde el listado (Admin), y restricciones actualizadas para el nuevo estado.

## Impact

- **Backend** — módulo `worship-services`:
  - Enum `ProgramStatus` gana el valor `ARCHIVED`.
  - Endpoint `GET /worship-programs` gana query params de filtrado (`createdById`, `templateId`, `dateFrom`, `dateTo`, `status`) y ordenamiento por `date DESC`.
  - Nuevos endpoints: `DELETE /worship-programs/:id` (Admin), `DELETE /worship-programs/:programId/groups/:groupId`, `DELETE /worship-programs/:programId/sections/:sectionId`.
  - Migración de DB para el nuevo valor del enum.

- **Frontend** — feature `worship-services`:
  - Regenerar cliente OpenAPI tras cambios en el backend.
  - Componente `ConfirmDialog` reutilizable (shadcn `Dialog`).
  - Panel de filtros en el listado.
  - Botones de eliminación en listado (condicional por rol) y en detalle.
  - Mutaciones React Query para todas las operaciones (sin `window.location.reload()`).

## Out of scope

- Reordenamiento de grupos/secciones (drag & drop) — ya existe.
- Edición de programas publicados por no-creadores.
- Exportación del programa a PDF.
- Notificaciones push al publicar un programa.
