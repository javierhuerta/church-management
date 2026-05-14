## 1. Backend Setup and Data Model

- [x] 1.1 Update Event entity with new fields (status, eventType, department, meetingUrl, shareSlug)
- [x] 1.2 Create EventAttachment entity (eventId, filename, originalName, mimeType, size, isCover, url)
- [x] 1.3 Create EventOrganizer entity (eventId, userId) for many-to-many relationship
- [x] 1.4 Add enum types: EventStatus (draft/published/archived), EventType (local/asach/distrital), MeetingType (zoom/meet/teams/other)
- [x] 1.5 Create/update migrations for new entities
- [x] 1.6 Update seed data if needed

## 2. Backend API Endpoints

- [x] 2.1 Create calendar module structure (calendar.controller.ts, calendar.service.ts, dto/)
- [x] 2.2 GET /api/calendar - list events with filters (type, department, date range)
- [x] 2.3 GET /api/calendar/:id - get single event with attachments and organizers
- [x] 2.4 GET /api/calendar/slug/:slug - public endpoint for shareable URL
- [x] 2.5 POST /api/calendar - create event (editor only)
- [x] 2.6 PATCH /api/calendar/:id - update event (editor only)
- [x] 2.7 DELETE /api/calendar/:id - delete event and attachments (editor only)
- [x] 2.8 POST /api/calendar/:id/publish - change status to published (editor only)
- [x] 2.9 POST /api/calendar/:id/attachments - upload attachment (editor only)
- [x] 2.10 DELETE /api/calendar/:id/attachments/:attachmentId - delete attachment (editor only)
- [x] 2.11 Add role guards to protected endpoints
- [x] 2.12 Generate OpenAPI schema for frontend client regeneration

## 3. File Upload Infrastructure

- [x] 3.1 Configure multer for file uploads in backend
- [x] 3.2 Create uploads directory with static serving
- [x] 3.3 Implement file type validation (images, pdf, doc, xls, mp4)
- [x] 3.4 Implement file size validation (10MB max)
- [x] 3.5 Create attachment cleanup on event deletion

## 4. Frontend Calendar Page - Basic

- [x] 4.1 Create calendar page route /calendario
- [x] 4.2 Install TipTap WYSIWYG editor
- [x] 4.3 Create calendar API client methods (regenerate from OpenAPI)
- [x] 4.4 Create useCalendar hook for data fetching
- [x] 4.5 Implement filter controls (type dropdown, department dropdown, month selector)
- [x] 4.6 Create monthly grid view component (desktop)
- [x] 4.7 Create day list view component (mobile)
- [x] 4.8 Create event card component for grid/list display
- [x] 4.9 Implement responsive switching (grid on desktop, list on mobile)

## 5. Frontend Event Detail Page

- [x] 5.1 Create event detail page route /calendario/[slug]
- [x] 5.2 Create event detail layout component
- [x] 5.3 Display event cover image (or default based on type)
- [x] 5.4 Display event title, dates, location, meeting link
- [x] 5.5 Display event description (render WYSIWYG HTML)
- [x] 5.6 Display organizers list with avatars
- [x] 5.7 Create attachment gallery component (images, documents, videos)
- [x] 5.8 Create lightbox modal for image viewing
- [x] 5.9 Create meeting join button component

## 6. Frontend Sharing Features

- [x] 6.1 Create share buttons component (X, Facebook, Instagram, copy link)
- [x] 6.2 Implement copy to clipboard functionality
- [x] 6.3 Build social share URL builders (X intent, Facebook sharer)
- [x] 6.4 Add OG meta tags for proper social preview (og:title, og:description, og:image)
- [x] 6.5 Test sharing on different platforms

## 7. Frontend Event Form (Editor Only)

- [x] 7.1 Create event form component with fields
- [x] 7.2 Integrate TipTap WYSIWYG editor for description
- [x] 7.3 Create date/time picker inputs
- [x] 7.4 Create type and department selectors
- [x] 7.5 Create meeting URL input with validation
- [x] 7.6 Create location input
- [x] 7.7 Create organizers multi-select (search users)
- [x] 7.8 Create attachment upload zone with progress
- [x] 7.9 Create attachment gallery with delete and cover designation
- [x] 7.10 Create status change buttons (Publish, Archive, Delete)
- [x] 7.11 Add role-based visibility for edit controls

## 8. Backend Permissions Refinement

- [x] 8.1 Verify JWT middleware extracts user role correctly
- [x] 8.2 Add editor role check to create/update/delete endpoints
- [x] 8.3 Verify public endpoint returns 404 for draft events when not authenticated
- [x] 8.4 Verify editor can access all events including drafts

## 9. Testing and Polish

- [x] 9.1 Test calendar view with various filters
- [x] 9.2 Test event CRUD as editor role
- [x] 9.3 Test public access to published events
- [x] 9.4 Test sharing buttons and copy link
- [x] 9.5 Test attachment upload (images, PDFs, videos)
- [x] 9.6 Test mobile list view layout
- [x] 9.7 Test event detail page responsive design
- [x] 9.8 Verify build passes with no errors
- [x] 9.9 Add loading skeletons for better UX
- [x] 9.10 Add empty state messages (no events for selected filters)