## ADDED Requirements

### Requirement: Control total del módulo misionero por rol

El sistema SHALL otorgar control total del módulo misionero a los roles `Admin`, `Pastor`, `Anciano` y `CoordinadorMisionero`. Control total significa poder crear, editar y eliminar registros en todas las capacidades del módulo misionero.

#### Scenario: Coordinador misionero accede con control total
- **WHEN** un usuario con rol Coordinador Misionero accede al módulo misionero
- **THEN** el sistema le permite crear, editar y eliminar registros del módulo

#### Scenario: Admin, Pastor y Anciano acceden con control total
- **WHEN** un usuario con rol Admin, Pastor o Anciano accede al módulo misionero
- **THEN** el sistema le permite crear, editar y eliminar registros del módulo

### Requirement: Acceso de solo lectura para roles sin control total

El sistema SHALL otorgar acceso de solo lectura al módulo misionero a los roles que no tienen control total (`DirectorDepartamento`, `Secretaria`, `MaestroClase`). Estos roles pueden ver los listados y detalles del módulo pero no pueden crear, editar ni eliminar registros.

Las capacidades específicas del módulo PODRÁN ampliar los permisos de edición de estos roles sobre los registros que les pertenecen; cada capacidad define esas excepciones en su propio spec.

#### Scenario: Rol de solo lectura ve listados
- **WHEN** un usuario con rol Secretaria, Director de Departamento o Maestro de Clase accede al módulo misionero
- **THEN** el sistema le muestra los listados y detalles del módulo

#### Scenario: Rol de solo lectura intenta modificar
- **WHEN** un usuario sin control total intenta crear, editar o eliminar un registro del módulo misionero
- **THEN** el sistema rechaza la operación por falta de permisos

### Requirement: Navegación del módulo misionero

El sistema SHALL exponer el módulo misionero como una sección propia en la navegación principal, con sub-navegación para sus capacidades.

#### Scenario: Sección visible en el sidebar
- **WHEN** un usuario autenticado con acceso al módulo misionero abre la aplicación
- **THEN** el sistema muestra la sección "Misionero" en el sidebar con sus sub-secciones

#### Scenario: Acceder al mantenedor de personas desde la navegación
- **WHEN** un usuario con acceso al módulo misionero selecciona la sub-sección "Personas"
- **THEN** el sistema muestra el mantenedor de Personas
