## ADDED Requirements

### Requirement: Calendar viewing permissions

The system SHALL allow all users (anonymous, regular, and editors) to view published events in the calendar.

#### Scenario: Anonymous user views calendar
- **WHEN** user without authentication accesses /calendario
- **THEN** only published events are shown
- **AND** no create/edit/delete buttons are visible

#### Scenario: Regular user views calendar
- **WHEN** user with non-editor role (Anciano, Coordinador, Director, Maestro) accesses /calendario
- **THEN** only published events are shown
- **AND** no create/edit/delete buttons are visible

#### Scenario: Editor views calendar
- **WHEN** user with editor role (Pastor, Secretaria de Iglesia, Admin) accesses /calendario
- **THEN** all events (draft, published, archived) are shown
- **AND** draft events have a "Borrador" badge
- **AND** create/edit/delete buttons are visible

### Requirement: Calendar editing permissions

The system SHALL restrict event creation, editing, and deletion to editor roles only.

#### Scenario: Editor creates new event
- **WHEN** user with editor role clicks "Crear evento" on calendar page
- **THEN** event creation form is displayed

#### Scenario: Regular user cannot create event
- **WHEN** user with non-editor role clicks "Crear evento"
- **THEN** button is not visible (UI hides it based on role)
- **AND** if they somehow make the request, API returns 403 Forbidden

#### Scenario: Editor edits event
- **WHEN** user with editor role clicks "Editar" on an event
- **THEN** event edit form is displayed pre-filled with event data

#### Scenario: Regular user cannot edit event
- **WHEN** user with non-editor role clicks "Editar"
- **THEN** button is not visible
- **AND** if they somehow make the request, API returns 403 Forbidden

#### Scenario: Editor deletes event
- **WHEN** user with editor role clicks "Eliminar" on an event
- **THEN** confirmation dialog is shown before deletion

#### Scenario: Regular user cannot delete event
- **WHEN** user with non-editor role clicks "Eliminar"
- **THEN** button is not visible
- **AND** if they somehow make the request, API returns 403 Forbidden

### Requirement: Event status change permissions

The system SHALL allow only editors to change event status (draft → published → archived).

#### Scenario: Editor publishes event
- **WHEN** user with editor role clicks "Publicar" on a draft event
- **THEN** event status changes to published
- **AND** event becomes visible to all users

#### Scenario: Editor archives event
- **WHEN** user with editor role clicks "Archivar" on an event
- **THEN** event status changes to archived
- **AND** event is hidden from all calendar views (but URL still works for direct access)

#### Scenario: Regular user cannot change status
- **WHEN** user with non-editor role attempts to change event status
- **THEN** UI does not show status change options
- **AND** if they somehow make the request, API returns 403 Forbidden

### Requirement: Attachment management permissions

The system SHALL allow only editors to add or remove attachments from events.

#### Scenario: Editor uploads attachment
- **WHEN** user with editor role is on event edit page
- **THEN** "Agregar adjunto" button is visible
- **AND** file upload functionality works

#### Scenario: Regular user cannot upload attachment
- **WHEN** user with non-editor role is viewing event detail
- **THEN** "Agregar adjunto" button is not visible
- **AND** if they somehow make the request, API returns 403 Forbidden

#### Scenario: Editor deletes attachment
- **WHEN** user with editor role clicks delete on an attachment
- **THEN** confirmation and deletion work

#### Scenario: Regular user cannot delete attachment
- **WHEN** user with non-editor role attempts to delete attachment
- **THEN** delete option is not visible
- **AND** if they somehow make the request, API returns 403 Forbidden