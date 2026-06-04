# Mission Bible Studies

## Purpose

TBD

## Requirements

### Requirement: Registrar un estudio bíblico

El sistema SHALL permitir registrar el estudio bíblico de una Persona. Un estudio bíblico vincula una Persona estudiante con un estado misionero y, opcionalmente, un curso bíblico, una Persona instructora, una lección de progreso, un indicador de interés en bautizarse y notas de seguimiento.

El único campo obligatorio además de la Persona estudiante es el estado misionero.

#### Scenario: Crear estudio con datos mínimos
- **WHEN** un coordinador misionero registra un estudio indicando la Persona estudiante y el estado misionero
- **THEN** el sistema registra el estudio bíblico

#### Scenario: Crear estudio completo
- **WHEN** un coordinador misionero registra un estudio con estudiante, curso, instructor, estado, lección y notas
- **THEN** el sistema registra el estudio con todos los datos provistos

#### Scenario: Una persona puede tener varios estudios
- **WHEN** una Persona que ya completó un curso comienza un curso bíblico distinto
- **THEN** el sistema permite registrar un segundo estudio para la misma Persona

### Requirement: Estado misionero del estudio

El sistema SHALL clasificar cada estudio bíblico con un estado misionero entre: `Invitar` (interesado por invitar a estudiar), `Estudiando`, `Graduado` (completó el curso), `Bautismo` (en proceso de bautismo) y `Bautizado`.

#### Scenario: Cambiar el estado de un estudio
- **WHEN** un coordinador misionero cambia el estado de un estudio de `Invitar` a `Estudiando`
- **THEN** el sistema actualiza el estado y el estudio se cuenta en el nuevo estado

### Requirement: Seguimiento del progreso de lecciones

El sistema SHALL registrar el progreso de un estudio bíblico mediante un estado de progreso (`No iniciado`, `En curso`, `Completo`) y, cuando el progreso es `En curso`, el número de lección actual.

Cuando el estudio tiene un curso asignado, el número de lección actual NO SHALL exceder el número de lecciones del curso.

#### Scenario: Registrar avance de lección
- **WHEN** un instructor registra que un estudiante avanzó a la lección 8 de un curso de 20 lecciones
- **THEN** el sistema guarda el progreso `En curso` con lección 8

#### Scenario: Lección fuera de rango
- **WHEN** un usuario intenta registrar una lección mayor al número de lecciones del curso asignado
- **THEN** el sistema rechaza la solicitud con un error de validación

#### Scenario: Marcar estudio como completo
- **WHEN** un instructor marca el progreso de un estudio como `Completo`
- **THEN** el sistema registra el estudio como completado

### Requirement: Interés en bautizarse

El sistema SHALL permitir indicar si la Persona de un estudio bíblico está interesada en bautizarse.

#### Scenario: Marcar interés en bautismo
- **WHEN** un coordinador misionero marca que un estudiante está interesado en bautizarse
- **THEN** el sistema registra el interés y el estudio puede filtrarse por esa condición

### Requirement: Editar y eliminar estudios bíblicos

El sistema SHALL permitir a usuarios con control total del módulo misionero editar y eliminar estudios bíblicos.

#### Scenario: Editar un estudio
- **WHEN** un coordinador misionero modifica el curso o el instructor de un estudio
- **THEN** el sistema guarda los cambios

#### Scenario: Eliminar un estudio
- **WHEN** un coordinador misionero elimina un estudio bíblico
- **THEN** el sistema elimina el registro

### Requirement: Un instructor con usuario gestiona el progreso de sus estudios

El sistema SHALL permitir que un usuario vinculado a una Persona que figura como instructora de uno o más estudios bíblicos vea esos estudios y actualice su progreso, estado y notas.

Ese usuario NO SHALL poder crear ni eliminar estudios, ni cambiar la Persona estudiante.

#### Scenario: Instructor ve solo sus estudios
- **WHEN** un usuario instructor accede a la sección de estudios bíblicos
- **THEN** el sistema muestra únicamente los estudios donde la Persona del usuario figura como instructora

#### Scenario: Instructor actualiza el progreso de un estudiante
- **WHEN** un usuario instructor actualiza la lección, el estado o las notas de uno de sus estudios
- **THEN** el sistema guarda los cambios

#### Scenario: Instructor intenta crear un estudio
- **WHEN** un usuario instructor sin control total intenta crear un nuevo estudio bíblico
- **THEN** el sistema rechaza la operación por falta de permisos

### Requirement: Listar y filtrar estudios bíblicos

El sistema SHALL permitir listar los estudios bíblicos con filtros por estado misionero, instructor y curso, y SHALL mostrar el total de estudios por cada estado misionero.

#### Scenario: Listar estudios con totales
- **WHEN** un usuario con control total solicita el listado de estudios bíblicos
- **THEN** el sistema devuelve los estudios y el conteo total por cada estado misionero

#### Scenario: Filtrar estudios por estado
- **WHEN** un usuario filtra los estudios por el estado `Estudiando`
- **THEN** el sistema devuelve únicamente los estudios en estado `Estudiando`

#### Scenario: Filtrar estudios por instructor
- **WHEN** un usuario filtra los estudios por una Persona instructora
- **THEN** el sistema devuelve únicamente los estudios asignados a esa instructora

### Requirement: Ver los estudios de una persona

El sistema SHALL permitir consultar todos los estudios bíblicos en los que una Persona figura como estudiante.

#### Scenario: Ver historial de estudios de una persona
- **WHEN** un usuario consulta los estudios bíblicos de una Persona
- **THEN** el sistema devuelve todos los estudios donde esa Persona es estudiante, con su curso, estado y progreso