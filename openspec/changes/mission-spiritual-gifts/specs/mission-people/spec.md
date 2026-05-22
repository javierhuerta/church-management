## MODIFIED Requirements

### Requirement: Eliminar una persona

El sistema SHALL permitir a usuarios con control total del módulo misionero eliminar una Persona registrada.

El sistema SHALL impedir la eliminación de una Persona que esté referenciada por otra entidad del módulo misionero, incluyendo:
- ser estudiante o instructora de un estudio bíblico;
- ser integrante de una pareja misionera;
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

#### Scenario: Eliminar persona que integra o promueve un grupo pequeño
- **WHEN** un usuario intenta eliminar una Persona que es integrante o promotora de un grupo pequeño
- **THEN** el sistema rechaza la eliminación e informa que la Persona está asociada a un grupo pequeño

#### Scenario: Eliminar persona con visitas o registro de rescate
- **WHEN** un usuario intenta eliminar una Persona que tiene visitas registradas o un registro de miembro a rescatar
- **THEN** el sistema rechaza la eliminación e informa que la Persona tiene historial de seguimiento

#### Scenario: Eliminar persona que es cartero o tiene asistencia a capacitaciones
- **WHEN** un usuario intenta eliminar una Persona que es cartero misionero o tiene asistencia registrada a una capacitación
- **THEN** el sistema rechaza la eliminación e informa que la Persona participa en el programa de carteros o capacitaciones

#### Scenario: Eliminar persona con evaluación de dones
- **WHEN** un usuario intenta eliminar una Persona que tiene una evaluación de descubrimiento de dones
- **THEN** el sistema rechaza la eliminación e informa que la Persona tiene una evaluación de dones registrada

### Requirement: Ver el detalle de una persona

El sistema SHALL permitir ver el detalle de una Persona individual con todos sus datos básicos.

El detalle de una Persona SHALL incluir:
- el listado de los estudios bíblicos en los que figura como estudiante;
- el historial de visitas registradas de la Persona;
- la evaluación de descubrimiento de dones de la Persona, si existe.

#### Scenario: Obtener persona por identificador
- **WHEN** un usuario autenticado solicita una Persona por su identificador
- **THEN** el sistema devuelve los datos de la Persona

#### Scenario: Ver estudios bíblicos en el detalle de la persona
- **WHEN** un usuario abre el detalle de una Persona que tiene estudios bíblicos
- **THEN** el sistema muestra los estudios de esa Persona con su curso, estado y progreso

#### Scenario: Ver historial de visitas en el detalle de la persona
- **WHEN** un usuario abre el detalle de una Persona que tiene visitas registradas
- **THEN** el sistema muestra el historial de visitas de esa Persona ordenado por fecha

#### Scenario: Ver evaluación de dones en el detalle de la persona
- **WHEN** un usuario abre el detalle de una Persona que tiene una evaluación de dones
- **THEN** el sistema muestra las áreas afines, el top 3 y la etapa de integración de la Persona

#### Scenario: Persona inexistente
- **WHEN** un usuario solicita una Persona con un identificador que no existe
- **THEN** el sistema devuelve un error de recurso no encontrado
