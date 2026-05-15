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

The system SHALL allow filtering the program list by a date range applied to the event date (`date` field).

#### Scenario: Filter by date from

- **WHEN** user sets a "desde" date of 2026-05-01
- **THEN** only programs with event date >= 2026-05-01 are shown

#### Scenario: Filter by date to

- **WHEN** user sets a "hasta" date of 2026-05-31
- **THEN** only programs with event date <= 2026-05-31 are shown

#### Scenario: Filter by date range

- **WHEN** user sets "desde" 2026-05-01 and "hasta" 2026-05-31
- **THEN** only programs with event date in May 2026 are shown

### Requirement: Program list sorted by event date descending

The program list SHALL be sorted by event date (most recent first) by default.

#### Scenario: Default sort order

- **WHEN** user opens the program list with no filters
- **THEN** programs are displayed ordered by event date descending (newest first)

#### Scenario: Sort order preserved with filters

- **WHEN** user applies any filter combination
- **THEN** the resulting list remains sorted by event date descending
