# Program Publish to Calendar

## Purpose

Permite crear automáticamente un evento en el calendario al publicar un programa de culto. El evento se genera con la información base del programa (fecha, nombre del template, horario del primer grupo) y queda en estado DRAFT para que el usuario lo complete antes de publicarlo en el calendario público.

## Requirements

### Requirement: Publicar programa con evento de calendario

El sistema SHALL ofrecer la opción de crear un evento en el calendario al publicar un programa. Esta opción es opcional y controlada por el usuario mediante un checkbox en el dialog de confirmación de publicación.

#### Scenario: Publicar con creación de evento

- **WHEN** usuario con permiso de publicación activa el checkbox "Crear evento en el calendario" y confirma la publicación
- **THEN** el programa cambia a estado PUBLISHED
- **AND** se crea un evento en el módulo de calendario con:
  - `title`: nombre del template del programa
  - `startDate`: fecha del programa + hora de inicio del primer grupo (o 00:00 si no hay grupos con hora)
  - `endDate`: fecha del programa + hora de fin del primer grupo (o `startDate` + 1h si no está definida)
  - `status`: DRAFT
  - `creatorId`: usuario que publicó
- **AND** se registra en el audit log del programa: action = "creó evento de calendario"
- **AND** el sistema retorna el slug del evento creado para navegar directamente

#### Scenario: Publicar sin creación de evento

- **WHEN** usuario publica el programa sin activar el checkbox de crear evento
- **THEN** el programa cambia a estado PUBLISHED
- **AND** no se crea ningún evento en el calendario
- **AND** el comportamiento es idéntico al endpoint de publicación original

#### Scenario: Fallo en la creación del evento

- **WHEN** la creación del evento falla por un error interno
- **THEN** la publicación del programa es revertida (rollback)
- **AND** el programa permanece en estado DRAFT
- **AND** el sistema retorna un error 500 con mensaje descriptivo

### Requirement: Endpoint publish-with-event

El sistema SHALL exponer un endpoint `POST /worship-services/programs/:id/publish-with-event` que acepta un body con `createCalendarEvent: boolean`.

#### Scenario: Request con createCalendarEvent true

- **WHEN** se hace POST a `/worship-services/programs/:id/publish-with-event` con `{ "createCalendarEvent": true }`
- **THEN** el sistema ejecuta la publicación y la creación de evento en una sola transacción
- **AND** retorna `{ program: ServiceProgramResponseDto, event: EventResponseDto | null }`

#### Scenario: Request con createCalendarEvent false

- **WHEN** se hace POST a `/worship-services/programs/:id/publish-with-event` con `{ "createCalendarEvent": false }`
- **THEN** el sistema ejecuta solo la publicación
- **AND** retorna `{ program: ServiceProgramResponseDto, event: null }`

#### Scenario: Programa ya publicado

- **WHEN** se intenta publicar un programa que ya está en estado PUBLISHED
- **THEN** el sistema retorna 409 Conflict

### Requirement: Feedback visual al usuario

El sistema SHALL mostrar feedback claro tras la publicación con evento.

#### Scenario: Toast con link al evento

- **WHEN** la publicación con evento es exitosa
- **THEN** se muestra un toast con el mensaje "Programa publicado" y un link "Ver evento →" que navega a `/calendario/:slug/editar`

#### Scenario: Toast sin link (publicación sin evento)

- **WHEN** la publicación sin evento es exitosa
- **THEN** se muestra el toast estándar "Programa publicado" sin link adicional
