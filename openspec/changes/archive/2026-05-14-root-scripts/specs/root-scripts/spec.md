## ADDED Requirements

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