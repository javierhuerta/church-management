## ADDED Requirements

### Requirement: Service template types

The system SHALL support four types of service templates: CULTO_SABATICO, CULTO_JA, CULTO_ORACION, and OTRO.

#### Scenario: List templates filtered by type

- **WHEN** user requests templates filtered by type "CULTO_SABATICO"
- **THEN** system returns only templates with type equal to CULTO_SABATICO

#### Scenario: Create template with type

- **WHEN** user creates a new template with type "CULTO_SABATICO"
- **THEN** template is saved with type "CULTO_SABATICO"

### Requirement: Service template has optional groups

A service template MAY contain zero or more groups. Each group has a name and optional start/end times. Groups help organize sections by logical blocks (e.g., "Escuela Sabática" group within a Saturday template).

#### Scenario: Create template without groups

- **WHEN** user creates a template with no groups
- **THEN** template has empty groups array and all sections are top-level

#### Scenario: Create template with groups

- **WHEN** user creates a template with two groups "Escuela Sabática" and "Culto Divino"
- **THEN** template has two groups, each containing their respective sections

### Requirement: Service template has sections

A service template SHALL have one or more sections. Sections can belong to a group or be top-level (no group). Each section has a name and order.

#### Scenario: Add section to group

- **WHEN** user adds a section "Oración de invocación" to group "Escuela Sabática"
- **THEN** section belongs to that group with order preserved

#### Scenario: Add top-level section

- **WHEN** user adds a section "Culto de oración" without a group
- **THEN** section is top-level with order preserved

### Requirement: Service template can be active or inactive

A service template has an `isActive` flag. Inactive templates cannot be used to create new programs but existing programs remain unaffected.

#### Scenario: Create program from active template

- **WHEN** user creates a program using an active template
- **THEN** program is created successfully

#### Scenario: Attempt to create program from inactive template

- **WHEN** user attempts to create a program using an inactive template
- **THEN** system returns error indicating template is inactive

### Requirement: Only Admin and Pastor can manage templates

Creating, editing, and deleting service templates is restricted to users with roles Admin or Pastor.

#### Scenario: Admin creates template

- **WHEN** user with Admin role creates a template
- **THEN** template is created successfully

#### Scenario: Pastor creates template

- **WHEN** user with Pastor role creates a template
- **THEN** template is created successfully

#### Scenario: Anciano attempts to create template

- **WHEN** user with Anciano role attempts to create a template
- **THEN** system returns 403 Forbidden

#### Scenario: DirectorDepartamento attempts to create template

- **WHEN** user with DirectorDepartamento role attempts to create a template
- **THEN** system returns 403 Forbidden

### Requirement: Template sections can be reordered

The order of sections within a template (or within a group) can be changed. Reordering updates the `order` field of affected sections.

#### Scenario: Reorder sections within a group

- **WHEN** user changes section order in a group
- **THEN** all sections in that group have updated order values

#### Scenario: Reorder groups in template

- **WHEN** user changes the order of groups in a template
- **THEN** all groups have updated order values