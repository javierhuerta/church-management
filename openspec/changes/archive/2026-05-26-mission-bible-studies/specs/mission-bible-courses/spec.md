## ADDED Requirements

### Requirement: Administrar cursos bíblicos

El sistema SHALL permitir a usuarios con control total del módulo misionero administrar un catálogo configurable de cursos bíblicos. Cada curso bíblico tiene un nombre, un número de lecciones y, opcionalmente, una audiencia (Adultos, Niños, Jóvenes, Familia).

#### Scenario: Crear curso bíblico
- **WHEN** un coordinador misionero crea un curso bíblico con nombre y número de lecciones
- **THEN** el sistema registra el curso y queda disponible para asignarlo a estudios bíblicos

#### Scenario: Crear curso con nombre duplicado
- **WHEN** un usuario intenta crear un curso bíblico con un nombre que ya existe
- **THEN** el sistema rechaza la solicitud con un error de validación

#### Scenario: Editar curso bíblico
- **WHEN** un coordinador misionero modifica el nombre, número de lecciones o audiencia de un curso
- **THEN** el sistema guarda los cambios

### Requirement: Cursos bíblicos iniciales

El sistema SHALL incluir un conjunto inicial de cursos bíblicos sembrados: Fe de Jesús, Fe de Jesús niños, Daniel, Apocalipsis, El hogar adventista y Biblia fácil.

#### Scenario: Catálogo inicial disponible
- **WHEN** se inicializa el módulo misionero con sus datos semilla
- **THEN** el sistema incluye los seis cursos bíblicos iniciales disponibles para asignar

### Requirement: Eliminar curso bíblico

El sistema SHALL permitir a usuarios con control total eliminar un curso bíblico únicamente si ningún estudio bíblico lo referencia.

#### Scenario: Eliminar curso sin estudios asociados
- **WHEN** un coordinador misionero elimina un curso bíblico que no está asignado a ningún estudio
- **THEN** el sistema elimina el curso

#### Scenario: Eliminar curso con estudios asociados
- **WHEN** un usuario intenta eliminar un curso bíblico que está asignado a uno o más estudios
- **THEN** el sistema rechaza la eliminación e informa que el curso está en uso

### Requirement: Listar cursos bíblicos

El sistema SHALL permitir listar todos los cursos bíblicos disponibles.

#### Scenario: Listar cursos
- **WHEN** un usuario autenticado solicita el listado de cursos bíblicos
- **THEN** el sistema devuelve todos los cursos con su nombre, número de lecciones y audiencia
