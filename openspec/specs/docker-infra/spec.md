# Docker Infrastructure — Containerized Development and Deployment

## Purpose

Provide Docker Compose configurations for local development with PostgreSQL and containerized production deployment.

## Requirements

### Requirement: PostgreSQL via Docker Compose for development

The system SHALL provide a Docker Compose configuration to run PostgreSQL locally for development.

#### Scenario: Start PostgreSQL container
- **WHEN** developer runs `npm run db:up` or `docker-compose up -d`
- **THEN** a PostgreSQL 16 Alpine container starts on port 5432 with data persisted to a named volume

#### Scenario: Stop PostgreSQL container
- **WHEN** developer runs `npm run db:down`
- **THEN** the PostgreSQL container stops but data is preserved in the volume

#### Scenario: View database logs
- **WHEN** developer runs `npm run db:logs`
- **THEN** PostgreSQL container logs are streamed to the terminal

### Requirement: Dockerized production deployment

The system SHALL provide Docker Compose configuration for production with the application containerized.

#### Scenario: Production stack starts
- **WHEN** `docker-compose -f docker-compose.prod.yml up -d` is executed
- **THEN** PostgreSQL and the application containers start, connected via internal network

#### Scenario: Production uses environment variables
- **WHEN** production containers start
- **THEN** database credentials are read from environment variables, not hardcoded

#### Scenario: Data persists in production
- **WHEN** PostgreSQL container restarts in production
- **THEN** all data is preserved in a named volume