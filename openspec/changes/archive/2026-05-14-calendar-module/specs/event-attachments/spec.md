## ADDED Requirements

### Requirement: Event attachments support

The system SHALL allow editors to attach files (images, documents, videos) to events up to a maximum limit.

#### Scenario: Editor uploads attachment
- **WHEN** editor is on event detail/edit page
- **THEN** "Agregar adjunto" button allows selecting files from device

#### Scenario: Attachment count limit
- **WHEN** editor attempts to add an attachment
- **THEN** system checks if current attachment count < 10
- **AND** if at limit, show warning "Máximo 10 adjuntos por evento"

#### Scenario: File type validation
- **WHEN** editor selects a file to upload
- **THEN** file type is validated against allowed list:
  - Images: jpg, jpeg, png, gif, webp
  - Documents: pdf, doc, docx, xls, xlsx
  - Video: mp4, webm
- **AND** if type not allowed, show error "Tipo de archivo no permitido"

#### Scenario: File size validation
- **WHEN** editor selects a file to upload
- **THEN** file size is validated (max 10MB per file, configurable via environment variable)
- **AND** if too large, show error "Archivo excede el tamaño máximo de 10MB"

#### Scenario: Attachment uploaded successfully
- **WHEN** file passes validation and upload completes
- **THEN** attachment record is created in database
- **AND** attachment appears in event's attachment gallery

### Requirement: Attachment gallery display

The system SHALL display attached files in a gallery format on the event detail page.

#### Scenario: Gallery displays images
- **WHEN** event has image attachments
- **THEN** images are displayed in a responsive grid (2-4 columns depending on screen size)
- **AND** clicking an image opens a lightbox modal for full-size viewing

#### Scenario: Gallery displays documents
- **WHEN** event has document attachments (PDF, Word, Excel)
- **THEN** documents are displayed as file cards with icon, filename, and size
- **AND** clicking a document card opens/downloads the file

#### Scenario: Gallery displays videos
- **WHEN** event has video attachments
- **THEN** videos are displayed as thumbnail cards with play icon
- **AND** clicking a video opens a modal with video player

#### Scenario: Gallery is empty
- **WHEN** event has no attachments
- **THEN** gallery section is not displayed
- **AND** only the event description is shown (no empty gallery placeholder)

### Requirement: Cover image designation

The system SHALL allow one attachment to be designated as the cover image for the event.

#### Scenario: Editor sets cover image
- **WHEN** editor is viewing attachment gallery in edit mode
- **THEN** each image has a "Marcar como portada" option
- **AND** clicking it marks that image as the cover

#### Scenario: Cover image is displayed
- **WHEN** event detail page is rendered
- **THEN** the cover image is displayed prominently at the top of the page

#### Scenario: Editor removes cover image designation
- **WHEN** cover image already exists and editor selects a different one
- **THEN** new image becomes cover
- **AND** previous image loses cover status (remains as regular attachment)

### Requirement: Attachment deletion

The system SHALL allow editors to remove attachments from events.

#### Scenario: Editor deletes attachment
- **WHEN** editor clicks delete icon on an attachment
- **THEN** confirmation dialog is shown

#### Scenario: Editor confirms deletion
- **WHEN** editor confirms deletion
- **THEN** attachment record is deleted from database
- **AND** file is removed from storage
- **AND** if it was the cover, no cover image remains (use default)