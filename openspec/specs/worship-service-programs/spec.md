# Worship Service Programs

## Purpose

Manages the concrete weekly service programs. A program is created from a template for a specific date and contains all the groups and sections of that template, each editable with time, responsible, hymn, and notes fields. Programs follow a DRAFT → PUBLISHED lifecycle with editing restrictions on published programs.

## Requirements

### Requirement: Create program from template

A user with appropriate permissions SHALL be able to create a service program by selecting a template and a date. The program copies all groups and sections from the template but allows editing all section fields.

#### Scenario: Create program with template

- **WHEN** user selects template "Sábado Regular" and date "2026-05-16"
- **THEN** a new program is created with all groups and sections copied from template
- **AND** program status is set to DRAFT
- **AND** createdById is set to current user

### Requirement: Program section fields

Each section in a program SHALL have the following editable fields:
- `startTime`: time (HH:MM format) when the section begins
- `duration`: integer representing minutes
- `responsible`: free text (autocomplete from system users)
- `hymnText`: free text describing the hymn
- `notes`: free text for additional notes

#### Scenario: Edit section start time

- **WHEN** user sets section "Sermón" startTime to "11:30"
- **THEN** section startTime is saved as "11:30"

#### Scenario: Edit section responsible with autocomplete

- **WHEN** user types "Mar" in the responsible field
- **THEN** system shows suggestions "María García", "Mario Pérez" from users
- **WHEN** user selects "María García"
- **THEN** responsible is saved as "María García" (free text, not a foreign key)

#### Scenario: Edit section hymn

- **WHEN** user sets section "Himno inicial" hymnText to "Himno 145 - Jesús te ama"
- **THEN** section hymnText is saved

### Requirement: Program status transitions

A program can be in DRAFT or PUBLISHED status. When published, editing restrictions apply.

#### Scenario: Publish program

- **WHEN** user with permission publishes a program
- **THEN** program status changes to PUBLISHED
- **AND** publishedAt is set to current timestamp
- **AND** publishedById is set to current user

#### Scenario: Edit DRAFT program

- **WHEN** user with permission edits a DRAFT program
- **THEN** changes are saved successfully

#### Scenario: Edit PUBLISHED program as Admin

- **WHEN** Admin edits a PUBLISHED program
- **THEN** changes are saved successfully

#### Scenario: Edit PUBLISHED program as original creator (Pastor)

- **WHEN** Pastor who created the program edits it after publishing
- **THEN** changes are saved successfully

#### Scenario: Edit PUBLISHED program as Anciano (not creator)

- **WHEN** Anciano (not the creator) attempts to edit a PUBLISHED program
- **THEN** system returns 403 Forbidden

#### Scenario: Edit PUBLISHED program as DirectorDepartamento (not creator)

- **WHEN** DirectorDepartamento (not the creator) attempts to edit a PUBLISHED program
- **THEN** system returns 403 Forbidden

### Requirement: Program groups can be reordered

The order of groups and sections within a program can be changed after creation.

#### Scenario: Reorder groups

- **WHEN** user changes the order of groups in a program
- **THEN** all groups have updated order values

#### Scenario: Move section between groups

- **WHEN** user moves a section from group "Escuela Sabática" to group "Culto Divino"
- **THEN** section belongs to the new group

### Requirement: Program section times

Each section in a program SHALL have an absolute start time (HH:MM) and duration in minutes.

#### Scenario: Set section time

- **WHEN** user sets section "Sermón" startTime to "11:30" and duration to 30
- **THEN** section startTime is "11:30" and duration is 30

#### Scenario: Time conflicts

- **WHEN** user sets overlapping times for adjacent sections
- **THEN** system does NOT prevent this (user has flexibility)
