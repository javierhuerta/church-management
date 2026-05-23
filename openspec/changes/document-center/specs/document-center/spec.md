## ADDED Requirements

### Requirement: Create period with automatic elder rotation

The system SHALL allow authenticated users with editor roles (Admin, Pastor, Secretaria de Iglesia) to create a period for a month with automatic assignment of rotating elders. The system SHALL use the configured roster of elder users and the shift duration (in weeks) to automatically distribute elders across the period's weeks.

#### Scenario: Create period with automatic elder assignment
- **WHEN** authenticated user with editor role creates a period for March 2026 with 10 elders and 2-week shifts
- **THEN** system creates Period record with startDate March 1, endDate March 31
- **AND** system assigns elders to ElderShift records: weeks 1-2 to Elder 1, weeks 3-4 to Elder 2, etc.
- **AND** system stores pastor association (selected by user at creation time)

#### Scenario: Period with more weeks than elders
- **WHEN** authenticated user with editor role creates a period with 10 elders and 2-week shifts (4 weeks total)
- **THEN** system assigns 5 elders (one per week-pair), then repeats from start if more weeks exist
- **AND** system continues round-robin until all weeks are covered

### Requirement: Get period with leadership context

The system SHALL return the period with associated pastor and list of elder shifts for any authenticated user with access to document center.

#### Scenario: Get period details
- **WHEN** authenticated user requests period for March 2026
- **THEN** system returns period with year=2026, month=3, pastor={id, name}, elderShifts=[{elder, weekStart, weekEnd},...]

#### Scenario: Period with unassigned pastor
- **WHEN** authenticated user requests period with no pastor assigned
- **THEN** system returns period with pastor=null and notes "Por asignar"

### Requirement: List periods by year

The system SHALL allow authenticated users to list all periods for a specific year, ordered by month.

#### Scenario: List periods for year
- **WHEN** authenticated user requests periods for year 2026
- **THEN** system returns array of periods with id, year, month, startDate, endDate, pastor summary

### Requirement: Associate document to period

The system SHALL allow authenticated users with editor roles to upload documents associated with a specific period.

#### Scenario: Upload document with period
- **WHEN** authenticated user with editor role uploads a document for March 2026
- **THEN** system stores document with periodId referencing March 2026 period

#### Scenario: Document without period
- **WHEN** authenticated user with editor role uploads a document without specifying period
- **THEN** system stores document with periodId=null (legacy mode)

## MODIFIED Requirements

### Requirement: Upload document
The system SHALL allow authenticated users with editor roles (Admin, Pastor, Secretaria de Iglesia) to upload documents in the following formats: PDF (.pdf) and Word (.docx). Each document must belong to a specific year and month, and must be categorized as one of: church minutes, department plan, treasury report, or mission report. The document MAY be associated with a periodId.

#### Scenario: Upload with period association
- **WHEN** authenticated user with editor role uploads a document specifying periodId for March 2026
- **THEN** system stores document linked to period March 2026
- **AND** user can view which pastor and elders were leading during that period

### Requirement: List documents by period

The system SHALL allow authenticated users with read or editor roles to list all documents for a specific period, showing document metadata with period context (pastor name, elder names).

#### Scenario: List documents for period
- **WHEN** authenticated user requests list of documents for period March 2026
- **THEN** system returns array of documents with id, originalName, category, period info (pastor name, elder names)
- **AND** documents are ordered by month, then category

### Requirement: Role-based access control

The system SHALL enforce the following access rules:
- Admin, Pastor, Secretaria de Iglesia: can create periods, upload, download, and delete documents
- Anciano, Director de Departamento, Coordinador Misionero: can only download documents and view period context
- All other roles: no access (403 Forbidden)

#### Scenario: Editor role creates period
- **WHEN** user with Admin role creates a period for April 2026
- **THEN** user can see form to select pastor and sees automatic elder rotation preview
- **AND** system saves period with assigned elders

#### Scenario: Viewer role sees period context
- **WHEN** user with Anciano role views documents for March 2026
- **THEN** user sees card showing "Pastor: [name] | Ancianos: [names]"
- **AND** user cannot create or modify periods