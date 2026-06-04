## MODIFIED Requirements

### Requirement: Registrar un estudio bíblico

El sistema SHALL permitir registrar el estudio bíblico de una Persona. Un estudio bíblico vincula una Persona estudiante con un estado misionero y, opcionalmente, un curso bíblico, un instructor, una lección de progreso, un indicador de interés en bautizarse y notas de seguimiento.

El instructor de un estudio bíblico PODRÁ ser una Persona individual o un equipo misionero completo. Un estudio NO SHALL tener simultáneamente un instructor Persona y un instructor equipo.

El único campo obligatorio además de la Persona estudiante es el estado misionero.

#### Scenario: Crear estudio con datos mínimos
- **WHEN** un coordinador misionero registra un estudio indicando la Persona estudiante y el estado misionero
- **THEN** el sistema registra el estudio bíblico

#### Scenario: Crear estudio con instructor persona
- **WHEN** un coordinador misionero registra un estudio asignando una Persona como instructora
- **THEN** el sistema registra el estudio con la Persona instructora

#### Scenario: Crear estudio con instructor equipo misionero
- **WHEN** un coordinador misionero registra un estudio asignando un equipo misionero como instructor
- **THEN** el sistema registra el estudio con el equipo instructor

#### Scenario: Rechazar instructor persona y equipo simultáneos
- **WHEN** un usuario intenta registrar un estudio con una Persona instructora y un equipo instructor al mismo tiempo
- **THEN** el sistema rechaza la solicitud con un error de validación

#### Scenario: Una persona puede tener varios estudios
- **WHEN** una Persona que ya completó un curso comienza un curso bíblico distinto
- **THEN** el sistema permite registrar un segundo estudio para la misma Persona

### Requirement: Un instructor con usuario gestiona el progreso de sus estudios

El sistema SHALL permitir que un usuario gestione el progreso, estado y notas de los estudios bíblicos en los que participa como instructor.

Un usuario participa como instructor de un estudio cuando la Persona vinculada a su cuenta figura como instructora del estudio, o cuando esa Persona es miembro activo del equipo misionero instructor del estudio.

Ese usuario NO SHALL poder crear ni eliminar estudios, ni cambiar la Persona estudiante.

#### Scenario: Instructor persona ve solo sus estudios
- **WHEN** un usuario instructor accede a la sección de estudios bíblicos
- **THEN** el sistema muestra los estudios donde la Persona del usuario figura como instructora

#### Scenario: Miembro de equipo instructor ve los estudios de su equipo
- **WHEN** un usuario cuya Persona es miembro activo de un equipo misionero instructor accede a la sección de estudios bíblicos
- **THEN** el sistema muestra los estudios cuya instructora es el equipo del usuario

#### Scenario: Instructor actualiza el progreso de un estudiante
- **WHEN** un usuario instructor actualiza la lección, el estado o las notas de uno de sus estudios
- **THEN** el sistema guarda los cambios

#### Scenario: Instructor intenta crear un estudio
- **WHEN** un usuario instructor sin control total intenta crear un nuevo estudio bíblico
- **THEN** el sistema rechaza la operación por falta de permisos

### Requirement: Listar y filtrar estudios bíblicos

El sistema SHALL permitir listar los estudios bíblicos con filtros por estado misionero, instructor Persona, equipo misionero instructor y curso, y SHALL mostrar el total de estudios por cada estado misionero.

#### Scenario: Listar estudios con totales
- **WHEN** un usuario con control total solicita el listado de estudios bíblicos
- **THEN** el sistema devuelve los estudios y el conteo total por cada estado misionero

#### Scenario: Filtrar estudios por estado
- **WHEN** un usuario filtra los estudios por el estado `Estudiando`
- **THEN** el sistema devuelve únicamente los estudios en estado `Estudiando`

#### Scenario: Filtrar estudios por instructor persona
- **WHEN** un usuario filtra los estudios por una Persona instructora
- **THEN** el sistema devuelve únicamente los estudios asignados a esa instructora

#### Scenario: Filtrar estudios por equipo instructor
- **WHEN** un usuario filtra los estudios por un equipo misionero instructor
- **THEN** el sistema devuelve únicamente los estudios cuya instructora es ese equipo