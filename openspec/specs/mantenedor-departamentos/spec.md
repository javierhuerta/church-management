# Mantenedor de Departamentos

## Purpose

Administrative CRUD interface for departments, accessible only to Admins. Departments are first-class entities (persisted as rows) referenced via FK by events; users may serve as directors of one or more departments through the `user_departments` join table.

## Requirements

### Requirement: Admin can create department

The system SHALL allow administrators to create departments by providing a name.

#### Scenario: Create department with valid name
- **WHEN** admin provides a department name
- **THEN** system creates the department and returns created data

#### Scenario: Create department with duplicate name
- **WHEN** admin tries to create a department with a name that already exists
- **THEN** system returns a validation error

### Requirement: Admin can edit department

The system SHALL allow administrators to edit a department's name.

#### Scenario: Update department name
- **WHEN** admin changes department name from "Jóvenes" to "Juventud"
- **THEN** system updates the name and returns updated data

### Requirement: Admin can delete department

The system SHALL allow administrators to delete departments.

#### Scenario: Delete department without events
- **WHEN** admin deletes a department that has no events
- **THEN** system removes the department and any user_departments records

#### Scenario: Delete department with events
- **WHEN** admin deletes a department that has events
- **THEN** events keep their department_id as NULL and department is deleted

#### Scenario: Delete department with directors
- **WHEN** admin deletes a department that has users as directors
- **THEN** user_departments records are removed (cascade) and department is deleted

### Requirement: Admin can list all departments

The system SHALL allow administrators to list all departments with their director information.

#### Scenario: List departments with directors
- **WHEN** admin requests list of all departments
- **THEN** system returns departments with names and count of directors

### Requirement: Admin can view single department

The system SHALL allow administrators to view a single department's details including its directors.

#### Scenario: Get department by ID with directors
- **WHEN** admin requests a department by ID
- **THEN** system returns department data including users where is_director=true
