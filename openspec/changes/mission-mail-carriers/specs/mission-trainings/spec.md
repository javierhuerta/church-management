## ADDED Requirements

### Requirement: Registrar una capacitación

El sistema SHALL permitir a usuarios con control total del módulo misionero registrar capacitaciones. Una capacitación es una instancia de formación dentro del módulo misionero (por ejemplo, capacitación de carteros, de parejas misioneras o de instructores bíblicos).

Cada capacitación tiene un nombre obligatorio y un estado (`Sin comenzar`, `En curso`, `Completada`), y opcionalmente un responsable, un lugar, una fecha, una modalidad y notas.

#### Scenario: Crear capacitación con datos mínimos
- **WHEN** un coordinador misionero crea una capacitación indicando su nombre
- **THEN** el sistema registra la capacitación con estado `Sin comenzar` por defecto

#### Scenario: Crear capacitación completa
- **WHEN** un coordinador misionero crea una capacitación con nombre, responsable, lugar, fecha y modalidad
- **THEN** el sistema registra la capacitación con todos los datos provistos

### Requirement: Estado de una capacitación

El sistema SHALL clasificar cada capacitación con un estado: `Sin comenzar`, `En curso` o `Completada`.

#### Scenario: Actualizar el estado de una capacitación
- **WHEN** un coordinador misionero cambia el estado de una capacitación de `Sin comenzar` a `Completada`
- **THEN** el sistema actualiza el estado

### Requirement: Responsable de una capacitación

El sistema SHALL permitir indicar el responsable de una capacitación como un usuario del sistema o como un texto libre.

#### Scenario: Capacitación con responsable usuario
- **WHEN** un coordinador misionero asigna un usuario como responsable de una capacitación
- **THEN** el sistema registra al usuario como responsable

#### Scenario: Capacitación con responsable como texto
- **WHEN** un coordinador misionero indica el responsable de una capacitación como texto libre
- **THEN** el sistema registra el responsable como texto

### Requirement: Registrar asistencia a una capacitación

El sistema SHALL permitir registrar qué Personas asistieron a una capacitación, agregando y quitando asistentes. Una Persona NO SHALL aparecer dos veces como asistente de la misma capacitación.

#### Scenario: Agregar un asistente
- **WHEN** un coordinador misionero registra que una Persona asistió a una capacitación
- **THEN** el sistema agrega a la Persona como asistente de la capacitación

#### Scenario: Quitar un asistente
- **WHEN** un coordinador misionero quita a una Persona de la lista de asistentes de una capacitación
- **THEN** el sistema elimina el registro de asistencia sin eliminar la Persona

#### Scenario: Asistente duplicado
- **WHEN** un usuario intenta agregar como asistente a una Persona que ya figura como asistente de esa capacitación
- **THEN** el sistema rechaza la operación

### Requirement: Editar y eliminar capacitaciones

El sistema SHALL permitir a usuarios con control total editar los datos de una capacitación y eliminarla. Al eliminar una capacitación, el sistema SHALL eliminar sus registros de asistencia sin eliminar las Personas.

#### Scenario: Eliminar una capacitación con asistentes
- **WHEN** un coordinador misionero elimina una capacitación que tiene asistentes registrados
- **THEN** el sistema elimina la capacitación y sus registros de asistencia, conservando las Personas

### Requirement: Listar capacitaciones

El sistema SHALL permitir listar las capacitaciones con su estado, fecha, responsable y número de asistentes.

#### Scenario: Listar capacitaciones
- **WHEN** un usuario con control total solicita el listado de capacitaciones
- **THEN** el sistema devuelve las capacitaciones con su estado, fecha, responsable y número de asistentes
