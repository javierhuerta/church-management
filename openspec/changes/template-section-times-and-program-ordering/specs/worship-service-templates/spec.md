## ADDED Requirements

### Requirement: Secciones de plantilla con tiempo de inicio y duración
Las secciones de plantilla SHALL soportar los campos opcionales `startTime` (formato HH:MM) y `duration` (entero positivo, en minutos). Ambos campos son opcionales y pueden omitirse al crear o actualizar una sección.

#### Scenario: Crear sección de plantilla con startTime y duration
- **WHEN** el usuario crea una sección de plantilla e incluye `startTime` y `duration`
- **THEN** el sistema persiste ambos valores y los devuelve en la respuesta

#### Scenario: Crear sección de plantilla sin tiempos
- **WHEN** el usuario crea una sección de plantilla sin `startTime` ni `duration`
- **THEN** el sistema persiste la sección con ambos campos como `null`

#### Scenario: Actualizar tiempos de una sección de plantilla existente
- **WHEN** el usuario actualiza una sección de plantilla con nuevos valores de `startTime` o `duration`
- **THEN** el sistema actualiza solo los campos enviados, manteniendo los demás sin cambio

#### Scenario: Edición de tiempos en el formulario de plantilla
- **WHEN** el usuario abre el formulario de creación o edición de una sección de plantilla
- **THEN** dispone de un campo de hora (startTime) y un campo numérico (duration en minutos)
