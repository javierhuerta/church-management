## ADDED Requirements

### Requirement: Registrar una persona en el módulo misionero

El sistema SHALL permitir a usuarios con control total del módulo misionero registrar Personas con datos básicos. Una Persona representa a cualquier individuo gestionado por el módulo misionero (interesado, estudiante, miembro, contacto) y no requiere acceso al sistema.

El único campo obligatorio es el nombre. El sistema SHALL aceptar como opcionales apellido, teléfono, domicilio, fecha de nacimiento, condición de miembro bautizado y notas.

#### Scenario: Crear persona solo con nombre
- **WHEN** un coordinador misionero crea una Persona indicando únicamente el nombre
- **THEN** el sistema registra la Persona y devuelve sus datos

#### Scenario: Crear persona con todos los datos
- **WHEN** un coordinador misionero crea una Persona con nombre, apellido, teléfono, domicilio, fecha de nacimiento y notas
- **THEN** el sistema registra la Persona con todos los datos provistos

#### Scenario: Crear persona sin nombre
- **WHEN** un usuario intenta crear una Persona sin indicar nombre
- **THEN** el sistema rechaza la solicitud con un error de validación

### Requirement: Distinguir miembros bautizados de no miembros

El sistema SHALL permitir marcar una Persona como miembro bautizado mediante un indicador booleano. Por defecto una Persona NO es miembro bautizado.

Este indicador refleja la transición de un interesado a miembro bautizado de la iglesia, sin perder el registro de la Persona ni duplicarlo.

#### Scenario: Persona nueva no es miembro por defecto
- **WHEN** se crea una Persona sin especificar la condición de miembro
- **THEN** el sistema la registra como no miembro bautizado

#### Scenario: Marcar persona como miembro bautizado
- **WHEN** un coordinador misionero marca a una Persona como miembro bautizado
- **THEN** el sistema actualiza el indicador y la Persona aparece como miembro bautizado en listados y detalle

### Requirement: Editar una persona

El sistema SHALL permitir a usuarios con control total del módulo misionero editar cualquier dato de una Persona registrada.

#### Scenario: Actualizar datos de contacto
- **WHEN** un coordinador misionero modifica el teléfono o domicilio de una Persona
- **THEN** el sistema guarda los cambios y devuelve los datos actualizados

### Requirement: Eliminar una persona

El sistema SHALL permitir a usuarios con control total del módulo misionero eliminar una Persona registrada.

El sistema SHALL impedir la eliminación de una Persona que esté referenciada por otra entidad del módulo misionero, incluyendo:
- ser estudiante o instructora de un estudio bíblico;
- ser integrante de una pareja misionera;
- ser miembro activo de un equipo misionero;
- ser integrante o promotora de un grupo pequeño;
- tener visitas registradas o un registro de miembro a rescatar;
- ser cartero misionero o tener asistencia registrada a una capacitación;
- tener una evaluación de descubrimiento de dones.

#### Scenario: Eliminar persona sin referencias
- **WHEN** un coordinador misionero elimina una Persona que no está referenciada por ninguna otra entidad
- **THEN** el sistema elimina la Persona

#### Scenario: Eliminar persona que es estudiante de un estudio bíblico
- **WHEN** un usuario intenta eliminar una Persona que figura como estudiante en uno o más estudios bíblicos
- **THEN** el sistema rechaza la eliminación e informa que la Persona tiene estudios asociados

#### Scenario: Eliminar persona que es instructora de un estudio bíblico
- **WHEN** un usuario intenta eliminar una Persona que figura como instructora en uno o más estudios bíblicos
- **THEN** el sistema rechaza la eliminación e informa que la Persona es instructora de estudios activos

#### Scenario: Eliminar persona que integra una pareja misionera
- **WHEN** un usuario intenta eliminar una Persona que es integrante de una pareja misionera
- **THEN** el sistema rechaza la eliminación e informa que la Persona integra una pareja misionera

#### Scenario: Eliminar persona que es miembro activo de un equipo misionero
- **WHEN** un usuario intenta eliminar una Persona que es miembro activo de un equipo misionero
- **THEN** el sistema rechaza la eliminación e informa que la Persona es miembro de un equipo misionero

#### Scenario: Eliminar persona que integra o promueve un grupo pequeño
- **WHEN** un usuario intenta eliminar una Persona que es integrante o promotora de un grupo pequeño
- **THEN** el sistema rechaza la eliminación e informa que la Persona está asociada a un grupo pequeño

#### Scenario: Eliminar persona con visitas o registro de rescate
- **WHEN** un usuario intenta eliminar una Persona que tiene visitas registradas o un registro de miembro a rescatar
- **THEN** el sistema rechaza la eliminación e informa que la Persona tiene historial de seguimiento

### Requirement: Listar y buscar personas

El sistema SHALL permitir listar las Personas registradas, con búsqueda por nombre o apellido (coincidencia parcial, insensible a mayúsculas) y paginación.

El listado SHALL ser accesible a cualquier usuario autenticado del sistema; las acciones de creación, edición y eliminación SHALL estar restringidas a usuarios con control total del módulo.

#### Scenario: Listar personas
- **WHEN** un usuario autenticado solicita el listado de Personas
- **THEN** el sistema devuelve las Personas registradas de forma paginada

#### Scenario: Buscar persona por nombre
- **WHEN** un usuario busca Personas indicando un texto parcial del nombre o apellido
- **THEN** el sistema devuelve únicamente las Personas cuyo nombre o apellido contiene ese texto

#### Scenario: Buscar para selector de autocompletar
- **WHEN** otra capacidad del módulo necesita seleccionar una Persona y consulta el listado con un texto de búsqueda
- **THEN** el sistema devuelve coincidencias suficientes para alimentar un selector de autocompletar

### Requirement: Ver el detalle de una persona

El sistema SHALL permitir ver el detalle de una Persona individual con todos sus datos básicos.

El detalle de una Persona SHALL incluir:
- el listado de los estudios bíblicos en los que figura como estudiante;
- el historial de visitas registradas de la Persona.

#### Scenario: Obtener persona por identificador
- **WHEN** un usuario autenticado solicita una Persona por su identificador
- **THEN** el sistema devuelve los datos de la Persona

#### Scenario: Ver estudios bíblicos en el detalle de la persona
- **WHEN** un usuario abre el detalle de una Persona que tiene estudios bíblicos
- **THEN** el sistema muestra los estudios de esa Persona con su curso, estado y progreso

#### Scenario: Ver historial de visitas en el detalle de la persona
- **WHEN** un usuario abre el detalle de una Persona que tiene visitas registradas
- **THEN** el sistema muestra el historial de visitas de esa Persona ordenado por fecha

#### Scenario: Persona inexistente
- **WHEN** un usuario solicita una Persona con un identificador que no existe
- **THEN** el sistema devuelve un error de recurso no encontrado
