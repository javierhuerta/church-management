# Calendar Monthly PDF

## Purpose

Provides PDF export functionality for the monthly calendar view. The PDF is generated entirely in the frontend (no backend endpoint), reuses the same visual conventions as the on-screen `CalendarGrid`, and respects the filters active in the calendar page (department, event type).

## Requirements

### Requirement: User can download calendar PDF with current month view

The system SHALL allow users to download a PDF of the calendar month view when clicking a "Download PDF" button on the calendar page.

#### Scenario: Download PDF button present
- **WHEN** user is on the calendar page
- **THEN** a "Download PDF" button is visible in the page header

#### Scenario: PDF contains grid view matching screen
- **WHEN** user clicks "Download PDF"
- **THEN** a PDF is generated with a grid showing all days of the current month

#### Scenario: PDF respects current filters
- **WHEN** user has applied filters (department, event type, include drafts)
- **THEN** the PDF shows only events matching those filters

### Requirement: PDF shows multi-day events as horizontal bands

The system SHALL display multi-day events as horizontal bands that span across the appropriate day columns.

#### Scenario: Multi-day event spans multiple columns
- **WHEN** an event runs from Tuesday to Thursday
- **THEN** the PDF shows a colored band spanning from Tuesday's column to Thursday's column

#### Scenario: Multi-day event starts in previous month
- **WHEN** an event starts in previous month and continues into current month
- **THEN** the band starts from the appropriate day column

### Requirement: PDF header includes church info and filter context

The system SHALL display church name, month/year, and active filters in the PDF header.

#### Scenario: Header displays church name
- **WHEN** PDF is generated
- **THEN** header shows "Iglesia Adventista del Séptimo Día Osorno Central"

#### Scenario: Header displays month and year
- **WHEN** PDF is generated
- **THEN** header shows the month name and year (e.g., "Mayo 2026")

#### Scenario: Header shows applied filters
- **WHEN** filters are active (department, event type, drafts)
- **THEN** header displays a summary line like "Filtros: Dept. Jóvenes | Incluir borradores"

### Requirement: PDF truncates overflow events with listing page

The system SHALL limit events shown per day to 2-3 and include a second page with complete event listing when needed.

#### Scenario: Day with many events truncates to 2-3
- **WHEN** a day has more than 3 events
- **THEN** only 2-3 events are shown with "+N más" indicator

#### Scenario: Second page lists all events
- **WHEN** events are truncated in the grid
- **THEN** a second page shows complete listing with date, time, title, department for all events

### Requirement: Draft events are visually marked in PDF

The system SHALL show draft events with a dashed border or different background in the PDF.

#### Scenario: Draft event shows dashed styling
- **WHEN** an event has status "draft"
- **THEN** it is displayed with dashed border styling in the grid
