## MODIFIED Requirements

### Requirement: Program section fields

Each section in a program SHALL have the following editable fields:
- `startTime`: time (HH:MM format) when the section begins
- `duration`: integer representing minutes
- `responsible`: free text (autocomplete from system users via `AuthService.authControllerAutocomplete`)
- `hymnText`: free text describing the hymn
- `notes`: free text for additional notes

The responsible field autocomplete SHALL use the generated OpenAPI client (`AuthService`) instead of a direct `fetch()` call.

#### Scenario: Edit section start time
- **WHEN** user sets section "Sermón" startTime to "11:30"
- **THEN** section startTime is saved as "11:30"

#### Scenario: Edit section responsible with autocomplete via generated client
- **WHEN** user types "Mar" in the responsible field
- **THEN** system calls `AuthService.authControllerAutocomplete("Mar")` and shows matching user suggestions
- **WHEN** user selects a suggestion
- **THEN** responsible is saved as free text (not a foreign key)

#### Scenario: Edit section hymn
- **WHEN** user sets section "Himno inicial" hymnText to "Himno 145 - Jesús te ama"
- **THEN** section hymnText is saved
