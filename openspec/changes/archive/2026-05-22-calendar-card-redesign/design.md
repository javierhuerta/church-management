## Context

The current `EventCard` component renders a background cover image at 12-22% opacity over the entire card surface. This was intended to provide visual richness but achieves the opposite: text legibility suffers significantly, especially for events with dark cover images or colorful photography. The cover becomes pure noise that competes with the actual event information.

The component is shared between mobile and desktop views, which compounds the problem — mobile users see the full-width card where the background image approach is most disruptive (no popover is feasible in mobile contexts).

Additional issues:
- Department badges derive initials from the department name (e.g., "Jóvenes" → "JO") which is unreliable and inconsistent for multi-word or accented names.
- The `OrganizerResponseDto` uses `@Transform()` to map raw `EventOrganizer[]` entities to DTOs. This transform fires even when the relation is not loaded, causing potential null reference issues.
- The `sigla` field does not exist on the `Department` entity, so there's no standardized short identifier for departments.

## Goals / Non-Goals

**Goals:**
- Restore full legibility to event card content on mobile and desktop
- Provide rich event detail via popover on desktop without cluttering the card itself
- Add `sigla` field to Department for reliable, consistent department identification
- Fix organizer persistence/retrieval in event forms
- Clean up unused `Transform` decorators in `EventResponseDto`

**Non-Goals:**
- Redesigning the calendar grid view (only list view cards are in scope)
- Changing the event detail page (full page `/calendario/:slug`)
- Adding new event types or modifying event creation workflow beyond bug fixes
- Redesigning the popover component itself (reuse existing primitives)

## Decisions

### Decision 1: Mobile card uses cover as header image (not background)

**Choice**: Display cover image as a fixed-aspect-ratio header strip at the top of the card (similar to a news card), with all text content below on a clean background.

**Rationale**: Mobile cards are full-width with no hover interaction available. A background overlay is the worst possible pattern for mobile (small screens, variable cover brightness). Placing the image as a header gives visual richness while keeping content fully legible below.

**Alternative considered**: Remove cover entirely on mobile. Rejected — covers provide emotional/contextual connection to the event that is valuable.

### Decision 2: Desktop card is minimal + popover on hover

**Choice**: Desktop cards show a clean card (no cover background). On hover/focus, a popover displays the cover image and full event detail.

**Rationale**: Desktop has hover capability, making progressive disclosure practical. The minimal card preserves scannability; the popover enables depth when needed.

**Alternative considered**: Keep current background approach but reduce opacity further. Rejected — even at 5% opacity a busy photo overwhelms small text.

**Implementation**: Use a `Popover` component (from shadcn/ui) anchored to the card, triggered on hover and on focus. The popover contains a `CoverImage` header + all event metadata. Keyboard accessible via `onFocus` trigger.

### Decision 3: Department badge shows `sigla` (not derived initials)

**Choice**: Display `department.sigla` (e.g., "JOV", "FAM") in the department badge instead of deriving initials from the name.

**Rationale**: `sigla` is explicit, consistent, and controlled by the admin. Deriving initials breaks for multi-word names ("Escuela Sabática" → "ES" vs "Esc Sab" expected). The `sigla` field is a simple short string (max 10 chars).

**Migration**: The field is added as nullable with no default. Existing departments will have `sigla = null`, and the badge will be hidden for those. Seeders will be updated with realistic siglas.

### Decision 4: Fix `OrganizerResponseDto` — move transform to service layer

**Choice**: Remove the `@Transform()` decorator from `OrganizerResponseDto.organizers` in `EventResponseDto`. Move the mapping logic to the `CalendarService.loadOne()` / repository query so the relation is pre-mapped before serialization.

**Rationale**: The `@Transform()` decorator fires on every serialization pass (including when the relation is not loaded, returning `undefined`). This causes inconsistent organizer data. By pre-mapping in the service/repository, we ensure consistent structure and the DTO becomes a simple passthrough.

**Alternative considered**: Keep `@Transform()` but add null guards. Rejected — the service-layer approach is more explicit and easier to test.

### Decision 5: Remove unused `Transform` decorators from `EventResponseDto`

**Choice**: Remove the `@Transform()` calls for `departmentName`, `departmentColor`, and `coverImageUrl` since the new architecture accesses these directly from loaded relations in the service layer.

**Rationale**: These transforms are redundant — the data comes from the `department` and `attachments` relations that are already loaded. They add complexity and potential null-reference bugs. The frontend will access `event.department?.name`, `event.department?.color`, and `event.attachments?.find(a => a.isCover)?.url` directly.

## Risks / Trade-offs

[Risk] Popover on hover may feel slow on touch devices  
[Mitigation] Popover on desktop is hover-only; touch devices use mobile card layout without popover (full card is shown).

[Risk] `sigla` is nullable — existing departments won't have it  
[Mitigation] Badge is hidden when `sigla` is null. Seeders will backfill siglas for all existing departments.

[Risk] Removing `@Transform()` in `OrganizerResponseDto` breaks existing `organizers` field in response  
[Mitigation] The organizers will still be serialized — just through a pre-mapped service method instead of a class-transformer decorator. The response shape remains identical.

[Risk] Mobile cards with large cover images may cause layout shift  
[Mitigation] Use `aspect-ratio` CSS on the header image container with `object-fit: cover` to enforce consistent dimensions.

## Migration Plan

1. Add `sigla` column to `departments` table (nullable, no default, no unique constraint initially — unique constraint deferred until all departments have siglas)
2. Update `Department` entity, DTOs, service, controller
3. Regenerate OpenAPI schema and frontend API types
4. Update `DepartmentFormPage` to include `sigla` field
5. Update seeders to add siglas for all departments
6. Implement mobile card redesign (cover as header)
7. Implement desktop card with popover
8. Fix organizers in `EventResponseDto` (move to service layer)
9. Clean up unused transforms in `EventResponseDto`
10. Update `CalendarList` to show `department.sigla` in badges
11. QA: verify organizers save/retrieve, mobile/desktop cards render correctly

## Open Questions

1. Should `sigla` be unique across departments? (Recommended: yes, once all departments have one)
2. Should the `Popover` use an existing shadcn popover or a custom implementation? (shadcn Popover)
3. What aspect ratio for the mobile card header image? (16:9)

## UI Scenarios

### Scenario: Mantenedor departamentos — crear con sigla
**URL**: `/mantenedores/departamentos/nuevo`
**Description**: Verificar que el campo sigla aparece en el formulario de departamento y se guarda correctamente

**Steps**:
1. Navigate to `/mantenedores/departamentos/nuevo`
2. Expect element `#sigla` input to exist
3. Fill `#sigla` with `QA1`
4. Fill `#name` with `Departamento QA Test`
5. Click `[type="submit"]`
6. Wait for navigation to `/mantenedores/departamentos`
7. Expect text `QA1` to be visible in the list

**ASCII Wireframe** (expected final state):
```
┌────────────────────────────────────┐
│ ← Volver         Nuevo departamento │
│                                          │
│ Nombre *   [____________]             │
│ Sigla      [QAT    ] (max 10 chars)  │
│ Color      [○ ○ ○ ○ ○]                │
│                       [Crear dept.] │
└────────────────────────────────────┘
```

---

### Scenario: Mantenedor departamentos — список muestra sigla
**URL**: `/mantenedores/departamentos`
**Description**: Verificar que la sigla aparece como badge junto al nombre en la lista de departamentos

**Steps**:
1. Navigate to `/mantenedores/departamentos`
2. Wait for text `JA (Jóvenes Adventistas)` to be visible
3. Expect badge with text `JA` to be visible

**ASCII Wireframe** (expected final state):
```
┌─────────────────────────────────────────┐
│ Departamentos         [Buscar] [+ Nuevo] │
│                                            │
│ ┌──────────────────────────────┐           │
│ │ (●) JA (Jóvenes Adventistas)  │ [✎] [🗑] │
│ │     2 directores    [JA]      │           │
│ └──────────────────────────────┘           │
│ ┌──────────────────────────────┐           │
│ │ (●) ASA                       │ [✎] [🗑] │
│ │     Sin directores   [ASA]   │           │
│ └──────────────────────────────┘           │
└─────────────────────────────────────────┘
```

---

### Scenario: Calendario vista mobile — tarjeta con cover como header
**URL**: `/calendario` (vista mobile)
**Description**: En móvil, la tarjeta del evento debe mostrar la imagen de cover como header sin overlay de opacidad

**Steps**:
1. Navigate to `/calendario`
2. Resize viewport to mobile (375x812)
3. Wait for event cards to load
4. Expect first event card with cover image to show image as a full-width header at top
5. Expect card text (title, date, badges) to be below the image on a clean background (no overlay)
6. Take screenshot

**ASCII Wireframe** (expected final state):
```
┌──────────────────────────┐
│  [COVER IMAGE 16:9]     │  ← full width, no opacity
│                          │
│ ● Título del evento      │
│   22 may · 10:00–12:00  │
│   📍 Ubicación            │
│   [JOV] [Culto]          │
└──────────────────────────┘
```

---

### Scenario: Calendario vista desktop — tarjeta minimal con popover
**URL**: `/calendario` (vista desktop)
**Description**: En desktop, la tarjeta es minimal (sin cover background) y al hacer hover aparece un popover con cover y detalle completo

**Steps**:
1. Navigate to `/calendario`
2. Resize viewport to desktop (1280x800)
3. Wait for event cards to load
4. Hover over first event card
5. Expect popover to appear showing: cover image, title, description snippet, date, location, meeting URL, department badge, organizers, event type badge
6. Take screenshot

**ASCII Wireframe** (expected final state):
```
Card (no background image):
┌──────────────────────────┐
│ ● Título del evento      │
│   22 may · 10:00–12:00  │
│   📍 Ubicación   [JOV]  │
└──────────────────────────┘

Popover on hover:
┌──────────────────────────────────┐
│  [COVER IMAGE 16:9]              │
│                                  │
│  Título del evento               │
│  Descripción breve del evento... │
│                                  │
│  22 may · 10:00–12:00           │
│  📍 Ubicación                    │
│  🔗 zoom.us/j/123456789          │
│  👤 Juan Pérez, María García     │
│                                  │
│  [JOV] [Culto Local]   Ver →    │
└──────────────────────────────────┘
```

---

### Scenario: Crear evento con organizadores — verificar persistencia
**URL**: `/calendario/nuevo`
**Description**: Al crear un evento con organizadores (usuario del sistema + texto libre), estos deben guardarse y aparecer al editar el evento

**Steps**:
1. Navigate to `/calendario/nuevo` (as editor)
2. Fill `#title` with `Evento QA Organizers Test`
3. Fill start date to tomorrow, end date 2 hours later
4. Select event type "Local"
5. In organizadores field, search for existing user and add
6. Add a text-only organizer
7. Click `[type="submit"]`
8. Wait for navigation to event detail page
9. Expect organizers to appear in the event detail
10. Navigate back to `/calendario`
11. Open the created event for edit
12. Expect organizers to be pre-filled (persisted)

**ASCII Wireframe** (expected final state):
```
Organizers field (form):
┌──────────────────────────────────────────┐
│ 🔍 Buscar usuario o escribir nombre…     │
│                                          │
│ [Juan Pérez ✕]  [Organizador texto ✕]   │
└──────────────────────────────────────────┘

Event detail page:
┌──────────────────────────────────────────┐
│ Organizadores                           │
│ 👤 Juan Pérez · Pastor                   │
│    Organizador texto                     │
└──────────────────────────────────────────┘
```
