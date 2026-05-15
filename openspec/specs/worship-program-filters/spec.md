# Worship Program Filters

## Purpose

Defines the filtering and sorting capabilities for the worship service program list, allowing users to narrow down programs by status, template, creator, and date range.

## Requirements

### Requirement: Filter program list by status

The system SHALL allow filtering the program list by one or more status values (DRAFT, PUBLISHED, ARCHIVED).

#### Scenario: Filter by DRAFT

- **WHEN** user selects status filter "Borrador"
- **THEN** only programs with status DRAFT are shown in the list

#### Scenario: Filter by PUBLISHED

- **WHEN** user selects status filter "Publicado"
- **THEN** only programs with status PUBLISHED are shown in the list

#### Scenario: Filter by ARCHIVED

- **WHEN** user selects status filter "Archivado"
- **THEN** only programs with status ARCHIVED are shown in the list

#### Scenario: No status filter selected

- **WHEN** no status filter is applied
- **THEN** all programs (DRAFT, PUBLISHED, ARCHIVED) are shown

### Requirement: Filter program list by template

The system SHALL allow filtering the program list by the template used to create the program.

#### Scenario: Filter by template

- **WHEN** user selects a specific template from the filter dropdown
- **THEN** only programs created from that template are shown

#### Scenario: No template filter

- **WHEN** no template filter is applied
- **THEN** programs of all templates are shown

### Requirement: Filter program list by creator

The system SHALL allow filtering the program list by the user who created the program.

#### Scenario: Filter by creator

- **WHEN** user selects a specific creator from the filter dropdown
- **THEN** only programs created by that user are shown

#### Scenario: No creator filter

- **WHEN** no creator filter is applied
- **THEN** programs from all creators are shown

### Requirement: Filter program list by date range

The system SHALL allow filtering the program list by a date range applied to the event date (`date` field), using a single `DateRangePicker` control (one popover for start and end) instead of two separate date inputs. The underlying filter contract SHALL remain unchanged: a `from` (desde) and `to` (hasta) date, each as a `YYYY-MM-DD` string, either of which may be empty.

#### Scenario: Filter by date from

- **WHEN** user selects a range start ("desde") of 2026-05-01 and no end
- **THEN** only programs with event date >= 2026-05-01 are shown

#### Scenario: Filter by date to

- **WHEN** user selects a range end ("hasta") of 2026-05-31 and no start
- **THEN** only programs with event date <= 2026-05-31 are shown

#### Scenario: Filter by date range

- **WHEN** user selects a range from 2026-05-01 to 2026-05-31 in the range picker
- **THEN** only programs with event date in May 2026 are shown

#### Scenario: Clear the date range

- **WHEN** user clears the range selection
- **THEN** the date range filter is removed and programs of all dates are shown

#### Scenario: Timezone-safe range

- **WHEN** the browser timezone is UTC-4 and the user selects a range
- **THEN** the selected start and end days are sent to the filter without an off-by-one day shift

### Requirement: Program list sorted by event date descending

The program list SHALL be sorted by event date (most recent first) by default.

#### Scenario: Default sort order

- **WHEN** user opens the program list with no filters
- **THEN** programs are displayed ordered by event date descending (newest first)

#### Scenario: Sort order preserved with filters

- **WHEN** user applies any filter combination
- **THEN** the resulting list remains sorted by event date descending
