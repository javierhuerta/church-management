## ADDED Requirements

### Requirement: Atomicidad en escrituras multi-entidad

El sistema SHALL ejecutar dentro de una única transacción de base de datos toda operación que cree o modifique múltiples entidades relacionadas, de modo que un fallo parcial no deje datos inconsistentes.

#### Scenario: Creación de programa con grupos y secciones
- **WHEN** se crea un programa de culto junto con sus grupos y secciones
- **THEN** todas las entidades se persisten en una sola transacción y, si cualquier paso falla, no se persiste ninguna

#### Scenario: Creación/actualización de evento con organizadores y adjuntos
- **WHEN** se guarda un evento de calendario junto con sus organizadores
- **THEN** el evento y sus organizadores se persisten atómicamente y un fallo revierte todos los cambios

#### Scenario: Fallo a mitad de la operación
- **WHEN** ocurre un error después de haber guardado parte de las entidades relacionadas
- **THEN** la transacción se revierte por completo y la base de datos queda en su estado previo
