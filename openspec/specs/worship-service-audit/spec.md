# Worship Service Audit

## Purpose

Tracks all changes made to worship service programs and their sections. Every modification creates an immutable log entry recording who changed what, when, and from which value to which value. Audit logs are displayed in the program detail view to provide full traceability.

## Requirements

### Requirement: Log all section changes

The system SHALL create a log entry whenever any field of a section is modified in a program.

#### Scenario: Change responsible

- **WHEN** user changes section "Sermón" responsible from "Juan Pérez" to "María García"
- **THEN** a log entry is created with:
  - userId: current user
  - sectionId: section id
  - action: "cambió responsable"
  - previousValue: "Juan Pérez"
  - newValue: "María García"
  - timestamp: current time

#### Scenario: Change hymn

- **WHEN** user changes section "Himno inicial" hymnText from "Himno 100" to "Himno 145"
- **THEN** a log entry is created with action "cambió himno"

#### Scenario: Change start time

- **WHEN** user changes section "Oración" startTime from "10:00" to "10:05"
- **THEN** a log entry is created with action "cambió hora de inicio"

### Requirement: Log program-level changes

The system SHALL create a log entry when the program itself is modified (not a specific section).

#### Scenario: Change program date

- **WHEN** user changes program date from "2026-05-16" to "2026-05-23"
- **THEN** a log entry is created with:
  - sectionId: null (program-level change)
  - action: "cambió fecha"
  - previousValue: "2026-05-16"
  - newValue: "2026-05-23"

#### Scenario: Publish program

- **WHEN** user publishes a program
- **THEN** a log entry is created with action "publicó programa"

### Requirement: Logs are visible in UI

All logs for a program SHALL be retrievable and displayed in the program's detail view.

#### Scenario: View program logs

- **WHEN** user opens program detail view
- **THEN** system displays all logs ordered by timestamp (newest first)
- **AND** each log shows user name, action description, previousValue, newValue, and timestamp

#### Scenario: Logs show human-readable action

- **WHEN** user views logs for a program
- **THEN** each log action is displayed as free text (e.g., "asignó responsable", "cambió himno", "definió hora")

### Requirement: Logs are immutable

Log entries cannot be modified or deleted after creation.

#### Scenario: Attempt to delete log

- **WHEN** user attempts to delete a log entry
- **THEN** system returns 405 Method Not Allowed

#### Scenario: Attempt to edit log

- **WHEN** user attempts to edit a log entry
- **THEN** system returns 405 Method Not Allowed
