## ADDED Requirements

### Requirement: Reproducible data seeding via CLI

The system SHALL allow developers to populate the database with test data using a command-line seeder system.

#### Scenario: Run all seeders
- **WHEN** developer runs `npm run seed:run`
- **THEN** all seeder classes are executed in order, inserting test data into respective tables

#### Scenario: Seeders are idempotent
- **WHEN** seeders are run multiple times
- **THEN** no duplicate records are created (existing records are skipped)

#### Scenario: Seeder targets specific module
- **WHEN** a module has a seeder defined
- **THEN** it can insert initial data for that module's entities (e.g., users, events)

#### Scenario: Seeders respect database connection
- **WHEN** seeder runs
- **THEN** it uses the same DataSource configuration as the application