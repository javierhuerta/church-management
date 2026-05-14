# Root Scripts — Project Root npm Commands

## Purpose

Provide npm scripts at the project root for orchestrating backend and frontend services, database operations, and development workflows.

## Requirements

### Requirement: Root scripts for multi-service orchestration

The system SHALL provide npm scripts in the project root that allow developers to run commands for both backend and frontend services from a single location.

#### Scenario: Run backend development server
- **WHEN** developer runs `npm run dev:backend` from project root
- **THEN** the backend NestJS development server starts with hot reload enabled

#### Scenario: Run frontend development server
- **WHEN** developer runs `npm run dev:frontend` from project root
- **THEN** the frontend Vite dev server starts and is accessible at localhost:5173

#### Scenario: Run both services in parallel
- **WHEN** developer runs `npm run dev:all` from project root
- **THEN** both backend and frontend services start simultaneously, each in its own process

#### Scenario: Run backend tests
- **WHEN** developer runs `npm run test:backend` from project root
- **THEN** Jest executes all backend tests and reports results

#### Scenario: Run frontend linting
- **WHEN** developer runs `npm run lint:frontend` from project root
- **THEN** ESLint checks frontend code and reports any violations

#### Scenario: Run both lints in parallel
- **WHEN** developer runs `npm run lint:all` from project root
- **THEN** ESLint runs on both backend and frontend simultaneously

#### Scenario: Generate frontend API client
- **WHEN** developer runs `npm run api:generate` from project root
- **THEN** OpenAPI typescript codegen fetches the API schema from running backend and generates TypeScript client in frontend/src/lib/api

#### Scenario: Build both services
- **WHEN** developer runs `npm run build:all` from project root
- **THEN** both backend and frontend are built in parallel, producing deployable artifacts in their respective dist folders

### Requirement: Database operations via npm scripts

The system SHALL provide npm scripts for managing PostgreSQL containers and running database migrations and seeds.

#### Scenario: Start PostgreSQL for development
- **WHEN** developer runs `npm run db:up` from project root
- **THEN** Docker Compose starts PostgreSQL container on port 5432

#### Scenario: Stop PostgreSQL container
- **WHEN** developer runs `npm run db:down` from project root
- **THEN** Docker Compose stops the PostgreSQL container, preserving data

#### Scenario: View PostgreSQL logs
- **WHEN** developer runs `npm run db:logs` from project root
- **THEN** PostgreSQL container logs are streamed to the terminal

#### Scenario: Run database migrations
- **WHEN** developer runs `npm run db:migrate` from project root
- **THEN** TypeORM runs all pending migrations

#### Scenario: Revert last database migration
- **WHEN** developer runs `npm run db:migrate:revert` from project root
- **THEN** TypeORM reverts the most recent migration

#### Scenario: Populate database with seed data
- **WHEN** developer runs `npm run db:seed` from project root
- **THEN** all seeder classes execute, inserting test data into the database