## 1. Backend — Department sigla

- [x] 1.1 Add `sigla` column to `departments` table (nullable string, max 10 chars)
- [x] 1.2 Update `Department` entity with `sigla: string | null` field
- [x] 1.3 Add `sigla` to `CreateDepartmentDto` (optional field with validation)
- [x] 1.4 Add `sigla` to `UpdateDepartmentDto` (optional field)
- [x] 1.5 Add `sigla` to `DepartmentResponseDto` with `@Expose()`
- [x] 1.6 Regenerate OpenAPI schema and frontend API types
- [x] 1.7 Update seeders to include `sigla` for all existing departments (JOV, FAM, MIS, etc.)

## 2. Backend — Organizers fix

- [x] 2.1 Remove `@Transform()` decorator from `EventResponseDto.organizers`
- [x] 2.2 Add explicit `organizers` field to `EventResponseDto` with proper `@Expose()`
- [x] 2.3 Move organizer mapping to service layer (pre-map in `findOneWithRelations` or a dedicated method)
- [x] 2.4 Remove unused `@Transform()` decorators for `departmentName`, `departmentColor`, `coverImageUrl` in `EventResponseDto`
- [x] 2.5 Add direct `department` and `attachments` relations access in frontend (no transform needed)

## 3. Frontend — Department mantenedor with sigla

- [x] 3.1 Add `sigla` field to `DepartmentFormPage` (text input, max 10 chars)
- [x] 3.2 Update `departments-list-page` to show `sigla` column in the list
- [x] 3.3 Ensure `CreateDepartmentDto` and `UpdateDepartmentDto` in generated API include `sigla`

## 4. Frontend — Event card redesign (mobile)

- [x] 4.1 Create `MobileEventCard` component or refactor `EventCard` to support mobile-only layout
- [x] 4.2 Mobile card: cover image as full-width header (aspect-ratio 16:9, object-fit cover)
- [x] 4.3 Mobile card: content below on clean background (no overlay, no opacity)
- [x] 4.4 Mobile card: department badge shows `department.sigla` (fallback to hidden if null)
- [x] 4.5 Update `CalendarList` to use mobile card component (detect mobile via CSS breakpoint or hook)

## 5. Frontend — Event card redesign (desktop)

- [x] 5.1 Desktop card: minimal plain card (no cover background, no opacity)
- [x] 5.2 Desktop card: add shadcn `Popover` on hover/focus with full event detail
- [x] 5.3 Popover content: cover image header + title, description, date range, location, meeting URL, department, organizers, event type badge
- [x] 5.4 Popover: keyboard accessible (focus trigger, Escape to close)
- [x] 5.5 Update `CalendarList` to use desktop card component with popover

## 6. Frontend — Calendar card badge and sigla integration

- [x] 6.1 Update badge logic to use `event.department?.sigla` instead of deriving initials
- [x] 6.2 Hide department badge when `sigla` is null
- [x] 6.3 Ensure `EventResponseDto` frontend type has `department: { id, name, color, sigla } | null`
- [x] 6.4 Update `calendar-grid.tsx` `MultiDayBand` to use the same badge logic

## 7. Verification

- [ ] 7.1 Create an event with cover, department, and organizers — verify organizers persist and load
- [ ] 7.2 Create a department with sigla — verify it shows in the mantenedor list and on event cards
- [ ] 7.3 Verify mobile card renders cover as header with legible text
- [ ] 7.4 Verify desktop card shows popover on hover with all event data
- [ ] 7.5 Verify organizers appear correctly in the event detail/popover

