## ADDED Requirements

### Requirement: Application provides consistent layout structure

The system SHALL provide a consistent layout structure that includes a header (navbar), main content area, and footer that appears on all protected pages.

#### Scenario: Header displays application title and navigation
- **WHEN** user is on any protected page
- **THEN** header shows "Iglesia Adventista" title and basic navigation

#### Scenario: Main content area renders child components
- **WHEN** user is on a protected page
- **THEN** main content area displays the current page's content

#### Scenario: Footer displays copyright information
- **WHEN** user is on any protected page
- **THEN** footer shows "© 2026 Iglesia Adventista del Séptimo Día de Osorno Central"

#### Scenario: Layout is not shown on public routes
- **WHEN** user is on /login or other public routes
- **THEN** only the page component is rendered without the layout wrapper