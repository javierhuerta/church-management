## Why

The church needs a comprehensive calendar system to manage events across different departments (Youth, Family, Mission, etc.) with support for local, ASACH, and district events. Events need to be shareable via public links with social media integration, include meeting links for virtual gatherings, and support attachments like photos and documents after events. The system must differentiate between editors (Pastor, Secretary, Admin) who can create/edit events and regular users who can only view published events.

## What Changes

- **Backend**: New/modified NestJS module for calendar events with:
  - Event entity with status (draft/published/archived), type, department, meeting URL
  - Media attachments support (images, PDFs, documents, videos) with 10 max limit
  - Public endpoint for event detail (no auth required for published events)
  - Role-based endpoint protection (editor roles can modify)

- **Frontend**: New calendar UI with:
  - Monthly grid view (desktop) with filters by type and department
  - List view by day (mobile) with same filters
  - Event detail page with WYSIWYG description, gallery, sharing buttons
  - Event creation/editing forms (editor roles only)
  - Draft/publish workflow for event status

- **Public Sharing**: Event detail pages accessible without login for published events
  - Auto-generated share slugs
  - Social media share buttons (X, Facebook, Instagram)
  - Copy link functionality

## Capabilities

### New Capabilities
- `calendar-events`: Complete event lifecycle management (create, read, update, delete, publish) with status workflow, event types, department association, and meeting URL support
- `event-sharing`: Public event pages with shareable URLs and social media integration
- `event-attachments`: Media gallery for events with support for images, PDFs, documents, and videos (max 10 per event, configurable via environment variable)
- `calendar-permissions`: Role-based access control where editors (Pastor, Secretary, Admin) can manage all events while regular users view only published events

### Modified Capabilities
- `auth`: May need to expose current user role to frontend for permission checks on calendar actions

## Impact

- **Backend Module**: `calendar` module (new or modified)
- **New Entities**: Event, EventAttachment, EventOrganizer
- **API Endpoints**:
  - `GET /api/calendar` (public, filtered by status for anonymous)
  - `GET /api/calendar/:slug` (public for published)
  - `POST /api/calendar` (editor only)
  - `PATCH /api/calendar/:id` (editor only)
  - `DELETE /api/calendar/:id` (editor only)
  - `POST /api/calendar/:id/publish` (editor only)
  - `POST /api/calendar/:id/attachments` (editor only)
- **Frontend Components**:
  - Calendar page with monthly/list views
  - Event detail page with sharing
  - Event form (create/edit)
  - Attachment upload/gallery
- **Dependencies**:
  - TipTap or similar for WYSIWYG editor
  - File upload handling (multer or similar)
  - Social sharing SDKs or URL builders

## Out of Scope

- Recurring events (future enhancement)
- Event attendance/registration
- Email notifications for events
- Calendar sync with external services (Google Calendar, Outlook)
- Mobile app-specific views
- Video streaming integration (only meeting link provided, not embedded)