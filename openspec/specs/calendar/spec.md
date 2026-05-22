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

The system SHALL allow editors to modify existing event information, including replacing the cover image directly from the event form.

#### Scenario: Update event title
- **WHEN** authorized editor updates an event's title
- **THEN** event's title is changed and updated_at timestamp is set
- **AND** shareSlug remains unchanged (preserves shareable URL)

#### Scenario: Update event with invalid data
- **WHEN** user provides invalid data (e.g., end datetime before start datetime)
- **THEN** system returns 400 Bad Request with validation errors

#### Scenario: Update event cover image
- **WHEN** authorized editor opens the edit form for an existing event and replaces the cover image
- **THEN** the new image is saved as the event cover and the previous cover attachment is removed

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

The system SHALL provide a list endpoint that returns events with optional filters by date range, event type, and department. Results are paginated. In the mobile view, the frontend SHALL support incremental loading by month using infinite scroll; in the desktop view, loading remains month-scoped with manual navigation controls.

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

#### Scenario: Mobile view loads next month on scroll
- **WHEN** user scrolls to the bottom of the event list on a mobile viewport
- **THEN** frontend fetches events for the next month and appends them to the existing list

#### Scenario: Changing filter resets mobile list to current month
- **WHEN** user changes a filter while multiple months are loaded in mobile view
- **THEN** the list resets to the current month and reloads with the new filter applied

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

### Requirement: Event form prevents selecting an end date before the start date

The event create/edit form SHALL prevent the editor from selecting an end date earlier than the current start date, in addition to the server-side validation that already returns 400.

#### Scenario: Editor moves start date past current end date
- **WHEN** editor changes the start date to a value later than the current end date
- **THEN** the form automatically advances the end date to match the new start date and shows a visible hint that the end date was adjusted

#### Scenario: Editor tries to pick an end before start
- **WHEN** editor opens the end-date picker
- **THEN** the picker disables (or visually blocks) any value earlier than the current start date

#### Scenario: Server-side validation still rejects invalid range
- **WHEN** the form is submitted with `endDate < startDate` (e.g., bypassing the UI)
- **THEN** the server responds with HTTP 400 and the form shows the error inline

### Requirement: Event detail shows the full date range when the event spans multiple days

The event detail page SHALL render the full start and end dates when the event spans more than one calendar day, and only the date plus time range when it falls on a single day.

#### Scenario: Single-day event
- **WHEN** an event starts and ends on the same calendar day
- **THEN** the detail page shows the date once followed by the time range, e.g., "viernes, 12 de junio de 2026 · 09:00 – 12:00"

#### Scenario: Multi-day event
- **WHEN** an event starts on one calendar day and ends on a different calendar day
- **THEN** the detail page shows both dates with their times, e.g., "vie 12 jun 09:00 – sáb 13 jun 18:00 · 2026"

#### Scenario: Same start and end datetime
- **WHEN** an event has `startDate == endDate`
- **THEN** the detail page shows only the date and start time, without a range separator

### Requirement: Organizers can be users or free-text names

The system SHALL allow each event to have organizers that are either registered users of the system or free-text names entered by the editor when the organizer is not a system user. Users SHALL be prioritized in selection.

#### Scenario: Editor adds an existing user as organizer
- **WHEN** editor searches by name or email and selects a user from the suggestions
- **THEN** the organizer is stored linked to that user (`userId` set, `displayName` null)

#### Scenario: Editor adds a free-text organizer when no user matches
- **WHEN** editor types a name that does not match any user and chooses "Agregar como texto"
- **THEN** the organizer is stored with `userId=null` and `displayName=<entered name>`

#### Scenario: User suggestions appear before the free-text option
- **WHEN** editor types a query that partially matches existing users
- **THEN** matching user suggestions are listed first; the "Agregar como texto" option appears at the end of the list

#### Scenario: Same user cannot be added twice
- **WHEN** editor tries to add a user that is already an organizer
- **THEN** the form prevents the duplicate and shows the existing organizer

#### Scenario: Free-text duplicates are allowed if names differ
- **WHEN** editor adds two free-text organizers with different display names
- **THEN** both are stored as separate organizer rows

#### Scenario: Detail page lists both kinds
- **WHEN** the event has user-organizers and text-organizers
- **THEN** both render as chips in the "Organizadores" section, with the same visual treatment but the user-chip can carry initials from the user's name and the text-chip from the typed name

#### Scenario: Editor removes an organizer
- **WHEN** editor clicks the remove icon on any organizer chip
- **THEN** that organizer is removed from the event on save

### Requirement: Department selector in the event form supports search

The event create/edit form SHALL replace the plain select for department with a searchable combobox that filters departments by typing.

#### Scenario: Editor opens the department combobox
- **WHEN** editor clicks the department field
- **THEN** a popover lists all departments with an input that filters them by name as the editor types

#### Scenario: Editor clears the department
- **WHEN** editor opens the combobox and selects "Sin departamento"
- **THEN** the event is saved with `departmentId=null`

#### Scenario: Editor selects a department by keyboard
- **WHEN** editor opens the combobox, types part of the department name, and presses Enter on a highlighted result
- **THEN** that department is selected and the popover closes

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
