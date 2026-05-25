## ADDED Requirements

### Requirement: Director can manage department showcase content

The system SHALL allow users with role `DirectorDepartamento` (who are directors of the department) and users with role `Admin` to create, read, update, and delete showcase content for a department. Each department SHALL have exactly one showcase record. The showcase SHALL contain a description, mission statement, and announcements, each stored as Markdown text.

#### Scenario: Director creates showcase content for their department
- **WHEN** a user with role `DirectorDepartamento` who is a director of department "Jóvenes" sends a POST to `/api/departments/:id/showcase` with description, mission, and announcements
- **THEN** the system creates a `DepartmentShowcase` record linked to that department
- **AND** returns the created showcase with all fields

#### Scenario: Director updates existing showcase content
- **WHEN** a director of department "Jóvenes" sends a PATCH to `/api/departments/:id/showcase` with updated description
- **THEN** the system updates the existing showcase record
- **AND** returns the updated showcase

#### Scenario: Non-director cannot edit showcase
- **WHEN** a user with role `DirectorDepartamento` who is NOT a director of department "Jóvenes" attempts to create or update its showcase
- **THEN** the system returns 403 Forbidden

#### Scenario: Admin can edit any department showcase
- **WHEN** a user with role `Admin` sends a PATCH to `/api/departments/:id/showcase` for any department
- **THEN** the system updates the showcase regardless of department association
- **AND** returns the updated showcase

#### Scenario: Showcase does not exist yet for department
- **WHEN** a user requests GET `/api/departments/:id/showcase` for a department that has no showcase
- **THEN** the system returns an empty showcase with `description: ""`, `mission: ""`, `announcements: ""` and `createdAt: null`

#### Scenario: Delete department cascades to showcase
- **WHEN** an Admin deletes a department that has a showcase
- **THEN** the system deletes the showcase and all its attachments

### Requirement: Showcase content supports Markdown formatting

The system SHALL store showcase content as Markdown text and SHALL preserve the raw Markdown on write. The frontend SHALL render Markdown as HTML for display.

#### Scenario: Save and retrieve Markdown content
- **WHEN** a director saves showcase content with Markdown formatting (headers, bold, lists)
- **THEN** the system stores the raw Markdown text
- **AND** returns the raw Markdown text when retrieved

#### Scenario: Empty or whitespace-only content is valid
- **WHEN** a director saves showcase with empty string or whitespace for any field
- **THEN** the system accepts and stores the value as-is
