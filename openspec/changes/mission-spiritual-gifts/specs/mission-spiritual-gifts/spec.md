## ADDED Requirements

### Requirement: Catálogo de áreas de actividad

El sistema SHALL mantener un catálogo de áreas de actividad del ministerio, cada una con un código identificador, una descripción y un orden de presentación.

El sistema SHALL incluir como datos semilla las catorce áreas de actividad del instrumento de descubrimiento de dones: escuchar y orar, visitar, recepción, logística, enseñar, música, audio/proyección, invitar y hacer seguimiento, niños, adolescentes/jóvenes, vida sana, familias, necesidades especiales y servir en el templo.

#### Scenario: Catálogo de áreas disponible
- **WHEN** se inicializa el módulo misionero con sus datos semilla
- **THEN** el sistema incluye las catorce áreas de actividad disponibles para las evaluaciones de dones

#### Scenario: Listar áreas de actividad
- **WHEN** un usuario autenticado solicita el catálogo de áreas de actividad
- **THEN** el sistema devuelve las áreas con su código, descripción y orden

### Requirement: Registrar una evaluación de dones

El sistema SHALL permitir a usuarios con control total del módulo misionero registrar la evaluación de descubrimiento de dones de una Persona.

Una evaluación de dones vincula una Persona con: las áreas de actividad con las que se siente afín, hasta tres áreas principales (top 3), uno o más modos preferidos de iniciar el servicio, una etapa de seguimiento, opcionalmente un responsable de inicio, una fecha de evaluación y notas.

Una Persona SHALL tener a lo sumo una evaluación de dones vigente.

#### Scenario: Crear evaluación de dones
- **WHEN** un coordinador misionero registra la evaluación de dones de una Persona con sus áreas afines y su top 3
- **THEN** el sistema registra la evaluación de dones

#### Scenario: Persona ya tiene evaluación
- **WHEN** un usuario intenta crear una evaluación de dones para una Persona que ya tiene una evaluación
- **THEN** el sistema rechaza la solicitud e informa que la Persona ya tiene una evaluación de dones

#### Scenario: Re-evaluar una persona
- **WHEN** un coordinador misionero actualiza la evaluación de dones existente de una Persona
- **THEN** el sistema reemplaza el resultado anterior con la nueva evaluación

### Requirement: Áreas afines y áreas principales

El sistema SHALL permitir indicar las áreas de actividad afines de una Persona y, entre ellas, hasta tres áreas principales (top 3).

Las áreas principales SHALL ser un subconjunto de las áreas afines y NO SHALL exceder de tres.

#### Scenario: Registrar áreas afines y top 3
- **WHEN** un coordinador misionero selecciona varias áreas afines y marca tres de ellas como principales
- **THEN** el sistema registra las áreas afines y las tres principales

#### Scenario: Más de tres áreas principales
- **WHEN** un usuario intenta marcar más de tres áreas como principales
- **THEN** el sistema rechaza la solicitud con un error de validación

#### Scenario: Área principal fuera de las afines
- **WHEN** un usuario intenta marcar como principal un área que no está entre las áreas afines
- **THEN** el sistema rechaza la solicitud con un error de validación

### Requirement: Modos de iniciar el servicio

El sistema SHALL registrar uno o más modos preferidos de una Persona para iniciar su servicio, elegidos entre: `Probar una vez`, `Integrarme un mes`, `Capacitación`, `Orientación` y `Sin respuesta`. La selección de modos es múltiple y puede quedar vacía.

#### Scenario: Registrar un solo modo de inicio
- **WHEN** un coordinador misionero indica que una Persona prefiere iniciar mediante capacitación
- **THEN** el sistema guarda el modo de inicio de la evaluación

#### Scenario: Registrar varios modos de inicio
- **WHEN** un coordinador misionero indica que una Persona prefiere iniciar mediante capacitación y también probando una vez
- **THEN** el sistema guarda ambos modos de inicio en la evaluación

#### Scenario: Evaluación sin modo de inicio
- **WHEN** un coordinador misionero registra una evaluación sin indicar ningún modo de inicio
- **THEN** el sistema registra la evaluación con la lista de modos de inicio vacía

### Requirement: Etapa de integración al servicio

El sistema SHALL hacer seguimiento de la integración de una Persona al servicio mediante una etapa: `Registrado`, `Contactado`, `En integración` o `Integrado`.

#### Scenario: Actualizar la etapa de integración
- **WHEN** un coordinador misionero cambia la etapa de una evaluación de `Registrado` a `Contactado`
- **THEN** el sistema actualiza la etapa de integración

### Requirement: Editar y eliminar evaluaciones de dones

El sistema SHALL permitir a usuarios con control total editar las áreas, los modos de inicio, la etapa, el responsable y las notas de una evaluación de dones, y eliminar la evaluación.

#### Scenario: Eliminar una evaluación de dones
- **WHEN** un coordinador misionero elimina la evaluación de dones de una Persona
- **THEN** el sistema elimina la evaluación sin eliminar la Persona

### Requirement: Listar y filtrar evaluaciones de dones

El sistema SHALL permitir listar las evaluaciones de dones con filtros por área de actividad afín y por etapa de integración.

El filtro por área de actividad permite identificar a las Personas con afinidad por un ministerio específico, por ejemplo para conformar equipos de servicio.

#### Scenario: Listar evaluaciones de dones
- **WHEN** un usuario con control total solicita el listado de evaluaciones de dones
- **THEN** el sistema devuelve las evaluaciones con su Persona, top 3, modos de inicio y etapa

#### Scenario: Filtrar personas por área de actividad afín
- **WHEN** un usuario filtra las evaluaciones por el área de actividad "visitar"
- **THEN** el sistema devuelve únicamente las evaluaciones de Personas que tienen esa área entre sus áreas afines

#### Scenario: Filtrar evaluaciones por etapa
- **WHEN** un usuario filtra las evaluaciones por la etapa `Registrado`
- **THEN** el sistema devuelve únicamente las evaluaciones en esa etapa
