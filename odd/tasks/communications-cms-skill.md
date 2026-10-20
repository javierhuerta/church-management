# Feature: communications-cms-skill

## Objective
Enable the Church Communications officer to manage all 7 public website sections (`inicio`, `liderazgo`, `horarios`, `calendario`, `programa`, `galeria`, `envivo`/`transmisiones`) both via a dedicated `UserRole.Comunicaciones` role in the Admin panel and via an AI agent using revocable database-backed API keys (`X-API-Key`) and a portable Claude skill (`church-communications-cms`).

## Problem / Why
- Today `site-config`, `schedule`, `gallery`, and `transmisiones` require `UserRole.Admin`, while `calendar` requires `Admin`/`Pastor`/`Secretaria` and `worship-services/programs` publishing requires `Admin`/`Pastor`.
- Giving the Communications officer full `Admin` access exposes sensitive internal modules (`users`, `mission`, `document-center`).
- Using short-lived JWTs from an AI agent (Claude Code / Claude Desktop) is brittle; static revocable API keys per user (`api_keys` table) managed from the Admin User screen (`/mantenedores/usuarios/:id`) allow secure, auditable agent access without sharing passwords or expiring tokens.

## Scope (authorized by user, 2026-10-20)
1. **Role & Permissions (`UserRole.Comunicaciones`)**:
   - Add `Comunicaciones = 'Comunicaciones'` to `UserRole` enum and PostgreSQL `users_role_enum`.
   - Grant `UserRole.Comunicaciones` access to:
     - `SiteConfigController` (Inicio, Liderazgo, board photo, ministries read)
     - `ScheduleController` (Horarios texts & items)
     - `GalleryAdminController` (Galería config, albums, images)
     - `TransmisionesAdminController` (En Vivo config, sermons CRUD, YouTube sync, force-check, oembed)
     - `CalendarController` & `EDITOR_ROLES` (create, edit, publish, archive, cover/attachments)
     - `ProgramController` & `ProgramService` (create, edit groups/sections, update program metadata, publish, publish-with-event) + read access on `TemplateController` and `HymnController`.
   - Deny access to `UsersController`, `Mission` controllers, and `DocumentCenter` controllers.
2. **Database-backed API Keys (`api_keys` table)**:
   - Create `ApiKey` entity (`id`, `userId`, `name`, `keyPrefix`, `keyHash`, `lastUsedAt`, `revokedAt`, `createdAt`, `updatedAt`) with `@ManyToOne(() => User)` + explicit `@JoinColumn({ name: 'user_id' })`.
   - Store only SHA-256 hash of the raw key (`ch_cms_<random>`); return the raw key only once on creation.
   - Update `JwtAuthGuard` and `OptionalJwtAuthGuard` to accept `X-API-Key` header (or `Authorization: ApiKey <key>`), validate against active (non-revoked) `api_keys`, update `lastUsedAt`, and populate `req.user` (`{ userId, email, role, name }`).
   - Add Admin-only endpoints in `UsersController`:
     - `GET /api/users/:id/api-keys` (list user's API keys)
     - `POST /api/users/:id/api-keys` (generate a new API key, returns plaintext key once)
     - `DELETE /api/users/:id/api-keys/:keyId` (revoke an API key)
3. **Frontend Admin UI**:
   - Add `Comunicaciones` role option and badge styling in `UsersListPage` and `UserFormPage`.
   - Allow `Comunicaciones` role in `ConfiguracionesLayout` and `Sidebar` (showing Configuraciones link for `Admin`, `Pastor`, `Comunicaciones`, while keeping Mantenedores `Admin`-only).
   - Add an **API Keys** management section inside `UserFormPage` (when editing a user) to list keys, generate a new key with a one-time copy dialog, and revoke keys.
4. **Agent Skill (`church-communications-cms`)**:
   - Create `.opencode/skills/church-communications-cms/SKILL.md` (and mirror/exportable package) with `assets/cms-cli.mjs` helper script and `references/api-endpoints.md` covering all 7 website sections with `CHURCH_API_URL` and `CHURCH_API_KEY`.
5. **Frente 2 — Website Design PR Workflow & Claude Pro Guide**:
   - Create `website/CLAUDE.md` so Claude Code automatically enforces `website/` boundaries, `window.IASD_API` data hooks, dark mode variables, and mobile responsive rules whenever the Communications officer edits the public site design.
   - Create `website/scripts/verify-integration.mjs` (zero-dependency Node script) to automatically verify that `index.html`, `integration.js`, all `window.IASD_API` hooks across `auth.jsx` and `pages-1..4.jsx`, and mobile responsive CSS classes in `styles.css` remain intact after any design edit.
   - Create `.github/CODEOWNERS` (`@javierhuerta` required reviewer) and `.github/pull_request_template.md` + `.github/workflows/website-pr-check.yml` (runs `verify-integration.mjs` + Docker build test on PRs touching `website/`).
   - Create `docs/guia-comunicaciones-web.md`: practical onboarding guide for the Communications officer covering both content updates (Skill + API Key / Admin panel) and design PRs with Claude Pro (`design/*` -> `development` Staging -> review -> `main` Production).

## Constraints
- Never run migrations against production automatically; create TypeORM migration file and run only on local dev DB if needed.
- Do not start backend (`:3000`) or frontend (`:5173`) if already running in user's terminal.
- Follow `@JoinColumn({ name: 'user_id' })` rule strictly on `@ManyToOne` in `ApiKey` entity.
- Follow `church-ui-design` skill for all frontend changes.
- Follow `skill-creator` rules for the new skill (`SKILL.md` concise, supporting details in `references/` and `assets/`).

## TDD & Verification
- Unit tests for `ApiKeyService` / guard resolution, `ProgramService` permissions for `Comunicaciones`, and `CalendarService` `isEditorRole(UserRole.Comunicaciones)`.
- Typecheck and build verification on `backend` and `frontend`.

## Delivery
- Strategy: `ask-on-risk` / work-unit commits on `feature/communications-cms-skill` branch from `development`.

## Tasks
- [x] T1 Create branch `feature/communications-cms-skill`, add `UserRole.Comunicaciones`, `ApiKey` entity + migration, `ApiKeyService`, and `X-API-Key` support in `JwtAuthGuard` & `OptionalJwtAuthGuard` + unit tests.
- [x] T2 Wire `UsersController` API key endpoints (`GET/POST/DELETE /api/users/:id/api-keys`) and update role permissions across the 7 website content modules (`site-config`, `schedule`, `gallery`, `transmisiones`, `calendar`, `worship-services`) + unit tests.
- [x] T3 Update Frontend OpenAPI types/client, add `Comunicaciones` role to `UsersListPage`, `UserFormPage`, `Sidebar`, `ConfiguracionesLayout`, and build the API Keys management card in `UserFormPage`.
- [x] T4 Create the `church-communications-cms` skill (`SKILL.md`, `assets/cms-cli.mjs`, `references/api-endpoints.md`) for the Communications officer's Claude agent and refresh skill registry.
- [x] T5 Create `website/CLAUDE.md` and `website/scripts/verify-integration.mjs` to protect `window.IASD_API` contracts, responsive classes, and `website/` scope when editing design with Claude Code.
- [x] T6 Add GitHub guardrails (`.github/CODEOWNERS`, `.github/pull_request_template.md`, and `.github/workflows/website-pr-check.yml`) for fast, safe PR reviews into `development`.
- [x] T7 Create `docs/guia-comunicaciones-web.md` (complete guide for the Communications officer: Skill + API Key setup and step-by-step Claude Code PR workflow).

## Progress / Evidence
- 2026-10-20: Initial ODD task specification created and mirrored to Engram.
- 2026-10-20 T1: Branch `feature/communications-cms-skill` created from `development`. Added `UserRole.Comunicaciones`, `ApiKey` entity (`api_keys` table with `@JoinColumn({ name: 'user_id' })`), migration `1780600000000-AddComunicacionesRoleAndApiKeys.ts`, `ApiKeyService`, `extractApiKeyFromRequest`, and `X-API-Key` support in `JwtAuthGuard` / `OptionalJwtAuthGuard`. Unit tests in `api-key.service.spec.ts` passing (4/4).
- 2026-10-20 T2: Added `GET /api/users/:id/api-keys`, `POST /api/users/:id/api-keys`, and `DELETE /api/users/:id/api-keys/:keyId` in `UsersController`. Enabled `UserRole.Comunicaciones` across `SiteConfigController`, `ScheduleController`, `GalleryAdminController`, `TransmisionesAdminController`, `CalendarController`/`EDITOR_ROLES`, `ProgramController`, and `ProgramService` (create, edit draft/published, publish, publish-with-event). `nest build` and unit tests (`api-key.service.spec.ts`, `program.service.spec.ts`, `calendar.service.spec.ts`, `users.service.spec.ts` — 64/64 tests) passing.
- 2026-10-20 T3: Updated frontend API models & `UsersService`, added `Comunicaciones` role to `UsersListPage`, `UserFormPage`, `Sidebar`, and `ConfiguracionesLayout`, and built the API Keys management section with one-time secret modal and revoke confirmation in `UserFormPage`. `tsc -b && vite build` succeeded cleanly.
- 2026-10-20 T4: Created `.opencode/skills/church-communications-cms` (and mirrored to `.claude/skills/church-communications-cms`) with `SKILL.md`, `assets/cms-cli.mjs`, and `references/api-endpoints.md`. Registered in `AGENTS.md` and refreshed `.atl/skill-registry.md` (66 skills).
- 2026-10-20 T5–T7: Created `website/CLAUDE.md`, `website/scripts/verify-integration.mjs` (verified passing `✅`), `.github/CODEOWNERS`, `.github/pull_request_template.md`, `.github/workflows/website-pr-check.yml`, and `docs/guia-comunicaciones-web.md`. Committed all work units on `feature/communications-cms-skill`.

## Next step
- Merge `feature/communications-cms-skill` into `development` when ready to deploy to Staging and run `sh entrypoint.sh migrate`.
