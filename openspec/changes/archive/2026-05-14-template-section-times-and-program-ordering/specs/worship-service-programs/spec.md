## ADDED Requirements

### Requirement: Propagación de tiempos desde plantilla al crear programa
Al crear un programa desde una plantilla, el sistema SHALL copiar los campos `startTime` y `duration` de cada sección de plantilla a la sección de programa correspondiente.

#### Scenario: Propagación de startTime y duration al crear programa
- **WHEN** el usuario crea un programa a partir de una plantilla que tiene secciones con `startTime` y `duration`
- **THEN** las secciones del programa heredan los valores de `startTime` y `duration` de la plantilla, sin necesidad de editarlas manualmente

#### Scenario: Secciones de plantilla sin tiempos no generan error
- **WHEN** el usuario crea un programa a partir de una plantilla cuyas secciones no tienen `startTime` ni `duration`
- **THEN** las secciones del programa se crean con ambos campos como `null`

### Requirement: Endpoints de reordenamiento de grupos y secciones
El sistema SHALL exponer dos endpoints para reordenar los ítems de un programa: uno para grupos y otro para secciones. Ambos reciben un array ordenado de IDs y actualizan el campo `order` de cada entidad.

#### Scenario: Reordenar grupos de un programa
- **WHEN** se llama `PATCH /worship-services/programs/:id/groups/reorder` con `{ orderedIds: string[] }`
- **THEN** el sistema actualiza el campo `order` de cada grupo según su posición en el array y devuelve 200

#### Scenario: Reordenar secciones de un programa
- **WHEN** se llama `PATCH /worship-services/programs/:id/sections/reorder` con `{ orderedIds: string[] }`
- **THEN** el sistema actualiza el campo `order` de cada sección según su posición en el array y devuelve 200

#### Scenario: IDs inválidos en reordenamiento son ignorados
- **WHEN** el array de IDs contiene algún ID que no pertenece al programa
- **THEN** el sistema ignora ese ID y solo actualiza los que sí pertenecen al programa
