## MODIFIED Requirements

### Requirement: Application provides consistent layout structure

The system SHALL provide a consistent layout structure that includes a sidebar navigation with branding, main content area, and footer with branding. All protected pages use this layout. All layout colors SHALL use semantic design tokens so the layout is visually correct in both light and dark themes.

#### Scenario: Sidebar displays application navigation
- **WHEN** user is on any protected page
- **THEN** sidebar shows module menu (Calendario, Cultos, Misión) with church branding header and user profile section at bottom

#### Scenario: Sidebar shows user profile with logout option
- **WHEN** user is on any protected page and sidebar is visible
- **THEN** sidebar displays user avatar, name, role, and dropdown with profile/logout options, text size selector, and theme toggle

#### Scenario: Main content area renders child components
- **WHEN** user is on a protected page
- **THEN** main content area displays the current page's content using `bg-muted` semantic background token

#### Scenario: Layout is not shown on public routes
- **WHEN** user is on /login or other public routes
- **THEN** only the page component is rendered without the layout wrapper

#### Scenario: Layout supports text size preference
- **WHEN** user has selected a text size preference
- **THEN** layout components respect the text size setting

#### Scenario: Footer displays branding
- **WHEN** user is on any protected page
- **THEN** footer shows church logo, name "Iglesia Adventista del Séptimo Día de Osorno Central", and copyright "© 2026 — Sistema de Gestión Eclesiástica"
- **AND** footer uses `bg-card` and `border-border` semantic tokens

### Requirement: Login page provides branded authentication interface

The system SHALL provide a login page with church branding and styled form components using semantic design tokens compatible with the active theme.

#### Scenario: User sees branded login page
- **WHEN** user navigates to /login
- **THEN** page displays branded layout with church logo, title "Iglesia Adventista", and description
- **AND** form uses `bg-card`, `border-border`, and `text-foreground` semantic tokens

#### Scenario: Login form shows validation errors
- **WHEN** user submits invalid credentials
- **THEN** error message displays using `bg-destructive/10 text-destructive` semantic tokens