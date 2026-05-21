## MODIFIED Requirements

### Requirement: Editor can upload a custom cover image from the event form

The system SHALL allow editors to upload an image file from their device and set it as the event's cover image. The upload SHALL use the generated OpenAPI client (`CalendarService.calendarControllerUploadCover`) instead of a direct `fetch()` call with manual token management.

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

#### Scenario: Upload uses the generated OpenAPI client
- **WHEN** editor confirms the cropped cover image
- **THEN** the upload is performed via `CalendarService.calendarControllerUploadCover(eventId, formData)`
- **AND** the Bearer token is injected automatically by the OpenAPI client (not manually added to headers)
- **AND** the `API_URL` constant from `src/lib/api-client.ts` is NOT used in this flow
