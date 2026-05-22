## MODIFIED Requirements

### Requirement: Events can be listed and filtered

The system SHALL provide a list endpoint that returns events with optional filters by date range, event type, and department. Results are paginated. In the mobile view, the frontend SHALL support incremental loading by month using infinite scroll; in the desktop view, loading remains month-scoped with manual navigation controls.

#### Scenario: List all events
- **WHEN** user requests list of events without filters
- **THEN** system returns paginated list of all events ordered by start date

#### Scenario: Filter by date range
- **WHEN** user provides startDate and endDate filters
- **THEN** system returns only events that overlap with the given date range

#### Scenario: Filter by event type
- **WHEN** user selects a specific event type
- **THEN** system returns only events matching the given type

#### Scenario: Filter by department
- **WHEN** user selects a specific department
- **THEN** system returns only events belonging to that department

#### Scenario: Mobile view loads next month on scroll
- **WHEN** user scrolls to the bottom of the event list on a mobile viewport
- **THEN** frontend fetches events for the next month and appends them to the existing list

#### Scenario: Changing filter resets mobile list to current month
- **WHEN** user changes a filter while multiple months are loaded in mobile view
- **THEN** the list resets to the current month and reloads with the new filter applied
