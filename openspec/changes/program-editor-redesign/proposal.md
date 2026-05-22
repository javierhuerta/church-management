## Why

La pantalla de edición de programas de culto (`/cultos/programas/:id`) fue diseñada funcionalmente pero no sigue los lineamientos visuales del sistema de diseño, carece de una versión mobile adecuada, y no tiene integración con el módulo de calendario. Esto genera fricción para los usuarios que preparan los cultos desde dispositivos móviles, y obliga a crear manualmente los eventos del calendario al publicar un programa.

## What Changes

- **Rediseño visual completo** de `program-detail-page.tsx` aplicando el design system (paleta, tipografía, patrones de card, badges de estado)
- **Componentes mobile dedicados** para las tarjetas de grupo y sección del programa, siguiendo el patrón `MobileX / DesktopX` obligatorio del sistema
- **Mejora del historial de cambios** (`ProgramChangeHistory`): nueva UI con mejor jerarquía visual, filtros por acción, agrupación por fecha y soporte dark mode correcto
- **Publicación con creación de evento en calendario**: al publicar un programa, el sistema ofrece opción de crear automáticamente un evento en el calendario con la información del programa (fecha, nombre, horario del primer grupo)
- **Nuevo endpoint backend** `POST /worship-services/programs/:id/publish-with-event` que ejecuta la publicación y opcionalmente crea el evento en una sola transacción

## Capabilities

### New Capabilities

- `program-publish-to-calendar`: Al publicar un programa, el usuario puede optar por crear un evento en el calendario. El evento toma la fecha del programa, el nombre del template como título, el horario del primer grupo como `startDate`/`endDate`, y se crea con estado DRAFT para que el usuario lo complete si desea.

### Modified Capabilities

- `worship-service-programs`: Se agrega el flujo de publicación con evento de calendario opcional como variante del publish action.
- `worship-service-audit`: Se mejoran los requisitos de presentación del historial — agrupación por fecha, filtrado por tipo de acción, y soporte visual dark mode.

## Impact

- **Frontend**: `program-detail-page.tsx` (refactor completo), `program-change-history.tsx` (redesign), nuevos subcomponentes `ProgramGroupCard`, `ProgramSectionRow` con variantes mobile/desktop
- **Backend**: nuevo método en `ProgramService.publishWithEvent()`, nuevo DTO `PublishWithEventDto`, nuevo endpoint en `ProgramController`
- **API generada**: regenerar cliente OpenAPI tras agregar el endpoint
- **Módulo calendar**: se usa `CalendarService.create()` desde `worship-services` — requiere importar `CalendarModule` o usar un shared service
- **Roles y permisos**: solo usuarios con permiso de publicación pueden usar el nuevo endpoint (mismo guard que `publish`)
- **Fuera del alcance**: no se cambia la lógica de drag-and-drop, ni los formularios inline de edición de secciones, ni la exportación PDF
