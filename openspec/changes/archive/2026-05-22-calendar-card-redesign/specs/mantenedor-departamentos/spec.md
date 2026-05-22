# Mantenedor de Departamentos

## MODIFIED Requirements

### Requirement: Admin can create department

The system SHALL allow administrators to create departments by providing a name and an optional sigla.

#### Scenario: Create department with valid name and sigla
- **WHEN** admin provides a department name "Jóvenes" and sigla "JOV"
- **THEN** system creates the department with those fields and returns created data

#### Scenario: Create department with name only (no sigla)
- **WHEN** admin provides only a department name
- **THEN** system creates the department with empty sigla and returns created data

### Requirement: Admin can edit department

The system SHALL allow administrators to edit a department's name and sigla.

#### Scenario: Update department sigla
- **WHEN** admin changes department sigla from "JOV" to "JUV"
- **THEN** system updates the sigla and returns updated data

#### Scenario: Update department name and sigla
- **WHEN** admin changes department name from "Jóvenes" to "Juventud" and sigla from "JOV" to "JUV"
- **THEN** system updates both fields and returns updated data

### Requirement: Admin can list all departments

The system SHALL allow administrators to list all departments with their director information and sigla.

#### Scenario: List departments shows sigla column
- **WHEN** admin requests list of all departments
- **THEN** system returns departments with names, sigla, and count of directors
