# Auth — Authentication and Authorization

## ADDED Requirements

### Requirement: Users can authenticate with email and password

The system SHALL allow users to authenticate using their email and password credentials. Successful authentication SHALL return a JWT access token and a refresh token.

#### Scenario: Successful login
- **WHEN** user provides valid email and password
- **THEN** system returns a JWT access token (15 min expiry) and a refresh token (7 days expiry)

#### Scenario: Failed login with wrong password
- **WHEN** user provides valid email but wrong password
- **THEN** system returns 401 Unauthorized with message "Invalid credentials"

#### Scenario: Failed login with non-existent email
- **WHEN** user provides email that does not exist in the system
- **THEN** system returns 401 Unauthorized with message "Invalid credentials"

### Requirement: JWT tokens are used for API authentication

The system SHALL use JWT Bearer tokens for authenticating API requests. All protected endpoints SHALL require a valid access token in the Authorization header.

#### Scenario: Valid token grants access
- **WHEN** API request includes a valid JWT Bearer token
- **THEN** request is processed with the user's identity extracted from the token

#### Scenario: Expired token is rejected
- **WHEN** API request includes an expired JWT token
- **THEN** system returns 401 Unauthorized with message "Token expired"

#### Scenario: Malformed token is rejected
- **WHEN** API request includes a malformed or invalid JWT token
- **THEN** system returns 401 Unauthorized with message "Invalid token"

### Requirement: Users can refresh expired access tokens

The system SHALL allow users to obtain a new access token using a valid refresh token. The refresh token SHALL be invalidated after use.

#### Scenario: Successful token refresh
- **WHEN** user provides a valid refresh token
- **THEN** system returns a new access token and invalidates the refresh token

#### Scenario: Refresh with expired token
- **WHEN** user provides an expired refresh token
- **THEN** system returns 401 Unauthorized and user must re-authenticate

### Requirement: Users can logout

The system SHALL allow users to invalidate their refresh token by logging out.

#### Scenario: Successful logout
- **WHEN** user calls the logout endpoint with a valid refresh token
- **THEN** refresh token is invalidated and user session ends

### Requirement: Role-based access control

The system SHALL enforce role-based permissions. Each user SHALL have exactly one role: Pastor, Anciano, CoordinadorMisionero, DirectorDepartamento, Secretaria, or MaestroClase.

#### Scenario: Role is embedded in JWT
- **WHEN** user successfully authenticates
- **THEN** the JWT access token SHALL contain the user's role claim

#### Scenario: Endpoint restricts access by role
- **WHEN** user attempts to access an endpoint restricted to a specific role
- **THEN** access is granted only if user's role matches the required role

#### Scenario: Access denied for wrong role
- **WHEN** user attempts to access an endpoint restricted to a different role
- **THEN** system returns 403 Forbidden