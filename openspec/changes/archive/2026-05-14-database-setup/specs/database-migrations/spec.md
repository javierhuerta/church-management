## ADDED Requirements

### Requirement: Database schema version control via migrations

The system SHALL provide TypeORM migrations to manage database schema changes in a versioned, reproducible manner.

#### Scenario: Run pending migrations
- **WHEN** developer runs `npm run migration:run`
- **THEN** all pending migrations in `src/migrations/` are executed against the database

#### Scenario: Revert last migration
- **WHEN** developer runs `npm run migration:revert`
- **THEN** the most recent migration is rolled back

#### Scenario: Generate new migration from entity changes
- **WHEN** developer runs `npm run migration:generate src/migrations/MigrationName`
- **THEN** TypeORM compares current entity definitions with database schema and generates migration file

#### Scenario: Migration runs automatically on deploy
- **WHEN** application starts in production
- **THEN** pending migrations are applied before the server accepts connections