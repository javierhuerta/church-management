# Event Card Display

## Purpose

Define how event cards are displayed in the calendar list for both mobile and desktop views, optimizing content legibility and providing rich detail through progressive disclosure (popover on desktop).

## ADDED Requirements

### Requirement: Mobile event card displays cover as header without overlay

In mobile view, the event card SHALL display the cover image as a full-width header at the top of the card with a fixed aspect ratio, with all event content displayed below the image on a clean background. No overlay, no opacity, no background image.

#### Scenario: Mobile card with cover image
- **WHEN** a mobile user views an event card for an event that has a cover image
- **THEN** the card shows the cover image as a header (100% width, aspect-ratio 16:9 or 2:1) followed by title, date, location, and badges on a plain background
- **AND** the cover image is NOT used as a background or overlay

#### Scenario: Mobile card without cover image
- **WHEN** a mobile user views an event card for an event without a cover image
- **THEN** the card shows a colored header strip using the department color (or event type default) followed by title, date, location, and badges

#### Scenario: Mobile card shows department sigla in badge
- **WHEN** a mobile user views an event card for an event with a department that has a sigla
- **THEN** the department badge shows the sigla (e.g., "JOV") instead of color-derived initials

### Requirement: Desktop event card is minimal with popover on hover

In desktop view, the event card SHALL display a minimal card with plain text (no cover background) and trigger a popover on hover/focus that shows the full event detail including the cover image.

#### Scenario: Desktop card minimal display
- **WHEN** a desktop user views an event card without hovering
- **THEN** the card shows a clean card with title, date, location, and badges on a solid background with no background image

#### Scenario: Desktop card popover shows on hover
- **WHEN** a desktop user hovers over or focuses an event card
- **THEN** a popover appears showing: cover image (if available), full title, description snippet, date range, location, meeting URL, department, organizers, and event type badge

#### Scenario: Desktop card popover has cover image
- **WHEN** the event has a cover image
- **THEN** the popover displays the cover image at the top (full width, aspect-ratio 16:9)
- **AND** the content below the image is fully legible on a clean background

#### Scenario: Desktop card popover keyboard accessible
- **WHEN** a desktop user tabs to an event card and presses Enter
- **THEN** the popover opens and is fully navigable with keyboard
- **AND** pressing Escape closes the popover

### Requirement: Event card displays department sigla

Event cards SHALL display the department's sigla in the department badge when a department is associated with the event.

#### Scenario: Card with department that has sigla
- **WHEN** an event belongs to a department with sigla "JOV"
- **THEN** the card shows "JOV" in the department badge

#### Scenario: Card with department without sigla
- **WHEN** an event belongs to a department with name "Jóvenes" but no sigla set
- **THEN** the badge is hidden or shows a fallback (no color dot derived from name)

### Requirement: Organizers are displayed in event detail

The event detail (popover on desktop, full card on mobile) SHALL display the list of organizers with their names.

#### Scenario: Organizers shown in popover
- **WHEN** a user views the popover of an event with organizers
- **THEN** each organizer is listed with their name (and role if available)
- **AND** text-only organizers show their displayName without any user icon

#### Scenario: Organizers shown on mobile card
- **WHEN** a mobile user views an event card for an event with organizers
- **THEN** the organizers are listed below the event details

---

## REMOVED Requirements

### Requirement: Event card displays cover as background with low opacity

**Reason**: The background cover at 12-22% opacity significantly reduces content legibility and provides no functional value compared to the new header + popover approach.

**Migration**: Mobile cards now use cover as a proper header image; desktop cards show cover in popover.

### Requirement: Event card derives department initials from name

**Reason**: Replaced by explicit `sigla` field on Department. Deriving initials from name is unreliable (multi-word names, accents) and inconsistent.

**Migration**: Use `department.sigla` when available; hide badge when no sigla is set.
