## ADDED Requirements

### Requirement: Registrar un equipo misionero

El sistema SHALL permitir a usuarios con control total del módulo misionero registrar equipos misioneros. Un equipo misionero es un grupo de 2 o más miembros que da estudios bíblicos y acompaña a interesados.

Cada equipo tiene una etiqueta opcional, un período obligatorio (año), una relación opcional con un grupo pequeño o una clase de escuela sabática (mutuamente excluyentes), un estado activo/inactivo y notas.

#### Scenario: Crear equipo con dos integrantes
- **WHEN** un coordinador misionero crea un equipo seleccionando dos Personas integrantes y un período
- **THEN** el sistema registra el equipo con ambos integrantes como miembros activos

#### Scenario: Crear equipo con tres o más integrantes
- **WHEN** un coordinador misionero crea un equipo seleccionando tres o más Personas integrantes
- **THEN** el sistema registra el equipo con todos los integrantes como miembros activos

#### Scenario: Crear equipo con menos de dos integrantes
- **WHEN** un usuario intenta crear un equipo con menos de dos integrantes
- **THEN** el sistema rechaza la solicitud con un error de validación indicando que se requieren al menos dos integrantes

#### Scenario: Crear equipo con grupo pequeño
- **WHEN** un coordinador misionero crea un equipo asignándolo a un grupo pequeño
- **THEN** el sistema registra el equipo con la relación al grupo pequeño y la audiencia se infiere del grupo

#### Scenario: Crear equipo con clase de escuela sabática directa
- **WHEN** un coordinador misionero crea un equipo sin grupo pequeño pero con una clase de escuela sabática
- **THEN** el sistema registra el equipo con la relación directa a la clase ES y la audiencia es el nombre de la clase

#### Scenario: Crear equipo sin grupo ni clase (audiencia Iglesia)
- **WHEN** un coordinador misionero crea un equipo sin grupo pequeño ni clase de escuela sabática
- **THEN** el sistema registra el equipo y la audiencia inferida es "Iglesia"

#### Scenario: Grupo pequeño y clase ES son mutuamente excluyentes
- **WHEN** un usuario intenta crear un equipo con grupo pequeño y clase de escuela sabática al mismo tiempo
- **THEN** el sistema rechaza la solicitud con un error de validación indicando que solo se puede asignar uno de los dos

### Requirement: Miembros del equipo misionero con histórico

El sistema SHALL permitir agregar y remover integrantes de un equipo misionero, registrando la fecha de integración y la fecha de salida para mantener un histórico.

Un miembro activo es aquel cuya fecha de salida (`leftAt`) es null. Un equipo SHALL tener al menos 2 miembros activos en todo momento.

#### Scenario: Agregar un integrante a un equipo existente
- **WHEN** un coordinador misionero agrega una Persona como integrante de un equipo existente
- **THEN** el sistema registra el nuevo miembro con `joinedAt` como la fecha actual y `leftAt` como null

#### Scenario: Remover un integrante de un equipo
- **WHEN** un coordinador misionero remueve un integrante de un equipo
- **THEN** el sistema setea `leftAt` del miembro a la fecha actual (no elimina el registro)
- **AND** el integrante deja de ser miembro activo

#### Scenario: Remover un integrante dejando menos de 2 activos
- **WHEN** un coordinador misionero remueve un integrante y el equipo quedaría con menos de 2 miembros activos
- **THEN** el sistema advierte que el equipo quedará inactivo o solicita confirmación

#### Scenario: Una Persona en dos equipos del mismo período
- **WHEN** un usuario intenta agregar una Persona que ya es miembro activo de otro equipo en el mismo período
- **THEN** el sistema rechaza la solicitud con un error de validación indicando que la Persona ya pertenece a un equipo en ese período

#### Scenario: Una Persona en equipos de períodos distintos
- **WHEN** una Persona es miembro de un equipo en el período 2025 y se agrega a un equipo en el período 2026
- **THEN** el sistema permite la operación, ya que son períodos distintos

### Requirement: Estado activo de un equipo misionero

El sistema SHALL permitir marcar un equipo misionero como activo o inactivo. Por defecto un equipo nuevo es activo.

#### Scenario: Desactivar un equipo
- **WHEN** un coordinador misionero marca un equipo como inactivo
- **THEN** el sistema actualiza el estado y el equipo deja de contarse entre los equipos activos del período

### Requirement: Editar un equipo misionero

El sistema SHALL permitir a usuarios con control total editar la etiqueta, el grupo pequeño, la clase de escuela sabática, el estado y las notas de un equipo misionero.

#### Scenario: Cambiar el grupo pequeño de un equipo
- **WHEN** un coordinador misionero cambia el grupo pequeño asignado a un equipo
- **THEN** el sistema actualiza la relación y la audiencia inferida cambia según el nuevo grupo

#### Scenario: Quitar el grupo pequeño y asignar una clase ES
- **WHEN** un coordinador misionero quita el grupo pequeño de un equipo y le asigna una clase de escuela sabática
- **THEN** el sistema actualiza las relaciones y la audiencia inferida cambia al nombre de la clase

### Requirement: Eliminar un equipo misionero

El sistema SHALL permitir a usuarios con control total eliminar un equipo misionero, siempre que no sea instructor de ningún estudio bíblico.

#### Scenario: Eliminar equipo sin estudios asociados
- **WHEN** un coordinador misionero elimina un equipo que no es instructor de ningún estudio
- **THEN** el sistema elimina el equipo y todos sus registros de miembros

#### Scenario: Eliminar equipo instructor de estudios
- **WHEN** un usuario intenta eliminar un equipo que es instructor de uno o más estudios bíblicos
- **THEN** el sistema rechaza la eliminación e informa que el equipo está asignado a estudios

### Requirement: Listar y filtrar equipos misioneros

El sistema SHALL permitir listar los equipos misioneros con filtros por período, grupo pequeño y clase de escuela sabática, y SHALL mostrar el total de equipos activos del período seleccionado.

El listado SHALL ser accesible a cualquier usuario autenticado; las acciones de creación, edición y eliminación SHALL estar restringidas a usuarios con control total.

#### Scenario: Listar equipos del período actual
- **WHEN** un usuario autenticado solicita el listado de equipos misioneros
- **THEN** el sistema devuelve los equipos del período actual con sus integrantes activos, la audiencia inferida y el total de equipos activos

#### Scenario: Filtrar equipos por período
- **WHEN** un usuario filtra los equipos por el período 2025
- **THEN** el sistema devuelve únicamente los equipos del período 2025

#### Scenario: Filtrar equipos por grupo pequeño
- **WHEN** un usuario filtra los equipos por un grupo pequeño específico
- **THEN** el sistema devuelve únicamente los equipos asignados a ese grupo pequeño

#### Scenario: Filtrar equipos por clase de escuela sabática
- **WHEN** un usuario filtra los equipos por una clase de escuela sabática
- **THEN** el sistema devuelve los equipos asignados directamente a esa clase y los equipos asignados a grupos pequeños de esa clase

#### Scenario: Identificar equipos incompletos
- **WHEN** un equipo tiene menos de 2 miembros activos
- **THEN** el sistema lo presenta como "incompleto" en el listado

### Requirement: Audiencia inferida del equipo misionero

El sistema SHALL inferir la audiencia de un equipo misionero a partir de sus relaciones, sin almacenarla directamente.

La audiencia se determina así:
1. Si el equipo tiene un grupo pequeño asignado → la audiencia es el `actionUnit` del grupo o el nombre de la clase de escuela sabática del grupo.
2. Si el equipo no tiene grupo pero tiene una clase de escuela sabática → la audiencia es el nombre de la clase.
3. Si el equipo no tiene grupo ni clase → la audiencia es "Iglesia".

#### Scenario: Audiencia inferida de un grupo pequeño
- **WHEN** un equipo está asignado al grupo pequeño "Clase 4 — Bereanos"
- **THEN** el sistema infiere la audiencia como "Clase 4 — Bereanos"

#### Scenario: Audiencia inferida de una clase ES directa
- **WHEN** un equipo no tiene grupo pequeño pero está asignado a la clase "M. adolescente"
- **THEN** el sistema infiere la audiencia como "M. adolescente"

#### Scenario: Audiencia por defecto
- **WHEN** un equipo no tiene grupo pequeño ni clase de escuela sabática
- **THEN** el sistema infiere la audiencia como "Iglesia"