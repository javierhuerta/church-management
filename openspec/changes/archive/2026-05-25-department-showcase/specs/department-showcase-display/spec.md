## ADDED Requirements

### Requirement: Authenticated users can view department showcase

The system SHALL allow any authenticated user to view the showcase content and attachments of any department.

#### Scenario: View showcase with content
- **WHEN** an authenticated user requests GET `/api/departments/:id/showcase` for a department that has showcase content
- **THEN** the system returns the showcase with description, mission, announcements, and list of attachments

#### Scenario: View showcase without content
- **WHEN** an authenticated user requests GET `/api/departments/:id/showcase` for a department that has no showcase yet
- **THEN** the system returns default empty showcase (description: "", mission: "", announcements: "", attachments: [])

#### Scenario: Unauthenticated user cannot view showcase
- **WHEN** an unauthenticated user requests GET `/api/departments/:id/showcase`
- **THEN** the system returns 401 Unauthorized

### Requirement: Showcase display renders Markdown as formatted content

The frontend SHALL render the description, mission, and announcements fields as formatted HTML from Markdown. The frontend SHALL display each section with a clear heading.

#### Scenario: Display showcase with Markdown content
- **WHEN** a user views a department showcase with Markdown content (headers, lists, bold text)
- **THEN** the frontend renders the content as formatted HTML with proper headings, lists, and emphasis

#### Scenario: Display showcase with empty sections
- **WHEN** a user views a department showcase where some sections are empty
- **THEN** the frontend hides those sections entirely (does not show empty headings)

### Requirement: Showcase displays department identity

The frontend SHALL display the department name, sigla badge, and department color when showing the showcase.

#### Scenario: Display department header
- **WHEN** a user views the showcase of department "Jóvenes" with sigla "JOV" and color "#FF5733"
- **THEN** the frontend shows the department name in bold
- **AND** shows the sigla "JOV" in a badge with background color #FF5733
- **AND** the page accent (borders, section accents) uses the department color

### Requirement: Showcase page has mobile and desktop layouts

The frontend SHALL render the showcase page in a two-column layout on desktop (≥768px) and a single-column stacked layout on mobile (<768px).

#### Scenario: Desktop layout
- **WHEN** a user views the showcase on a viewport ≥768px wide
- **THEN** the page shows content (description, mission, announcements) in the left column (70% width)
- **AND** shows attachments in the right sidebar (30% width)

#### Scenario: Mobile layout
- **WHEN** a user views the showcase on a viewport <768px wide
- **THEN** the page shows content stacked vertically with attachments at the bottom

### Requirement: Navigation to department showcase

The system SHALL provide navigation to each department's showcase from the departments list page and from the sidebar.

#### Scenario: Navigate from departments list
- **WHEN** an authenticated user views the departments list
- **THEN** each department card is clickable
- **AND** clicking navigates to the department's showcase page at `/departamentos/:id`

#### Scenario: Director sees direct access to their department
- **WHEN** a user with role `DirectorDepartamento` who directs at least one department logs in
- **THEN** the sidebar shows a "Mi Departamento" link that navigates to their first department's showcase
