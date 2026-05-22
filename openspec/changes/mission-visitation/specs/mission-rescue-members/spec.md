## ADDED Requirements

### Requirement: Registrar un miembro a rescatar

El sistema SHALL permitir a usuarios con control total del módulo misionero registrar miembros a rescatar. Un miembro a rescatar es una Persona, generalmente un miembro bautizado, que dejó de asistir y requiere seguimiento.

Cada registro de rescate vincula una Persona con una etapa de rescate obligatoria y, opcionalmente, los años desde su bautismo, un responsable de seguimiento y notas. Una Persona SHALL tener a lo sumo un registro de rescate.

#### Scenario: Crear registro de rescate
- **WHEN** un coordinador misionero registra una Persona como miembro a rescatar indicando su etapa
- **THEN** el sistema registra el seguimiento de rescate

#### Scenario: Persona ya tiene registro de rescate
- **WHEN** un usuario intenta registrar como miembro a rescatar a una Persona que ya tiene un registro de rescate
- **THEN** el sistema rechaza la solicitud e informa que la Persona ya está en seguimiento de rescate

### Requirement: Etapa de rescate

El sistema SHALL clasificar cada miembro a rescatar en una etapa: `Por rescatar`, `Visitado`, `Asiste esporádica`, `Asiste a iglesia` o `Decisión requerida`.

La etapa se actualiza manualmente; el sistema NO la modifica automáticamente al registrar visitas.

#### Scenario: Actualizar la etapa de rescate
- **WHEN** un coordinador misionero cambia la etapa de un miembro de `Por rescatar` a `Visitado`
- **THEN** el sistema actualiza la etapa

### Requirement: Editar y eliminar miembros a rescatar

El sistema SHALL permitir a usuarios con control total editar el responsable, los años de bautismo, la etapa y las notas de un miembro a rescatar, y eliminar el registro.

#### Scenario: Editar el responsable de seguimiento
- **WHEN** un coordinador misionero asigna un responsable de seguimiento a un miembro a rescatar
- **THEN** el sistema guarda el responsable

#### Scenario: Eliminar un registro de rescate
- **WHEN** un coordinador misionero elimina el registro de rescate de una Persona
- **THEN** el sistema elimina el registro sin eliminar la Persona

### Requirement: Listar y filtrar miembros a rescatar

El sistema SHALL permitir listar los miembros a rescatar con filtro por etapa.

#### Scenario: Listar miembros a rescatar
- **WHEN** un usuario con control total solicita el listado de miembros a rescatar
- **THEN** el sistema devuelve los registros con su Persona, etapa y responsable

#### Scenario: Filtrar por etapa
- **WHEN** un usuario filtra los miembros a rescatar por la etapa `Por rescatar`
- **THEN** el sistema devuelve únicamente los registros en esa etapa
