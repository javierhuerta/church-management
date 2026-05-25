## MODIFIED Requirements

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

## ADDED Requirements

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
