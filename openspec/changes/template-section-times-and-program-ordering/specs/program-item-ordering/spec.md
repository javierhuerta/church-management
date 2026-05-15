## ADDED Requirements

### Requirement: Drag & drop para reordenar grupos en el detalle del programa
La vista de detalle de un programa SHALL permitir arrastrar y soltar grupos para cambiar su orden, disponible únicamente cuando el usuario tiene permiso de edición (`canEdit`).

#### Scenario: Reordenar grupos mediante drag & drop
- **WHEN** el usuario arrastra un grupo a una nueva posición y lo suelta
- **THEN** el sistema actualiza el orden en el backend y refleja el nuevo orden en la UI

#### Scenario: Drag & drop de grupos deshabilitado en modo solo lectura
- **WHEN** el programa está archivado o el usuario no tiene permiso de edición
- **THEN** el handle de arrastre no se muestra y los grupos no son arrastrables

### Requirement: Drag & drop para reordenar secciones dentro de un grupo
La vista de detalle SHALL permitir arrastrar y soltar secciones dentro de su grupo para cambiar su orden, disponible únicamente cuando `canEdit` es true. No se permite mover secciones entre distintos grupos.

#### Scenario: Reordenar secciones dentro de un grupo
- **WHEN** el usuario arrastra una sección a una nueva posición dentro del mismo grupo
- **THEN** el sistema actualiza el orden en el backend y refleja el nuevo orden en la UI

#### Scenario: No se permite mover secciones entre grupos
- **WHEN** el usuario intenta arrastrar una sección fuera de su grupo
- **THEN** la operación se cancela y la sección vuelve a su posición original

#### Scenario: Handle de arrastre visible solo en modo edición
- **WHEN** el usuario tiene permiso de edición (`canEdit`)
- **THEN** cada sección y cada grupo muestra un ícono de handle (GripVertical) al inicio de la fila
