## ADDED Requirements

### Requirement: Acción de exportar PDF en la vista de detalle del programa
La vista de detalle del programa SHALL incluir un botón "Descargar PDF" accesible para todos los roles de usuario que tengan permiso de ver el programa, independientemente del estado del mismo.

#### Scenario: Botón visible para todos los roles
- **WHEN** cualquier usuario autenticado accede a la página de detalle de un programa
- **THEN** el botón "Descargar PDF" está visible en el área de acciones del encabezado

#### Scenario: Botón no altera el estado del programa
- **WHEN** el usuario hace clic en "Descargar PDF"
- **THEN** el estado del programa no cambia y no se registra ninguna entrada en el historial de cambios
