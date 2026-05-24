## Why

La junta de iglesia mensual aprueba documentos que están vinculados a un período específico (quincena/mes). Necesitamos identificar quién fue pastor de turno y quiénes fueron ancianos de turno en cada período para dar contexto a los documentos.

## What Changes

- Nueva entidad `Period` que agrupa documentos, pastor y ancianos de turno
- Programación automática de rotación de ancianos por número fijo y duración de turno
- Entidad `ElderShift` para asociar ancianos a períodos específicos de semanas
- Vista de documentos filtrada por período con información de pastor y ancianos de turno

## Capabilities

### New Capabilities

- `period-management`: Gestión de períodos que agrupan documentos de una junta con el pastor y ancianos de turno
- `elder-rotation`: Sistema de rotación automática de ancianos por número de semanas configurables

### Modified Capabilities

- `document-center`: Ahora los documentos están asociados a un período y muestran información contextual

## Impact

- Backend: nuevas entidades `Period` y `ElderShift`, endpoints para gestión de períodos
- Frontend: filtros por período, muestra de pastor y ancianos de turno
- Lógica de negocio: algoritmo de rotación automática de ancianos

## Out of Scope

- Edición manual de rotación (fuera del alcance inicial)
- Permisos especiales por período
- Historial de cambios de rotación