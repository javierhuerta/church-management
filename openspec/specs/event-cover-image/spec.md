# Event Cover Image

## Purpose

Allow editors to set a cover image for calendar events, either by uploading a local file or searching an external photo provider (Unsplash). Images are cropped to 16:9 in the browser and optimized on the server before storage.

## Requirements

### Requirement: Editor can upload a custom cover image from the event form

The system SHALL allow editors to upload an image file from their device and set it as the event's cover image, directly from the event create/edit form (not hidden under the attachments section).

#### Scenario: Editor uploads a JPEG cover for a new event
- **WHEN** editor opens the cover image picker, selects a local JPEG, crops it to the 16:9 ratio shown in the picker, and confirms
- **THEN** the event is saved with that image as its cover, displayed in the event detail page

#### Scenario: Editor replaces an existing cover
- **WHEN** an event already has a cover image and the editor selects a new image and confirms
- **THEN** the previous cover attachment is removed and the new one is saved with `isCover=true`

#### Scenario: Editor uploads a non-image file
- **WHEN** editor selects a file whose MIME type is not `image/*`
- **THEN** the picker rejects the file with a visible error and no upload is attempted

#### Scenario: Editor uploads a file larger than 10 MB
- **WHEN** editor selects an image larger than 10 MB
- **THEN** the picker rejects the file with a visible error before sending anything to the server

### Requirement: Cover image is cropped to 16:9 and optimized before storage

The system SHALL crop the cover image to a 16:9 aspect ratio in the browser using an interactive cropper, and the server SHALL re-encode the result to at most 1600×900 pixels with quality optimized for web display.

#### Scenario: Editor crops a tall portrait photo
- **WHEN** editor selects a 1080×1920 portrait photo and uses the cropper to choose a region
- **THEN** only the selected 16:9 region is uploaded, and the stored file is no larger than 1600×900

#### Scenario: Server receives an over-sized image
- **WHEN** the client uploads a 4000×2250 image (already 16:9 but too large)
- **THEN** the server re-encodes it to 1600×900 max dimensions at quality 80 before storing

#### Scenario: Server receives an image that does not match 16:9
- **WHEN** the client uploads an image whose aspect ratio is not 16:9 (e.g., bypassing the UI)
- **THEN** the server crops it centered to 16:9 before storing

### Requirement: Editor can search and pick a suggested image from Unsplash

The system SHALL provide a search panel that queries an external free photo provider (Unsplash) using terms derived from the event (title + department by default) and lets the editor pick a suggested image as the cover.

#### Scenario: Editor opens the search tab with default query
- **WHEN** editor opens the "Buscar" tab on a new event titled "Retiro espiritual GTeen" with department "GTeen"
- **THEN** the panel shows image results for the query "Retiro espiritual GTeen" without requiring the editor to type anything

#### Scenario: Editor picks a suggested image
- **WHEN** editor clicks on a result in the search panel
- **THEN** the chosen image is loaded into the cropper for adjustment before being saved as the cover

#### Scenario: External provider returns no results
- **WHEN** the search returns zero results for the query
- **THEN** the panel shows a helpful empty state and allows the editor to refine the query or switch to upload

#### Scenario: External provider is unavailable
- **WHEN** the external provider responds with 429, 5xx, or the integration key is missing
- **THEN** the search tab shows a clear "no disponible" message and the upload tab keeps working

### Requirement: Search requests are proxied through the backend

The system SHALL keep the external provider credentials on the server. The frontend SHALL NOT call the provider directly.

#### Scenario: Frontend requests suggestions
- **WHEN** the frontend calls `GET /calendar/cover-suggestions?query=...`
- **THEN** the backend authenticates with its own provider credentials and returns a normalized response of `{ id, thumbUrl, fullUrl, downloadUrl, author, authorUrl, color }[]`

#### Scenario: Missing provider credentials
- **WHEN** the backend is not configured with `UNSPLASH_ACCESS_KEY`
- **THEN** `GET /calendar/cover-suggestions` responds with HTTP 503 and an explanatory `message`

### Requirement: Provider attribution is preserved on stored covers

When the cover was chosen from an external provider, the system SHALL record the original author and source URL on the resulting attachment so it can be displayed for attribution.

#### Scenario: Cover from provider is stored with attribution
- **WHEN** an editor saves a cover chosen from the Unsplash search panel
- **THEN** the resulting attachment is persisted with `sourceAuthor` and `sourceUrl` matching the provider's metadata

#### Scenario: Uploaded cover from device has no attribution
- **WHEN** an editor saves a cover uploaded from their device
- **THEN** the attachment is persisted with `sourceAuthor=null` and `sourceUrl=null`

#### Scenario: Detail page renders attribution
- **WHEN** the event detail page renders a cover whose attachment has `sourceAuthor` set
- **THEN** a small caption "Foto: \<author\> en Unsplash" is shown below the image and the author name links to `sourceUrl`

### Requirement: Only editors can manage the cover

The system SHALL restrict the upload-cover and suggestion endpoints to users with editor roles (Admin, Pastor, Secretaria, Director).

#### Scenario: Non-editor attempts to upload a cover
- **WHEN** a regular user calls `POST /calendar/:id/cover`
- **THEN** the system returns HTTP 403 Forbidden

#### Scenario: Non-editor attempts to search suggestions
- **WHEN** a regular user calls `GET /calendar/cover-suggestions`
- **THEN** the system returns HTTP 403 Forbidden
