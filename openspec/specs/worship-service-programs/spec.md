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

### Requirement: Acción de exportar PDF en la vista de detalle del programa

La vista de detalle del programa SHALL incluir un botón "Descargar PDF" accesible para todos los roles de usuario que tengan permiso de ver el programa, independientemente del estado del mismo.

#### Scenario: Botón visible para todos los roles

- **WHEN** cualquier usuario autenticado accede a la página de detalle de un programa
- **THEN** el botón "Descargar PDF" está visible en el área de acciones del encabezado

#### Scenario: Botón no altera el estado del programa

- **WHEN** el usuario hace clic en "Descargar PDF"
- **THEN** el estado del programa no cambia y no se registra ninguna entrada en el historial de cambios

### Requirement: Propagación de tiempos desde plantilla al crear programa
Al crear un programa desde una plantilla, el sistema SHALL copiar los campos `startTime` y `duration` de cada sección de plantilla a la sección de programa correspondiente.

#### Scenario: Propagación de startTime y duration al crear programa
- **WHEN** el usuario crea un programa a partir de una plantilla que tiene secciones con `startTime` y `duration`
- **THEN** las secciones del programa heredan los valores de `startTime` y `duration` de la plantilla, sin necesidad de editarlas manualmente

#### Scenario: Secciones de plantilla sin tiempos no generan error
- **WHEN** el usuario crea un programa a partir de una plantilla cuyas secciones no tienen `startTime` ni `duration`
- **THEN** las secciones del programa se crean con ambos campos como `null`

### Requirement: Endpoints de reordenamiento de grupos y secciones
El sistema SHALL exponer dos endpoints para reordenar los ítems de un programa: uno para grupos y otro para secciones. Ambos reciben un array ordenado de IDs y actualizan el campo `order` de cada entidad.

#### Scenario: Reordenar grupos de un programa
- **WHEN** se llama `PATCH /worship-services/programs/:id/groups/reorder` con `{ orderedIds: string[] }`
- **THEN** el sistema actualiza el campo `order` de cada grupo según su posición en el array y devuelve 200

#### Scenario: Reordenar secciones de un programa
- **WHEN** se llama `PATCH /worship-services/programs/:id/sections/reorder` con `{ orderedIds: string[] }`
- **THEN** el sistema actualiza el campo `order` de cada sección según su posición en el array y devuelve 200

#### Scenario: IDs inválidos en reordenamiento son ignorados
- **WHEN** el array de IDs contiene algún ID que no pertenece al programa
- **THEN** el sistema ignora ese ID y solo actualiza los que sí pertenecen al programa

### Requirement: Program ARCHIVED status

A program can be archived by an Admin. Archived programs are read-only for all users except Admin.

#### Scenario: Archive a published program

- **WHEN** Admin archives a PUBLISHED program
- **THEN** program status changes to ARCHIVED
- **AND** the program appears in the list only when the ARCHIVED filter is active

#### Scenario: Non-admin cannot archive

- **WHEN** a non-Admin user attempts to archive a program
- **THEN** system returns 403 Forbidden

#### Scenario: Edit ARCHIVED program as Admin

- **WHEN** Admin edits an ARCHIVED program
- **THEN** changes are saved successfully

#### Scenario: Edit ARCHIVED program as non-Admin

- **WHEN** a non-Admin user (including the original creator) attempts to edit an ARCHIVED program
- **THEN** system returns 403 Forbidden

### Requirement: Admin can delete a program from the list

An Admin SHALL be able to permanently delete a program directly from the list view, after confirming the action in a dialog.

#### Scenario: Admin deletes a program

- **WHEN** Admin clicks the delete button on a program card in the list
- **AND** confirms the action in the confirmation dialog
- **THEN** the program is permanently deleted
- **AND** the list refreshes without the deleted program

#### Scenario: Admin cancels deletion

- **WHEN** Admin clicks the delete button on a program card
- **AND** cancels in the confirmation dialog
- **THEN** the program is NOT deleted

#### Scenario: Non-admin sees no delete button

- **WHEN** a non-Admin user views the program list
- **THEN** no delete button is visible on program cards

### Requirement: Delete a group from program detail

A user with edit permissions SHALL be able to delete a group from a program, after confirming the action in a dialog.

#### Scenario: Delete group from DRAFT program

- **WHEN** user with permission clicks delete on a group in a DRAFT program
- **AND** confirms in the confirmation dialog
- **THEN** the group and all its sections are permanently removed from the program
- **AND** the detail view updates without a full page reload

#### Scenario: Cancel group deletion

- **WHEN** user clicks delete on a group
- **AND** cancels in the confirmation dialog
- **THEN** the group is NOT deleted

### Requirement: Delete a section from program detail

A user with edit permissions SHALL be able to delete an individual section from a program, after confirming the action in a dialog.

#### Scenario: Delete section from DRAFT program

- **WHEN** user with permission clicks delete on a section
- **AND** confirms in the confirmation dialog
- **THEN** the section is permanently removed from the program
- **AND** the detail view updates without a full page reload

#### Scenario: Cancel section deletion

- **WHEN** user clicks delete on a section
- **AND** cancels in the confirmation dialog
- **THEN** the section is NOT deleted

### Requirement: Confirmation dialogs replace browser alerts

All destructive or irreversible operations SHALL use a styled confirmation dialog (shadcn AlertDialog) instead of the browser's native `confirm()` or `alert()`.

#### Scenario: Publish confirmation uses dialog

- **WHEN** user clicks "Publicar programa"
- **THEN** a styled dialog appears with a confirmation message and Cancel / Confirmar buttons

#### Scenario: Delete confirmation uses dialog

- **WHEN** user initiates any delete operation (program, group, or section)
- **THEN** a styled dialog appears with a warning message and Cancel / Eliminar buttons

### Requirement: Program detail updates without full page reload

All save, publish, and delete operations on the program detail page SHALL update the UI by invalidating React Query cache instead of calling `window.location.reload()`.

#### Scenario: Save section without reload

- **WHEN** user saves a section field
- **THEN** the updated data is reflected in the UI
- **AND** the browser does NOT perform a full page reload

#### Scenario: Publish program without reload

- **WHEN** user publishes a program
- **THEN** the program status badge updates to "Publicado"
- **AND** the browser does NOT perform a full page reload

#### Scenario: Delete group or section without reload

- **WHEN** user deletes a group or section
- **THEN** the item disappears from the detail view
- **AND** the browser does NOT perform a full page reload
