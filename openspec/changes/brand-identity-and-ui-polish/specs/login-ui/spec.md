## MODIFIED Requirements

### Requirement: User can log in with email and password
The system SHALL provide a login page where users can authenticate with their email and password credentials. The login page SHALL use semantic design tokens, display the church SVG logo (`logo.svg`), and provide theme and text-size controls accessible before authentication.

#### Scenario: Successful login with valid credentials
- **WHEN** user enters valid email and password and clicks "Iniciar Sesión"
- **THEN** system authenticates user, stores JWT token, and redirects to dashboard

#### Scenario: Failed login with invalid credentials
- **WHEN** user enters invalid email or wrong password and clicks "Iniciar Sesión"
- **THEN** system displays error message "Credenciales inválidas" using `text-destructive` semantic token and keeps user on login page

#### Scenario: Login form validation
- **WHEN** user submits login form without filling required fields
- **THEN** system displays validation errors for empty email and password fields

#### Scenario: User is redirected to login when not authenticated
- **WHEN** user tries to access a protected route without being logged in
- **THEN** system redirects user to /login page

#### Scenario: Logo is visible on the login page
- **WHEN** the login page is rendered
- **THEN** the church SVG logo is displayed prominently above the login form

#### Scenario: Theme toggle is accessible on login page
- **WHEN** the login page is rendered
- **THEN** a theme toggle with Light / Dark / System options is visible without requiring authentication

#### Scenario: Text size selector is accessible on login page
- **WHEN** the login page is rendered
- **THEN** a text size selector is visible and functional without requiring authentication

#### Scenario: Login page uses two-column layout on desktop
- **WHEN** the login page is rendered on a viewport wider than 1024px
- **THEN** the left half shows a branding panel with logo and tagline, and the right half shows the login form
