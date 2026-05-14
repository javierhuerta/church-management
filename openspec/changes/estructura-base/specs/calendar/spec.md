# Calendar — Church Calendar and Events

## ADDED Requirements

### Requirement: Events can be created with basic information

The system SHALL allow authenticated users to create calendar events with a title, description, start datetime, end datetime, and event type.

#### Scenario: Create event with all required fields
- **WHEN** user provides title, description, start datetime, end datetime, and event type
- **THEN** event is created and assigned a unique ID

#### Scenario: Create event with only required fields
- **WHEN** user provides only title, start datetime, end datetime, and event type
- **THEN** event is created with null description

### Requirement: Events can be updated

The system SHALL allow users to modify existing event information. Only the event creator or users with the Secretary role SHALL be able to update events.

#### Scenario: Update event title
- **WHEN** authorized user updates an event's title
- **THEN** event's title is changed and updated_at timestamp is set

#### Scenario: Update event with invalid data
- **WHEN** user provides invalid data (e.g., end datetime before start datetime)
- **THEN** system returns 400 Bad Request with validation errors

### Requirement: Events can be deleted

The system SHALL allow users to delete events. Only the event creator or users with the Secretary or Pastor role SHALL be able to delete events.

#### Scenario: Delete event
- **WHEN** authorized user deletes an event
- **THEN** event is removed from the system

#### Scenario: Unauthorized delete attempt
- **WHEN** user without proper role attempts to delete an event
- **THEN** system returns 403 Forbidden

### Requirement: Events can be listed and filtered

The system SHALL provide a list endpoint that returns all events with optional filters by date range and event type.

#### Scenario: List all events
- **WHEN** user requests list of events without filters
- **THEN** system returns all events ordered by start datetime

#### Scenario: Filter events by date range
- **WHEN** user provides start_date and end_date filters
- **THEN** system returns only events within the specified range

#### Scenario: Filter events by type
- **WHEN** user provides event_type filter
- **THEN** system returns only events of that type

### Requirement: Event types are predefined

The system SHALL support the following event types: CultoSabatico, EscuelaSabatica, CultoVespertino, SemanaOracion, EventoMisional, JuntaAdministracion, Otro.

#### Scenario: Create event with valid type
- **WHEN** user creates an event with type "CultoSabatico"
- **THEN** event is created successfully

#### Scenario: Create event with invalid type
- **WHEN** user creates an event with type "InvalidType"
- **THEN** system returns 400 Bad Request with validation error