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

Las capacidades posteriores que referencien Personas SHALL impedir la eliminación de una Persona que esté referenciada por otra entidad del módulo; cada capacidad define esa regla en su propio spec.

#### Scenario: Eliminar persona sin referencias
- **WHEN** un coordinador misionero elimina una Persona que no está referenciada por ninguna otra entidad
- **THEN** el sistema elimina la Persona

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

#### Scenario: Obtener persona por identificador
- **WHEN** un usuario autenticado solicita una Persona por su identificador
- **THEN** el sistema devuelve los datos de la Persona

#### Scenario: Persona inexistente
- **WHEN** un usuario solicita una Persona con un identificador que no existe
- **THEN** el sistema devuelve un error de recurso no encontrado
