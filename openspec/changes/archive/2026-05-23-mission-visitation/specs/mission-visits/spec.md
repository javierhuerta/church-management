## ADDED Requirements

### Requirement: Registrar una visita a una persona

El sistema SHALL permitir a usuarios con control total del módulo misionero registrar visitas a Personas. Una visita representa un contacto presencial planificado o realizado.

Cada visita vincula una Persona visitada con un estado obligatorio (`Planificada`, `Completada`, `Cancelada`) y, opcionalmente, una fecha planificada, una fecha de realización, un responsable y el resultado de la visita.

#### Scenario: Registrar una visita planificada
- **WHEN** un coordinador misionero registra una visita a una Persona con estado `Planificada` y una fecha planificada
- **THEN** el sistema registra la visita

#### Scenario: Registrar una visita completada
- **WHEN** un coordinador misionero registra una visita con estado `Completada`, fecha de realización y resultado
- **THEN** el sistema registra la visita con su resultado

### Requirement: Responsable de una visita

El sistema SHALL permitir indicar el responsable de una visita como un usuario del sistema, una pareja misionera o un texto libre. Una visita SHALL tener al menos un responsable indicado por alguno de esos medios.

#### Scenario: Visita con responsable usuario
- **WHEN** un coordinador misionero asigna un usuario como responsable de una visita
- **THEN** el sistema registra al usuario como responsable

#### Scenario: Visita con responsable como texto
- **WHEN** un coordinador misionero indica el responsable de una visita como texto libre
- **THEN** el sistema registra el responsable como texto

#### Scenario: Visita sin responsable
- **WHEN** un usuario intenta registrar una visita sin indicar ningún responsable
- **THEN** el sistema rechaza la solicitud con un error de validación

### Requirement: Historial de visitas de una persona

El sistema SHALL acumular todas las visitas registradas de una Persona como un historial consultable, ordenado cronológicamente.

#### Scenario: Ver el historial de visitas de una persona
- **WHEN** un usuario consulta las visitas de una Persona
- **THEN** el sistema devuelve todas las visitas de esa Persona ordenadas por fecha, con su responsable y resultado

#### Scenario: Persona con múltiples visitas
- **WHEN** una Persona ha sido visitada varias veces
- **THEN** el sistema conserva cada visita como un registro independiente en el historial

### Requirement: Editar y eliminar visitas

El sistema SHALL permitir a usuarios con control total editar el estado, las fechas, el responsable y el resultado de una visita, y eliminar el registro.

#### Scenario: Completar una visita planificada
- **WHEN** un coordinador misionero cambia una visita de `Planificada` a `Completada` y registra su resultado
- **THEN** el sistema actualiza la visita

#### Scenario: Eliminar una visita
- **WHEN** un coordinador misionero elimina una visita
- **THEN** el sistema elimina el registro

### Requirement: Listar y filtrar visitas

El sistema SHALL permitir listar las visitas con filtros por estado y por Persona.

#### Scenario: Listar visitas
- **WHEN** un usuario con control total solicita el listado de visitas
- **THEN** el sistema devuelve las visitas con su Persona, estado, fecha y responsable

#### Scenario: Filtrar visitas por estado
- **WHEN** un usuario filtra las visitas por el estado `Planificada`
- **THEN** el sistema devuelve únicamente las visitas planificadas
