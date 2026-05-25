# Mantenedor de Departamentos

## Purpose

Administrative CRUD interface for departments, accessible only to Admins. Departments are first-class entities (persisted as rows) referenced via FK by events; users may serve as directors of one or more departments through the `user_departments` join table.

## Requirements

### Requirement: Admin can create department

The system SHALL allow administrators to create departments by providing a name and an optional sigla.

#### Scenario: Create department with valid name and sigla
- **WHEN** admin provides a department name "Jóvenes" and sigla "JOV"
- **THEN** system creates the department with those fields and returns created data

#### Scenario: Create department with name only (no sigla)
- **WHEN** admin provides only a department name
- **THEN** system creates the department with empty sigla and returns created data

#### Scenario: Create department with duplicate name
- **WHEN** admin tries to create a department with a name that already exists
- **THEN** system returns a validation error

### Requirement: Admin can edit department

The system SHALL allow administrators to edit a department's name and sigla.

#### Scenario: Update department name
- **WHEN** admin changes department name from "Jóvenes" to "Juventud"
- **THEN** system updates the name and returns updated data

#### Scenario: Update department sigla
- **WHEN** admin changes department sigla from "JOV" to "JUV"
- **THEN** system updates the sigla and returns updated data

### Requirement: Admin can delete department

The system SHALL allow administrators to delete departments. When a department is deleted, its associated showcase and all showcase attachments SHALL also be deleted (cascade).

#### Scenario: Delete department without events
- **WHEN** admin deletes a department that has no events
- **THEN** system removes the department and any user_departments records

#### Scenario: Delete department with events
- **WHEN** admin deletes a department that has events
- **THEN** events keep their department_id as NULL and department is deleted

#### Scenario: Delete department with directors
- **WHEN** admin deletes a department that has users as directors
- **THEN** user_departments records are removed (cascade) and department is deleted

#### Scenario: Delete department with showcase
- **WHEN** admin deletes a department that has a showcase with attachments
- **THEN** the showcase record is deleted (cascade)
- **AND** all showcase attachment records are deleted (cascade)
- **AND** all attachment files are removed from disk
- **AND** the department is deleted

### Requirement: Admin can list all departments

The system SHALL allow administrators to list all departments with their director information and sigla.

#### Scenario: List departments with directors
- **WHEN** admin requests list of all departments
- **THEN** system returns departments with names and count of directors

#### Scenario: List departments shows sigla
- **WHEN** admin requests list of all departments
- **THEN** each department card shows the sigla badge when set

### Requirement: Admin can view single department

The system SHALL allow administrators to view a single department's details including its directors.

#### Scenario: Get department by ID with directors
- **WHEN** admin requests a department by ID
- **THEN** system returns department data including users where is_director=true

### Requirement: Department list shows showcase status

The system SHALL indicate in the departments list whether a department has showcase content published.

#### Scenario: List departments with showcase indicator
- **WHEN** an authenticated user requests the list of departments
- **THEN** each department includes a boolean field `hasShowcase` indicating whether showcase content exists
- **AND** the frontend shows a visual indicator (e.g., filled icon) for departments with published content

### Requirement: Department detail includes showcase summary

The system SHALL include a summary of the department's showcase when returning department details.

#### Scenario: Get department with showcase summary
- **WHEN** an authenticated user requests a department by ID
- **THEN** the response includes `showcase` field with description summary (first 150 characters) and attachment count
- **AND** the showcase summary is `null` if no showcase exists
