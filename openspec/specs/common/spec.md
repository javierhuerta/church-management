# Common — Shared Utilities and Infrastructure

## Purpose

Provide consistent error handling, pagination standards, and timestamp management across all system modules.

## Requirements

### Requirement: Consistent error response format

The system SHALL return errors in a consistent JSON format: `{ statusCode: number, message: string, error: string }`.

#### Scenario: Validation error response
- **WHEN** request fails validation
- **THEN** system returns 400 with `{ statusCode: 400, message: "Validation failed", error: "Bad Request" }`

#### Scenario: Not found error response
- **WHEN** requested resource does not exist
- **THEN** system returns 404 with `{ statusCode: 404, message: "Resource not found", error: "Not Found" }`

#### Scenario: Unauthorized error response
- **WHEN** request lacks valid authentication
- **THEN** system returns 401 with `{ statusCode: 401, message: "Unauthorized", error: "Unauthorized" }`

### Requirement: Standard pagination for list endpoints

The system SHALL support pagination for list endpoints with `page` and `limit` query parameters. Default page size is 20, maximum is 100.

#### Scenario: Paginated list response
- **WHEN** user requests list with `page=1&limit=10`
- **THEN** response includes `{ data: [...], total: number, page: number, limit: number, totalPages: number }`

#### Scenario: Default pagination
- **WHEN** user requests list without pagination parameters
- **THEN** system returns first 20 items with default pagination metadata

### Requirement: Timestamps on all entities

The system SHALL automatically manage `created_at` and `updated_at` timestamps on all entities using TypeORM decorators.

#### Scenario: New entity has timestamps
- **WHEN** a new entity is created
- **THEN** created_at is set to current datetime and updated_at is null

#### Scenario: Updated entity has timestamp
- **WHEN** an existing entity is updated
- **THEN** updated_at is set to current datetime