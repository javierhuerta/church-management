# Event Sharing — Public Event Pages and Social Sharing

## Purpose

Provide publicly accessible event detail pages via readable shareable URLs, with Open Graph meta tags and social media share buttons. No authentication required to view published events.

## Requirements

### Requirement: Public event pages

The system SHALL provide publicly accessible event detail pages via shareable URLs without requiring authentication.

#### Scenario: User accesses public event URL
- **WHEN** user navigates to /calendario/:slug for a published event
- **THEN** event detail page is displayed with all event information
- **AND** no login is required

#### Scenario: User accesses draft event URL without auth
- **WHEN** user navigates to /calendario/:slug for a draft event without being logged in
- **THEN** 404 page is displayed (event not found)

#### Scenario: User accesses non-existent event URL
- **WHEN** user navigates to /calendario/:slug for a slug that doesn't exist
- **THEN** 404 page is displayed

### Requirement: Shareable event links

The system SHALL generate unique, readable shareable URLs for each event.

#### Scenario: Event URL is auto-generated
- **WHEN** event is created
- **THEN** a shareSlug is generated from title + date + short UUID
- **AND** format is: "title-lowercased-with-dashes-date-uuid"

#### Scenario: Event slug is preserved on edit
- **WHEN** editor modifies event title or dates
- **THEN** shareSlug remains unchanged to preserve sharing

#### Scenario: Event URL structure
- **WHEN** event has slug "culto-del-sabado-2026-06-15-a1b2c3"
- **THEN** public URL is /calendario/culto-del-sabado-2026-06-15-a1b2c3

### Requirement: Social media sharing

The system SHALL provide buttons to share event links on social media platforms.

#### Scenario: User shares on X (Twitter)
- **WHEN** user clicks X share button on event page
- **THEN** new tab opens with X composer containing pre-filled text and event URL

#### Scenario: User shares on Facebook
- **WHEN** user clicks Facebook share button on event page
- **THEN** new tab opens with Facebook sharer.php containing event URL

#### Scenario: User shares on Instagram
- **WHEN** user clicks Instagram share button
- **THEN** tooltip or modal shows the event URL to copy for manual sharing
- **AND** note that Instagram doesn't support programmatic posting from web

#### Scenario: User copies event link
- **WHEN** user clicks "Copiar enlace" button
- **THEN** event URL is copied to clipboard
- **AND** success toast notification is shown

### Requirement: Event cover image

The system SHALL display a cover image for event sharing on social media.

#### Scenario: Event has cover image uploaded
- **WHEN** event has an attached image marked as cover
- **THEN** og:image meta tag uses that image URL

#### Scenario: Event has no cover image
- **WHEN** event has no cover image uploaded
- **THEN** og:image meta tag uses default event image based on event type
- **AND** default images are type-specific (local, asach, distrital)

#### Scenario: Social sharing preview
- **WHEN** user shares event link on X or Facebook
- **THEN** preview shows: event title, date, event type, and cover image
