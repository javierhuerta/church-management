## MODIFIED Requirements

### Requirement: Application provides consistent layout structure

The system SHALL provide a consistent layout structure that includes a sidebar navigation with branding, main content area with neutral background, and footer with branding. All protected pages use this layout.

#### Scenario: Sidebar displays application navigation
- **WHEN** user is on any protected page
- **THEN** sidebar shows module menu (Calendario, Cultos, Misión) with church branding header and user profile section at bottom

#### Scenario: Sidebar shows user profile with logout option
- **WHEN** user is on any protected page and sidebar is visible
- **THEN** sidebar displays user avatar, name, role, and dropdown with profile/logout options and text size selector

#### Scenario: Main content area renders child components
- **WHEN** user is on a protected page
- **THEN** main content area displays the current page's content with neutral background color (#f5f5f5)

#### Scenario: Layout is not shown on public routes
- **WHEN** user is on /login or other public routes
- **THEN** only the page component is rendered without the layout wrapper

#### Scenario: Layout supports text size preference
- **WHEN** user has selected a text size preference
- **THEN** layout components respect the text size setting (text-sm/text-base/text-lg on root)

#### Scenario: Footer displays branding
- **WHEN** user is on any protected page
- **THEN** footer shows church logo, name "Iglesia Adventista del Séptimo Día de Osorno Central", and copyright "© 2026 — Sistema de Gestión Eclesiástica"

### Requirement: Login page provides branded authentication interface

The system SHALL provide a login page with church branding, gradient background, and styled form components.

#### Scenario: User sees branded login page
- **WHEN** user navigates to /login
- **THEN** page displays gradient background (neutral-50 to blue-50)
- **AND** centered card with church logo, title "Iglesia Adventista", and description
- **AND** form with styled inputs (icons, rounded borders) and gradient submit button

#### Scenario: Login form shows validation errors
- **WHEN** user submits invalid credentials
- **THEN** error message displays in a styled alert box with icon and red styling