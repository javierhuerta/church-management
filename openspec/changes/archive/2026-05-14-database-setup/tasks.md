## 1. Infrastructure Setup

- [x] 1.1 Create `data-source.ts` in backend root for TypeORM CLI
- [x] 1.2 Update backend `package.json` with migration scripts
- [x] 1.3 Update backend `package.json` with seeder scripts
- [x] 1.4 Create `backend/tsconfig.json` paths for TypeORM

## 2. Docker Compose Setup

- [x] 2.1 Create `docker-compose.yml` for development (PostgreSQL)
- [x] 2.2 Create `docker-compose.prod.yml` for production
- [x] 2.3 Create `Dockerfile` for backend
- [x] 2.4 Create `Dockerfile.frontend` for frontend (if multi-stage needed)
- [x] 2.5 Create `.env.example` with all required environment variables

## 3. Root Scripts Update

- [x] 3.1 Add `db:up`, `db:down`, `db:logs` scripts to root `package.json`
- [x] 3.2 Add `db:migrate`, `db:migrate:revert` scripts to root `package.json`
- [x] 3.3 Add `db:seed` script to root `package.json`

## 4. Backend Configuration Update

- [x] 4.1 Update `app.module.ts` to disable `synchronize` in production
- [x] 4.2 Create `backend/.env` with local development values
- [x] 4.3 Ensure `synchronize: true` only runs when `NODE_ENV !== 'production'`

## 5. Initial Migrations

- [x] 5.1 Generate initial migration for `users` table from existing entity
- [x] 5.2 Generate initial migration for `events` table from existing entity
- [x] 5.3 Verify migrations run successfully against Docker PostgreSQL

## 6. Seeder Implementation

- [x] 6.1 Create `backend/src/seeds/index.ts` as seeder entry point
- [x] 6.2 Create `backend/src/seeds/auth/user.seeder.ts`
- [x] 6.3 Create `backend/src/seeds/calendar/event.seeder.ts`
- [x] 6.4 Implement idempotent seeding (skip if data exists)
- [x] 6.5 Test seeders against Docker PostgreSQL