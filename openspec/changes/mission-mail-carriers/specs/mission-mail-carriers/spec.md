## ADDED Requirements

### Requirement: Registrar un cartero misionero

El sistema SHALL permitir a usuarios con control total del módulo misionero registrar carteros misioneros. Un cartero misionero es una Persona que participa en el programa de distribución de material de evangelismo.

Cada registro de cartero vincula una Persona con, opcionalmente, su talla de chaqueta de uniforme, su estado activo y notas. Una Persona SHALL tener a lo sumo un registro de cartero misionero.

#### Scenario: Registrar un cartero
- **WHEN** un coordinador misionero registra una Persona como cartero misionero
- **THEN** el sistema registra el cartero

#### Scenario: Registrar cartero con talla de chaqueta
- **WHEN** un coordinador misionero registra un cartero indicando su talla de chaqueta
- **THEN** el sistema guarda la talla de chaqueta del cartero

#### Scenario: Persona ya es cartero
- **WHEN** un usuario intenta registrar como cartero a una Persona que ya tiene un registro de cartero
- **THEN** el sistema rechaza la solicitud e informa que la Persona ya es cartero misionero

### Requirement: Estado activo de un cartero

El sistema SHALL permitir marcar un cartero misionero como activo o inactivo. Por defecto un cartero nuevo es activo.

#### Scenario: Desactivar un cartero
- **WHEN** un coordinador misionero marca un cartero como inactivo
- **THEN** el sistema actualiza el estado del cartero

### Requirement: Editar y eliminar carteros misioneros

El sistema SHALL permitir a usuarios con control total editar la talla de chaqueta, el estado y las notas de un cartero, y eliminar el registro.

#### Scenario: Editar la talla de chaqueta
- **WHEN** un coordinador misionero cambia la talla de chaqueta de un cartero
- **THEN** el sistema guarda la nueva talla

#### Scenario: Eliminar un registro de cartero
- **WHEN** un coordinador misionero elimina el registro de cartero de una Persona
- **THEN** el sistema elimina el registro sin eliminar la Persona

### Requirement: Listar carteros misioneros

El sistema SHALL permitir listar los carteros misioneros con su Persona, talla de chaqueta y estado, y SHALL mostrar el total de carteros activos.

#### Scenario: Listar carteros
- **WHEN** un usuario con control total solicita el listado de carteros misioneros
- **THEN** el sistema devuelve los carteros con su Persona, talla de chaqueta, estado y el total de carteros activos
