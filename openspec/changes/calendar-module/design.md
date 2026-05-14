## Context

The current system has a basic calendar module in legacy. We need to rebuild it with proper event management, sharing capabilities, and role-based permissions. The system must support:
- Public access to published events without login
- Role-based editing (Pastor, Secretary, Admin only)
- Media attachments with gallery display
- Meeting links for virtual events
- Social media sharing

## Goals / Non-Goals

**Goals:**
- Provide a calendar that works well on both desktop (grid view) and mobile (list view)
- Support event types: local, ASACH, district
- Allow optional department association
- Enable sharing via public links with social media buttons
- Support attachments (images, PDFs, documents, videos) with 10 max per event
- Provide WYSIWYG editor for event descriptions
- Differentiate between draft and published events
- Protect edit/delete actions for editor roles only

**Non-Goals:**
- Recurring events (use simple single events)
- Video streaming (just meeting link passthrough)
- Email notifications
- External calendar sync
- Attendance/registration system
- Mobile-specific app views

## Decisions

### 1. Event Slug Generation

**Decision**: Auto-generate slug from title + date using `slugify`, append short UUID for uniqueness.

**Format**: `culto-del-sabado-2026-06-15-a1b2c3`

**Rationale**: Ensures uniqueness while remaining readable. Date in slug helps with SEO and makes it clear which event.

**Alternative**: Pure UUID slug. Rejected - less readable and harder to share verbally.

### 2. WYSIWYG Editor

**Decision**: Use `@tiptap/react` (headless) with shadcn/ui components as base.

**Rationale**:
- Headless = full control over styling, integrates well with Tailwind
- Stable, well-maintained
- Extensions for images, links, lists, etc.
- JSON output is portable (could export to other formats)

**Alternative**: React Quill. Rejected - older, less flexible, not headless.

**Alternative**: Tiptap with starter kit. Decided against - we need full control over toolbar.

### 3. File Storage

**Decision**: Store files locally in `/uploads` directory, serve via static middleware.

**Rationale**: Simplest for MVP. Can migrate to S3/Cloudflare R2 later without changing API.

**Alternative**: Cloud storage (S3, R2). More complex, adds cost. Can implement in v2.

### 4. Meeting URL Validation

**Decision**: Accept any valid URL, validate format with regex for:
- `https://zoom.us/j/...`
- `https://meet.google.com/...`
- `https://teams.microsoft.com/...`
- Any other https:// URL

**Rationale**: Users may have other meeting types. Just validate it's a real URL.

### 5. Calendar View Architecture

**Decision**: Single `/calendario` page with responsive layout:
- Desktop (>768px): Grid view with 7 columns (Sun-Sat, starting Sunday)
- Mobile: List view grouped by day

**Rationale**:
- One URL, responsive behavior
- Grid doesn't work on mobile (too small)
- List view is natural for scrolling on phone

**Alternative**: Separate routes `/calendario/mensual` and `/calendario/lista`. Rejected - adds complexity without benefit.

### 6. Attachment Upload Flow

**Decision**:
1. User selects files (max 10, validated client + server)
2. Upload to `/api/calendar/:id/attachments` via multipart/form-data
3. Store file metadata in `event_attachment` table
4. Return attachment object with URL

**File types allowed**:
- Images: jpg, jpeg, png, gif, webp
- Documents: pdf, doc, docx, xls, xlsx
- Video: mp4, webm

**Size limit**: 10MB per file (configurable via environment)

### 7. Permission Checking

**Decision**:
- Backend: JWT middleware checks `request.user.role`
  - `GET /api/calendar` - allow all, filter by status if no JWT
  - `POST/PATCH/DELETE /api/calendar` - require editor role
- Frontend: Use `useAuth` hook to get current user role
  - Show/hide create/edit buttons based on role
  - API calls will be rejected anyway if unauthorized, but UI should not show options

**Editor roles**: `['Admin', 'Pastor', 'Secretaria']` (matches `UserRole` enum)

**Rationale**: Defense in depth - backend is source of truth, frontend just improves UX.

### 8. Public Event Access

**Decision**: `/calendario/:slug` route is public (no AuthGuard).

**Implementation**:
- Route outside of `ProtectedRoute` wrapper
- API `/api/calendar/:slug` checks if event is published
- If draft and no auth → 404
- If published → return event data

**Rationale**: Simple, matches requirement. Search engines can index published events.

## Risks / Trade-offs

[Risk] File upload large payload → **Mitigation**: 10MB limit per file, show progress, reject oversized

[Risk] WYSIWYG XSS vulnerability → **Mitigation**: Sanitize HTML on save, don't allow raw script tags

[Risk] Slug collision (same title, same day) → **Mitigation**: Append UUID suffix, check uniqueness before saving

[Risk] Mobile performance with many events → **Mitigation**: Paginate calendar API, lazy load event details

[Risk] Image heavy gallery slow to load → **Mitigation**: Use thumbnail placeholder, lazy load full images

## Migration Plan

1. **Phase 1**: Backend API
   - Create/update Event entity with new fields
   - Create attachment entity
   - Implement CRUD endpoints
   - Add role guards
   - Generate OpenAPI schema

2. **Phase 2**: Frontend Calendar UI
   - Calendar page with filters
   - Grid view (desktop) / List view (mobile)
   - Basic event display

3. **Phase 3**: Event Detail & Sharing
   - Event detail page
   - Share buttons (X, Facebook, copy link)
   - Public route for `/calendario/:slug`

4. **Phase 4**: Event Editing
   - Event form with WYSIWYG
   - Draft/publish workflow
   - Attachment upload
   - Meeting URL field

5. **Rollback**: Feature flag to switch between legacy and new calendar if issues arise.

## Open Questions

- **Default cover image**: Should we have a default event image if none uploaded? (Decided: yes, generate from event type)
- **Event deletion**: Soft delete (archived) or hard delete? (Decided: hard delete, no trash)
- **Event ordering in list**: By start date ascending or by created date? (Decided: by start date)
- **Timezone handling**: Store in UTC, display in local timezone? (Decided: UTC storage, display with timezone indicator)