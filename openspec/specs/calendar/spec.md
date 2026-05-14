# Calendar — Church Calendar and Events

## Purpose

Manage church calendar events including creation, updates, deletion, listing with support for various event types and filtering. Events follow a draft → published → archived lifecycle.

## Requirements

### Requirement: Events can be created with basic information

The system SHALL allow editors to create calendar events with a title, description (WYSIWYG), start datetime, end datetime, event type, and optional fields (location, department, meeting URL).

#### Scenario: Create event with all required fields
- **WHEN** user provides title, start datetime, end datetime, and event type
- **THEN** event is created with status=draft and assigned a unique ID

#### Scenario: Create event with only required fields
- **WHEN** user provides only title, start datetime, end datetime, and event type
- **THEN** event is created with null description and no optional fields

### Requirement: Events can be updated

The system SHALL allow editors to modify existing event information.

#### Scenario: Update event title
- **WHEN** authorized editor updates an event's title
- **THEN** event's title is changed and updated_at timestamp is set
- **AND** shareSlug remains unchanged (preserves shareable URL)

#### Scenario: Update event with invalid data
- **WHEN** user provides invalid data (e.g., end datetime before start datetime)
- **THEN** system returns 400 Bad Request with validation errors

### Requirement: Events can be deleted

The system SHALL allow editors to permanently delete events, including all associated files and attachments.

#### Scenario: Editor deletes event
- **WHEN** editor clicks "Eliminar" on an event
- **THEN** confirmation dialog is shown

#### Scenario: Editor confirms deletion
- **WHEN** editor confirms deletion in dialog
- **THEN** event and all associated attachments are permanently deleted
- **AND** user is redirected to calendar page

#### Scenario: Unauthorized delete attempt
- **WHEN** user without editor role attempts to delete an event
- **THEN** system returns 403 Forbidden

### Requirement: Events can be listed and filtered

The system SHALL provide a list endpoint that returns events with optional filters by date range, event type, and department. Results are paginated.

#### Scenario: List all events
- **WHEN** user requests list of events without filters
- **THEN** system returns events ordered by start datetime (ascending)

#### Scenario: Filter events by date range
- **WHEN** user provides startDate and endDate filters
- **THEN** system returns only events within the specified range

#### Scenario: Filter events by type
- **WHEN** user provides eventType filter
- **THEN** system returns only events of that type

#### Scenario: Filter events by department
- **WHEN** user provides department filter
- **THEN** system returns only events belonging to that department

### Requirement: Event types are predefined

The system SHALL support the following event types: local, asach, distrital.

#### Scenario: Create event with valid type
- **WHEN** user creates an event with type "local"
- **THEN** event is created successfully

#### Scenario: Create event with invalid type
- **WHEN** user creates an event with type "InvalidType"
- **THEN** system returns 400 Bad Request with validation error

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
