# Document Center

## Purpose

Centralized management of church documents, annual periods, and elder rotation scheduling. Provides role-based access for uploading, viewing, and organizing documents with leadership context (pastor and elder shifts).

## Requirements

### Requirement: Create annual period with automatic elder rotation

The system SHALL allow authenticated users with editor roles (Admin, Pastor, Secretaria de Iglesia) to create an annual period with automatic assignment of rotating elder groups. The system SHALL use the configured rotation groups (arrays of user IDs) and the shift duration (in weeks) to automatically distribute groups across the year's weeks.

#### Scenario: Create annual period with automatic elder group rotation
- **WHEN** authenticated user with editor role creates a period for year 2026 with 5 rotation groups and 2-week shifts
- **THEN** system creates Period record with startDate January 1, endDate December 31, 2026
- **AND** system assigns groups to ElderShift records in round-robin: Group 1 → weeks 1-2, Group 2 → weeks 3-4, etc.
- **AND** system stores pastor association (selected by user at creation time)
- **AND** each member of a group receives an individual ElderShift with the same date range

#### Scenario: Period with more weeks than groups
- **WHEN** authenticated user with editor role creates a period with 5 groups and 2-week shifts (26 shifts in a year)
- **THEN** system assigns 5 groups in round-robin, cycling through groups until all 26 shifts are covered
- **AND** each group appears approximately 5-6 times across the year

#### Scenario: Rotation groups include non-Anciano roles
- **WHEN** a rotation group includes users with roles Admin or CoordinadorMisionero
- **THEN** system assigns them to ElderShifts just like Anciano-role users
- **AND** the shift display shows their name and role

### Requirement: Get period with leadership context

The system SHALL return the period with associated pastor and list of elder shifts for any authenticated user with access to document center.

#### Scenario: Get period details
- **WHEN** authenticated user requests period for year 2026
- **THEN** system returns period with year=2026, pastor={id, name}, rotationGroups=[[...], [...]], elderShifts=[{elder, weekStart, weekEnd},...]

#### Scenario: Period with unassigned pastor
- **WHEN** authenticated user requests period with no pastor assigned
- **THEN** system returns period with pastor=null and notes "Por asignar"

#### Scenario: No period for year
- **WHEN** authenticated user requests period for a year with no period created
- **THEN** system returns 404 or null (not undefined)
- **AND** frontend displays empty state without React Query errors

### Requirement: List periods

The system SHALL allow authenticated users to list all periods, ordered by year.

#### Scenario: List all periods
- **WHEN** authenticated user requests list of periods
- **THEN** system returns array of periods with id, year, startDate, endDate, pastor summary, rotationGroups, shiftWeeks

### Requirement: Regenerate elder rotation

The system SHALL allow authenticated users with editor roles to regenerate the entire elder rotation for a period, replacing all existing shifts with newly calculated ones.

#### Scenario: Regenerate rotation
- **WHEN** authenticated user with editor role clicks "Regenerar rotación" for period 2026
- **THEN** system deletes all existing ElderShifts for that period
- **AND** system recalculates shifts based on current rotationGroups and shiftWeeks
- **AND** system creates new ElderShifts for the entire year

#### Scenario: Manual add/remove of individual shifts
- **NOT SUPPORTED** — the system does not allow adding or removing individual elder shifts. The entire rotation must be regenerated.

### Requirement: Associate document to period

The system SHALL allow authenticated users with editor roles to upload documents associated with a specific period. The document title SHALL be auto-generated as `{CATEGORY}_{YEAR}_{MONTH}` (e.g., `ACTA_2026_05.pdf`).

#### Scenario: Upload document with period
- **WHEN** authenticated user with editor role uploads a document for May 2026 with category CHURCH_MINUTES
- **THEN** system stores document with periodId referencing 2026 period
- **AND** document originalName is auto-generated as `ACTA_2026_05.pdf`

#### Scenario: Document without period
- **WHEN** authenticated user with editor role uploads a document without specifying period
- **THEN** system stores document with periodId=null (legacy mode)

### Requirement: Upload document

The system SHALL allow authenticated users with editor roles (Admin, Pastor, Secretaria de Iglesia) to upload documents in the following formats: PDF (.pdf) and Word (.docx). Each document must belong to a specific year and month, and must be categorized as one of: church minutes, department plan, treasury report, mission report, or other. The document MAY be associated with a periodId. The document title is auto-generated from category, year, and month.

#### Scenario: Upload with period association
- **WHEN** authenticated user with editor role uploads a document specifying periodId for 2026
- **THEN** system stores document linked to period 2026
- **AND** user can view which pastor and elders were leading during that period

### Requirement: List documents by year

The system SHALL allow authenticated users with read or editor roles to list all documents for a specific year, grouped by month, showing document metadata with period context (pastor name, elder names).

#### Scenario: List documents for year
- **WHEN** authenticated user requests list of documents for year 2026
- **THEN** system returns array of documents with id, originalName, category, year, month, period info (pastor name, elder names)
- **AND** documents are grouped by month, then ordered by category

### Requirement: Role-based access control

The system SHALL enforce the following access rules:
- Admin, Pastor, Secretaria de Iglesia: can create periods, upload, download, and delete documents
- Anciano, Director de Departamento, Coordinador Misionero: can only download documents and view period context
- All other roles: no access (403 Forbidden)

#### Scenario: Editor role creates period
- **WHEN** user with Admin role creates a period for 2026
- **THEN** user can see form to select pastor and configure rotation groups
- **AND** system saves period with assigned elder shifts

#### Scenario: Viewer role sees period context
- **WHEN** user with Anciano role views documents for 2026
- **THEN** user sees card showing "Pastor: [name]" and elder shift schedule
- **AND** user cannot create or modify periods

### Requirement: Elder roles in rotation

The system SHALL allow users with roles Anciano, Admin, and CoordinadorMisionero to be included in rotation groups. The rotation is not limited to users with the Anciano role — any of these three leadership roles can participate in elder shifts.

#### Scenario: Admin role in rotation group
- **WHEN** a user with Admin role is added to a rotation group
- **THEN** system creates ElderShifts for that user just like for Anciano-role users
- **AND** the shift display shows their name with their role

#### Scenario: CoordinadorMisionero in rotation group
- **WHEN** a user with CoordinadorMisionero role is added to a rotation group
- **THEN** system creates ElderShifts for that user alongside Anciano and Admin users