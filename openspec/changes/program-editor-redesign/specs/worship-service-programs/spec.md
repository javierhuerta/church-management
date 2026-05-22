# worship-service-programs — Delta Spec

## MODIFIED Requirements

### Requirement: Program status transitions

A program can be in DRAFT or PUBLISHED status. When published, editing restrictions apply. Al publicar, el usuario puede opcionalmente crear un evento en el calendario (ver capability `program-publish-to-calendar`).

#### Scenario: Publish program

- **WHEN** user with permission publishes a program
- **THEN** program status changes to PUBLISHED
- **AND** publishedAt is set to current timestamp
- **AND** publishedById is set to current user

#### Scenario: Publish program with calendar event option

- **WHEN** user with permission publishes a program and opts to create a calendar event
- **THEN** the endpoint `POST /worship-services/programs/:id/publish-with-event` is called with `{ createCalendarEvent: true }`
- **AND** both publish and event creation complete atomically (see `program-publish-to-calendar` spec)

#### Scenario: Edit DRAFT program

- **WHEN** user with permission edits a DRAFT program
- **THEN** changes are saved successfully

#### Scenario: Edit PUBLISHED program as Admin

- **WHEN** Admin edits a PUBLISHED program
- **THEN** changes are saved successfully

#### Scenario: Edit PUBLISHED program as original creator (Pastor)

- **WHEN** Pastor who created the program edits it after publishing
- **THEN** changes are saved successfully

#### Scenario: Edit PUBLISHED program as Anciano (not creator)

- **WHEN** Anciano (not the creator) attempts to edit a PUBLISHED program
- **THEN** system returns 403 Forbidden
