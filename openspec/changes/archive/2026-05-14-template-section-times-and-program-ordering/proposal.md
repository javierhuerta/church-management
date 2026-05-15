## Why

Las plantillas de culto no guardan tiempos por sección, lo que obliga a editar manualmente cada sección cada vez que se crea un programa. Además, una vez creado el programa no hay forma de reordenar secciones o grupos sin eliminarlos y recrearlos. Ambos problemas generan fricción innecesaria en el flujo de preparación del culto.

## What Changes

- Se agregan los campos `startTime` (varchar nullable) y `duration` (int, minutos, nullable) a las secciones de plantilla (`service_template_sections`), con su migración de BD correspondiente.
- Al crear un programa desde una plantilla, los campos `startTime` y `duration` se propagan automáticamente a las secciones del programa.
- Se agregan campos `startTime` y `duration` a los formularios de creación y edición de secciones en la página de plantillas (frontend).
- Se agregan endpoints de reordenamiento: `PATCH /worship-services/programs/:id/groups/reorder` y `PATCH /worship-services/programs/:id/sections/reorder`, que reciben un array ordenado de IDs.
- En el detalle de un programa se implementa drag & drop (con `@dnd-kit/core`) para reordenar grupos y secciones dentro de grupos.

## Capabilities

### New Capabilities

- `program-item-ordering`: Capacidad de reordenar grupos y secciones de un programa mediante drag & drop en la UI, persistido en el backend con endpoints de reordenamiento.

### Modified Capabilities

- `worship-service-templates`: Las secciones de plantilla ahora soportan `startTime` y `duration`. Los DTOs de creación y actualización incluyen estos campos. Al crear un programa desde la plantilla, estos valores se copian a las secciones del programa.
- `worship-service-programs`: Al crear un programa, se propagan `startTime` y `duration` desde la plantilla. Se agregan dos endpoints de reordenamiento.

## Fuera del alcance

- Reordenamiento de secciones en la vista de plantilla (solo aplica a programas).
- Cálculo automático de tiempos en cascada (si la sección 1 dura 5 min, la sección 2 no se actualiza sola).
- Reordenamiento de programas en la lista de programas.

## Impact

- **Backend**: entidad `ServiceTemplateSection` (2 campos nuevos), migración TypeORM, DTOs `CreateTemplateSectionDto` / `UpdateTemplateSectionDto` / `TemplateSectionResponseDto`, servicio `WorshipServicesProgramsService` (propagación al crear programa), 2 endpoints nuevos en el controller de programas.
- **Frontend**: instalar `@dnd-kit/core` y `@dnd-kit/sortable`, componente drag & drop en `program-detail-page.tsx`, formulario de plantilla actualizado con los nuevos campos.
- **Módulo NestJS afectado**: `worship-services`.
- **BD**: migración `ALTER TABLE service_template_sections ADD COLUMN start_time VARCHAR, ADD COLUMN duration INT`.
