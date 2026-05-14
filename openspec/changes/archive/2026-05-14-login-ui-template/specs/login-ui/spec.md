## ADDED Requirements

### Requirement: User can log in with email and password

The system SHALL provide a login page where users can authenticate with their email and password credentials.

#### Scenario: Successful login with valid credentials
- **WHEN** user enters valid email and password and clicks "Iniciar Sesión"
- **THEN** system authenticates user, stores JWT token, and redirects to dashboard

#### Scenario: Failed login with invalid credentials
- **WHEN** user enters invalid email or wrong password and clicks "Iniciar Sesión"
- **THEN** system displays error message "Credenciales inválidas" and keeps user on login page

#### Scenario: Login form validation
- **WHEN** user submits login form without filling required fields
- **THEN** system displays validation errors for empty email and password fields

#### Scenario: User is redirected to login when not authenticated
- **WHEN** user tries to access a protected route without being logged in
- **THEN** system redirects user to /login page