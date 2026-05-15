# Mantenedor de Usuarios

## Purpose

Administrative CRUD interface for users, accessible only to Admins. Lets administrators create, edit, list, view, and delete users; assign roles; and manage which departments a user serves as director of.

## Requirements

### Requirement: Admin can create user with role and departments

The system SHALL allow administrators to create users by providing name, email, password, role, and optionally assigning departments where they serve as director.

#### Scenario: Create user with all fields
- **WHEN** admin fills name, email, password, role, and selects departments
- **THEN** system creates user and returns created user data without password

#### Scenario: Create user with duplicate email
- **WHEN** admin tries to create user with an email that already exists
- **THEN** system returns a validation error

### Requirement: Admin can edit user

The system SHALL allow administrators to edit a user's name, email, role, and department assignments.

#### Scenario: Update user role
- **WHEN** admin changes user's role from "Anciano" to "Pastor"
- **THEN** system updates the role and returns updated user

#### Scenario: Update user departments
- **WHEN** admin adds a department where user is director
- **THEN** system adds the relationship in user_departments

#### Scenario: Remove user from department
- **WHEN** admin removes a department from user's assignments
- **THEN** system removes the relationship from user_departments

### Requirement: Admin can delete user

The system SHALL allow administrators to delete users.

#### Scenario: Delete user without associated programs
- **WHEN** admin deletes a user that has no programs
- **THEN** system removes the user and associated user_departments records

#### Scenario: Delete user with associated programs
- **WHEN** admin deletes a user that has programs created
- **THEN** system blocks deletion and returns an error indicating the user has associated programs

### Requirement: Admin can list all users

The system SHALL allow administrators to list all users with pagination.

#### Scenario: List users with pagination
- **WHEN** admin requests paginated list of users
- **THEN** system returns users with their roles and department assignments

### Requirement: Admin can view single user

The system SHALL allow administrators to view a single user's details including their department directorships.

#### Scenario: Get user by ID
- **WHEN** admin requests a user by ID
- **THEN** system returns user data including departments where is_director=true
