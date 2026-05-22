## Why

Las tarjetas de eventos del calendario tienen una imagen de fondo (cover) a baja opacidad (12-22%) que reduce significativamente la legibilidad del contenido (título, fecha, ubicación). Además, en móvil no existe interacción de popover por limitaciones de UX, lo que hace que la portada sea puramente decorativa y contraproducente. Paralelamente, el campo `sigla` (abreviatura) falta en la entidad Department, y los organizadores de eventos no se persisten correctamente al crear/editar.

## What Changes

- **Mobile**: la tarjeta de evento muestra la imagen de cover como header (al tope de la tarjeta, 100% width, aspect-ratio fijo) y el contenido textual debajo — sin overlay de fondo ni opacidad.
- **Desktop**: la tarjeta es minimalista (sin cover visible, texto plano) y al hacer hover/focus aparece un popover con la imagen de cover y todo el detalle del evento.
- **Departamento**: se agrega campo `sigla` (string corto, ej. "JOV", "FAM") a la entidad, DTOs, mantenedor y seeders. Las tarjetas de calendario muestran la sigla en vez de las iniciales derivándolas del nombre.
- **Organizadores**: se corrige la serialización/deserialización de organizadores en el DTO para que se guarden y recuperen correctamente (necesidad de revisar `@Expose()` y `Transform` en `OrganizerResponseDto`).
- **Limpieza**: se eliminan los `Transform` en `EventResponseDto` que derivan `departmentName`, `departmentColor` y `coverImageUrl` dado que la nueva arquitectura de popover los trae directamente de las relaciones.

## Capabilities

### New Capabilities
- `event-card-display`: Define los patrones de visualización de tarjetas de evento para desktop (popover) y mobile (cover como header) junto con los campos de departamento (`sigla`) que se muestran en la tarjeta.

### Modified Capabilities
- `mantenedor-departamentos`: Se agrega el campo `sigla` al CRUD de departamentos (nuevo campo requerido en create/edit, se muestra en la lista).

## Impact

- **Backend**: `Department` entity y DTOs (agrega `sigla`), seeders de departamento (actualizar con sigla), `EventResponseDto` (limpiar transforms).
- **Frontend**: `EventCard` component (rediseño mobile + desktop con popover), `DepartmentFormPage` (agrega input sigla), `CalendarList` / `CalendarGrid` (muestra sigla en vez de iniciales).
- **No hay breaking changes**: el campo `sigla` es nuevo y nullable en la DB hasta que se migre.
