## ADDED Requirements

### Requirement: Event status management

The system SHALL allow events to have one of three statuses: draft, published, or archived. Only published events are visible to anonymous users and regular users.

#### Scenario: Event is created in draft status
- **WHEN** user with editor role creates a new event
- **THEN** event is saved with status=draft and is not visible to anonymous users

#### Scenario: Editor changes event status to published
- **WHEN** editor clicks "Publicar" on a draft event
- **THEN** event status changes to published and becomes visible to all users

#### Scenario: Editor archives an event
- **WHEN** editor clicks "Archivar" on an event
- **THEN** event status changes to archived and is no longer visible in calendar views

#### Scenario: Anonymous user views calendar
- **WHEN** user without authentication accesses /calendario
- **THEN** only events with status=published are returned

#### Scenario: Regular logged-in user views calendar
- **WHEN** user with non-editor role (Anciano, Coordinador, etc.) accesses /calendario
- **THEN** only events with status=published are returned

#### Scenario: Editor views calendar
- **WHEN** user with editor role (Pastor, Secretaria, Admin) accesses /calendario
- **THEN** all events (draft + published + archived) are returned, with draft events marked with "Borrador" badge

### Requirement: Event types and department association

The system SHALL support event classification by type (local, ASACH, district) and optional department association.

#### Scenario: Event has event type
- **WHEN** event is created or edited
- **THEN** editor can select event type from: local, asach, distrital

#### Scenario: Event has department association
- **WHEN** event is created or edited
- **THEN** editor can optionally select a department (Youth, Family, Mission, etc.)
- **AND** department selection is not required

#### Scenario: Calendar is filtered by event type
- **WHEN** user selects an event type filter on calendar page
- **THEN** only events matching that type are displayed

#### Scenario: Calendar is filtered by department
- **WHEN** user selects a department filter on calendar page
- **THEN** only events belonging to that department are displayed

#### Scenario: Calendar shows event type indicator
- **WHEN** event is displayed in calendar grid or list
- **THEN** visual indicator shows event type (color-coded dot or badge)

### Requirement: Meeting URL support

The system SHALL store and display meeting URLs for virtual events.

#### Scenario: Event has meeting URL
- **WHEN** editor creates or edits an event
- **THEN** editor can enter a meeting URL (Zoom, Google Meet, Teams, etc.)
- **AND** URL is validated to be a valid format (https://...)

#### Scenario: Meeting URL is displayed
- **WHEN** event detail page is shown
- **THEN** meeting URL is displayed as a clickable button "Unirse a reunión"
- **AND** an icon indicates meeting type (video camera)

#### Scenario: Calendar shows meeting indicator
- **WHEN** event has a meeting URL
- **THEN** calendar display shows a small video icon indicating virtual meeting

### Requirement: Event creation and editing

The system SHALL allow editors to create and edit events with all required fields.

#### Scenario: Editor creates new event
- **WHEN** editor clicks "Crear evento" on calendar page
- **THEN** a form is displayed with fields: title, description (WYSIWYG), start date/time, end date/time, event type, department (optional), location (optional), meeting URL (optional)

#### Scenario: Editor saves new event
- **WHEN** editor fills form and clicks "Guardar"
- **THEN** event is created with status=draft
- **AND** user is redirected to event detail page

#### Scenario: Editor edits existing event
- **WHEN** editor clicks "Editar" on an event
- **THEN** form is displayed pre-filled with event data

#### Scenario: Editor updates event
- **WHEN** editor modifies fields and clicks "Guardar"
- **THEN** event is updated with new data
- **AND** slug remains unchanged (preserves shareable URL)

### Requirement: Event deletion

The system SHALL allow editors to permanently delete events.

#### Scenario: Editor deletes event
- **WHEN** editor clicks "Eliminar" on an event
- **THEN** confirmation dialog is shown

#### Scenario: Editor confirms deletion
- **WHEN** editor confirms deletion in dialog
- **THEN** event and all associated attachments are permanently deleted
- **AND** user is redirected to calendar page