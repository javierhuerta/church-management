## ADDED Requirements

### Requirement: Hymn database with all Adventist hymns

The system SHALL maintain a database of 695 hymns from the Seventh-day Adventist Hymnal.

#### Scenario: List all hymns

- **WHEN** user requests all hymns
- **THEN** system returns 695 hymn records

#### Scenario: Search hymn by number

- **WHEN** user searches for hymn with number 145
- **THEN** system returns the hymn with number 145 and name "Jesús te ama"

#### Scenario: Search hymn by name

- **WHEN** user searches for hymn with name containing "Jesús"
- **THEN** system returns all hymns with "Jesús" in the name

### Requirement: Hymn selector autocomplete

The hymn input field SHALL provide autocomplete suggestions as users type.

#### Scenario: Autocomplete by number

- **WHEN** user types "14" in hymn field
- **THEN** system shows suggestions: "140 - Dulce hora de oración", "141 - Más cerca, oh Dios", "142 - guia Me"

#### Scenario: Autocomplete by name

- **WHEN** user types "dulce" in hymn field
- **THEN** system shows suggestions containing "dulce" in the name

### Requirement: Hymn has active/inactive status

Each hymn has an `isActive` flag. Inactive hymns are excluded from autocomplete results but existing references remain valid.

#### Scenario: Create program with inactive hymn reference

- **WHEN** user creates a program with hymn number 500 (which later becomes inactive)
- **THEN** hymnText "Himno 500 - Old hymn" is preserved in the program

#### Scenario: Inactive hymn not in autocomplete

- **WHEN** user searches for hymns
- **THEN** inactive hymns do not appear in autocomplete results