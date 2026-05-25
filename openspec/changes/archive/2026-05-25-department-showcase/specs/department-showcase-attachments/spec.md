## ADDED Requirements

### Requirement: Director can upload attachments to showcase

The system SHALL allow users with edit permissions on a department's showcase to upload file attachments. Accepted formats SHALL be PDF (.pdf), images (.jpg, .jpeg, .png, .gif, .webp), and documents (.docx, .xlsx). Each file SHALL be limited to 10MB.

#### Scenario: Director uploads a PDF calendar
- **WHEN** a director of department "Jóvenes" uploads a PDF file to `/api/departments/:id/showcase/attachments`
- **THEN** the system stores the file in `uploads/showcase/` with a unique filename
- **AND** creates a `ShowcaseAttachment` record with the original filename, stored path, MIME type, and file size
- **AND** returns the attachment metadata

#### Scenario: Upload file exceeding size limit
- **WHEN** a director uploads a file larger than 10MB
- **THEN** the system returns 400 Bad Request with message "File size exceeds 10MB limit"

#### Scenario: Upload unsupported file format
- **WHEN** a director uploads a file with extension `.exe`
- **THEN** the system returns 400 Bad Request with message "Unsupported file format"

#### Scenario: Non-director cannot upload attachments
- **WHEN** a user without edit permissions attempts to upload an attachment
- **THEN** the system returns 403 Forbidden

### Requirement: Director can list attachments for their showcase

The system SHALL allow any authenticated user to list attachments for a department's showcase.

#### Scenario: List attachments for showcase
- **WHEN** an authenticated user requests GET `/api/departments/:id/showcase/attachments`
- **THEN** the system returns an array of attachment metadata (id, originalName, mimeType, sizeBytes, createdAt)

#### Scenario: List attachments for empty showcase
- **WHEN** an authenticated user requests attachments for a showcase with no attachments
- **THEN** the system returns an empty array

### Requirement: Director can delete attachments

The system SHALL allow users with edit permissions to delete attachments from a showcase. Deleting an attachment SHALL remove both the database record and the file from disk.

#### Scenario: Director deletes an attachment
- **WHEN** a director of department "Jóvenes" sends DELETE to `/api/departments/:id/showcase/attachments/:attachmentId`
- **THEN** the system removes the file from disk
- **AND** deletes the `ShowcaseAttachment` record
- **AND** returns 200 OK

#### Scenario: Non-director cannot delete attachments
- **WHEN** a user without edit permissions attempts to delete an attachment
- **THEN** the system returns 403 Forbidden

#### Scenario: Delete non-existent attachment
- **WHEN** a director attempts to delete an attachment that does not exist
- **THEN** the system returns 404 Not Found

### Requirement: Maximum of 10 attachments per showcase

The system SHALL enforce a limit of 10 attachments per department showcase.

#### Scenario: Upload when limit reached
- **WHEN** a director attempts to upload an attachment to a showcase that already has 10 attachments
- **THEN** the system returns 400 Bad Request with message "Maximum of 10 attachments reached"
