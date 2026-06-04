## MODIFIED Requirements

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

#### Scenario: Eliminar persona que es miembro activo de un equipo misionero
- **WHEN** un usuario intenta eliminar una Persona que es miembro activo de un equipo misionero
- **THEN** el sistema rechaza la eliminación e informa que la Persona es miembro de un equipo misionero

#### Scenario: Eliminar persona que integra una pareja misionera
- **WHEN** un usuario intenta eliminar una Persona que es integrante de una pareja misionera
- **THEN** el sistema rechaza la eliminación e informa que la Persona integra una pareja misionera