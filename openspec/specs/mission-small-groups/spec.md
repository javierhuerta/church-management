## ADDED Requirements

### Requirement: Registrar un grupo pequeño

El sistema SHALL permitir a usuarios con control total del módulo misionero registrar grupos pequeños. Un grupo pequeño es una unidad de acción (clase de Escuela Sabática) que se reúne periódicamente.

Cada grupo tiene una unidad de acción obligatoria y, opcionalmente, un nombre, un maestro de clase líder, un promotor misionero, un día y horario de reunión, una modalidad, un lugar, un teléfono de contacto y notas.

#### Scenario: Crear grupo con datos mínimos
- **WHEN** un coordinador misionero crea un grupo indicando su unidad de acción
- **THEN** el sistema registra el grupo pequeño

#### Scenario: Crear grupo completo
- **WHEN** un coordinador misionero crea un grupo con nombre, unidad de acción, maestro de clase, promotor, día, horario y modalidad
- **THEN** el sistema registra el grupo con todos los datos provistos

### Requirement: Maestro de clase como líder del grupo

El sistema SHALL permitir asignar como líder de un grupo pequeño a un usuario con rol Maestro de Clase. El líder es opcional al crear el grupo.

#### Scenario: Asignar maestro de clase a un grupo
- **WHEN** un coordinador misionero asigna un usuario con rol Maestro de Clase como líder de un grupo
- **THEN** el sistema registra al usuario como líder del grupo

### Requirement: Promotor misionero del grupo

El sistema SHALL permitir asignar opcionalmente a una Persona como promotor misionero de un grupo pequeño.

#### Scenario: Asignar promotor misionero
- **WHEN** un coordinador misionero asigna una Persona como promotor misionero de un grupo
- **THEN** el sistema registra a la Persona como promotor del grupo

### Requirement: Datos de reunión del grupo

El sistema SHALL permitir registrar el día de reunión (día de la semana), el horario, la modalidad (Presencial, Online, Mixto) y el lugar de reunión de un grupo pequeño.

#### Scenario: Registrar día y modalidad de reunión
- **WHEN** un coordinador misionero indica que un grupo se reúne los viernes de forma presencial en el templo
- **THEN** el sistema guarda el día, la modalidad y el lugar de reunión

### Requirement: Estado activo del grupo

El sistema SHALL permitir marcar un grupo pequeño como activo o inactivo. Por defecto un grupo nuevo es activo.

#### Scenario: Desactivar un grupo
- **WHEN** un coordinador misionero marca un grupo como inactivo
- **THEN** el sistema actualiza el estado del grupo

### Requirement: Gestionar los integrantes de un grupo pequeño

El sistema SHALL permitir agregar y quitar Personas como integrantes de un grupo pequeño. Una Persona SHALL pertenecer a lo sumo a un grupo pequeño a la vez.

#### Scenario: Agregar integrante a un grupo
- **WHEN** un coordinador misionero agrega una Persona como integrante de un grupo
- **THEN** el sistema registra a la Persona como integrante del grupo

#### Scenario: Persona ya pertenece a otro grupo
- **WHEN** un usuario intenta agregar a un grupo una Persona que ya es integrante de otro grupo pequeño
- **THEN** el sistema rechaza la operación e informa que la Persona ya pertenece a un grupo

#### Scenario: Quitar integrante de un grupo
- **WHEN** un coordinador misionero quita una Persona de un grupo
- **THEN** el sistema elimina la pertenencia de la Persona al grupo sin eliminar la Persona

### Requirement: Maestro de clase gestiona su propio grupo

El sistema SHALL permitir que un usuario con rol Maestro de Clase vea y edite el grupo pequeño del que es líder, incluyendo sus datos de reunión, sus notas y sus integrantes.

Ese usuario NO SHALL poder crear ni eliminar grupos, ni cambiar el líder, ni editar grupos de los que no es líder.

#### Scenario: Maestro de clase ve su grupo
- **WHEN** un usuario con rol Maestro de Clase accede a la sección de grupos pequeños
- **THEN** el sistema muestra el grupo del que es líder

#### Scenario: Maestro de clase agrega un integrante a su grupo
- **WHEN** un maestro de clase agrega una Persona como integrante del grupo que lidera
- **THEN** el sistema registra al integrante

#### Scenario: Maestro de clase intenta crear un grupo
- **WHEN** un maestro de clase intenta crear un nuevo grupo pequeño
- **THEN** el sistema rechaza la operación por falta de permisos

#### Scenario: Maestro de clase intenta editar un grupo ajeno
- **WHEN** un maestro de clase intenta editar un grupo del que no es líder
- **THEN** el sistema rechaza la operación por falta de permisos

### Requirement: Eliminar un grupo pequeño

El sistema SHALL permitir a usuarios con control total eliminar un grupo pequeño. Al eliminar el grupo, el sistema SHALL eliminar las pertenencias de sus integrantes sin eliminar las Personas.

#### Scenario: Eliminar un grupo con integrantes
- **WHEN** un coordinador misionero elimina un grupo que tiene integrantes
- **THEN** el sistema elimina el grupo y sus pertenencias, conservando las Personas integrantes

### Requirement: Listar grupos pequeños

El sistema SHALL permitir listar los grupos pequeños con su unidad de acción, líder, día de reunión y número de integrantes.

El listado completo SHALL ser accesible a usuarios con control total; un maestro de clase SHALL ver el grupo del que es líder.

#### Scenario: Listar grupos
- **WHEN** un usuario con control total solicita el listado de grupos pequeños
- **THEN** el sistema devuelve los grupos con su líder, día de reunión y número de integrantes
