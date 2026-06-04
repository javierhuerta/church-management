## ADDED Requirements

### Requirement: Listar clases de escuela sabática

El sistema SHALL permitir listar las clases de escuela sabática con su nombre, descripción, orden de presentación y estado activo.

El listado SHALL ser accesible a cualquier usuario autenticado.

#### Scenario: Listar clases de escuela sabática
- **WHEN** un usuario autenticado solicita el listado de clases de escuela sabática
- **THEN** el sistema devuelve las clases ordenadas por `displayOrder` con su nombre, descripción y estado

### Requirement: Crear una clase de escuela sabática

El sistema SHALL permitir a usuarios con control total del módulo misionero crear clases de escuela sabática con un nombre, una descripción opcional, un orden de presentación y un estado activo.

#### Scenario: Crear clase de escuela sabática
- **WHEN** un coordinador misionero crea una clase de escuela sabática con nombre "Clase 7" y descripción "Nueva clase"
- **THEN** el sistema registra la clase con el nombre, descripción, orden y estado activo por defecto

#### Scenario: Crear clase con nombre duplicado
- **WHEN** un usuario intenta crear una clase con un nombre que ya existe
- **THEN** el sistema rechaza la solicitud con un error de validación

### Requirement: Editar una clase de escuela sabática

El sistema SHALL permitir a usuarios con control total editar el nombre, la descripción, el orden de presentación y el estado activo de una clase de escuela sabática.

#### Scenario: Editar nombre de una clase
- **WHEN** un coordinador misionero cambia el nombre de la clase "Clase 3" a "Clase 3 — Esperanza"
- **THEN** el sistema actualiza el nombre de la clase

#### Scenario: Desactivar una clase
- **WHEN** un coordinador misionero marca una clase como inactiva
- **THEN** el sistema actualiza el estado y la clase deja de aparecer en los selectores activos

### Requirement: Eliminar una clase de escuela sabática

El sistema SHALL permitir a usuarios con control total eliminar una clase de escuela sabática, siempre que no tenga grupos pequeños ni equipos misioneros asociados.

#### Scenario: Eliminar clase sin asociaciones
- **WHEN** un coordinador misionero elimina una clase que no tiene grupos pequeños ni equipos misioneros asociados
- **THEN** el sistema elimina la clase

#### Scenario: Eliminar clase con grupos pequeños asociados
- **WHEN** un usuario intenta eliminar una clase que tiene grupos pequeños asociados
- **THEN** el sistema rechaza la eliminación e informa que la clase tiene grupos pequeños asociados

#### Scenario: Eliminar clase con equipos misioneros asociados
- **WHEN** un usuario intenta eliminar una clase que tiene equipos misioneros asociados directamente
- **THEN** el sistema rechaza la eliminación e informa que la clase tiene equipos misioneros asociados