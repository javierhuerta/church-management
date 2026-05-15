## ADDED Requirements

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
