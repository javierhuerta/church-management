## MODIFIED Requirements

### Requirement: Eliminar una persona

El sistema SHALL permitir a usuarios con control total del módulo misionero eliminar una Persona registrada.

El sistema SHALL impedir la eliminación de una Persona que esté referenciada por otra entidad del módulo misionero, incluyendo:
- ser estudiante o instructora de un estudio bíblico;
- ser integrante de una pareja misionera;
- ser integrante o promotora de un grupo pequeño.

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
