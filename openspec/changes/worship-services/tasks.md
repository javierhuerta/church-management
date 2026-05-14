## 1. Backend Setup

- [ ] 1.1 Create worship-services module structure (nest g module worship-services)
- [ ] 1.2 Create entities: ServiceTemplate, ServiceTemplateGroup, ServiceTemplateSection
- [ ] 1.3 Create entities: ServiceProgram, ServiceProgramGroup, ServiceProgramSection
- [ ] 1.4 Create entity: ServiceProgramLog
- [ ] 1.5 Create entity: Hymn
- [ ] 1.6 Add enums: ServiceTemplateType (CULTO_SABATICO, CULTO_JA, CULTO_ORACION, OTRO), ProgramStatus (DRAFT, PUBLISHED)

## 2. Database Migrations

- [ ] 2.1 Generate migration for worship_services tables (template, program, log, hymn)
- [ ] 2.2 Run migration

## 3. Hymn Seeder

- [ ] 3.1 Create hymns seeder with 695 Adventist hymns data
- [ ] 3.2 Run seeder to populate hymns table

## 4. Template Module (Admin/Pastor only)

- [ ] 4.1 Create TemplateCrudService with CRUD operations
- [ ] 4.2 Create TemplateController with endpoints:
  - GET /worship-services/templates
  - GET /worship-services/templates/:id
  - POST /worship-services/templates
  - PATCH /worship-services/templates/:id
  - DELETE /worship-services/templates/:id
- [ ] 4.3 Implement permission guards (Admin, Pastor only)
- [ ] 4.4 Add DTOs for template creation/update (with groups and sections)

## 5. Program Module (Admin, Pastor, Anciano, DirectorDepartamento)

- [ ] 5.1 Create ProgramService with:
  - createFromTemplate(templateId, date, userId)
  - updateSection(sectionId, data, userId)
  - publish(programId, userId)
- [ ] 5.2 Create ProgramController with endpoints:
  - GET /worship-services/programs
  - GET /worship-services/programs/:id
  - POST /worship-services/programs
  - PATCH /worship-services/programs/:id
  - POST /worship-services/programs/:id/publish
  - DELETE /worship-services/programs/:id
- [ ] 5.3 Implement permission guards per endpoint
- [ ] 5.4 Add DTOs for program creation and section update

## 6. Audit Log System

- [ ] 6.1 Create ProgramLogService with log creation
- [ ] 6.2 Integrate logging into all program section update operations
- [ ] 6.3 Add endpoint: GET /worship-services/programs/:id/logs
- [ ] 6.4 Ensure logs are immutable (no update/delete endpoints)

## 7. Hymn Autocomplete

- [ ] 7.1 Create HymnService with search by number and name
- [ ] 7.2 Create HymnController with: GET /hymns (with query params for search)
- [ ] 7.3 Add autocomplete endpoint: GET /hymns/autocomplete?q={query}

## 8. User Autocomplete (for responsible field)

- [ ] 8.1 Add endpoint: GET /users/autocomplete?q={query}
- [ ] 8.2 Returns list of user names for autocomplete

## 9. OpenAPI Documentation

- [ ] 9.1 Add OpenAPI decorators to all controllers
- [ ] 9.2 Document all endpoints with ApiTags, ApiOperation, ApiResponse
- [ ] 9.3 Generate OpenAPI schema

## 10. Frontend - API Client Generation

- [ ] 10.1 Run generate:api (or equivalent) to create TypeScript client from OpenAPI schema
- [ ] 10.2 Verify generated services for worship-services and hymns

## 11. Frontend - Templates UI

- [ ] 11.1 Create page: /worship-services/templates (list view)
- [ ] 11.2 Create page: /worship-services/templates/new (create template form)
- [ ] 11.3 Create page: /worship-services/templates/:id/edit (edit template form)
- [ ] 11.4 Implement drag-and-drop reordering for groups and sections
- [ ] 11.5 Add permission checks (hide create/edit for non-Admin/Pastor)

## 12. Frontend - Programs UI

- [ ] 12.1 Create page: /worship-services/programs (list view with date filter)
- [ ] 12.2 Create page: /worship-services/programs/new (select template + date)
- [ ] 12.3 Create page: /worship-services/programs/:id (view/edit program)
- [ ] 12.4 Implement section editing: startTime, duration, responsible (autocomplete), hymnText (autocomplete), notes
- [ ] 12.5 Display audit logs in program detail view
- [ ] 12.6 Implement publish button with confirmation
- [ ] 12.7 Add permission checks for editing PUBLISHED programs

## 13. Testing

- [ ] 13.1 Write unit tests for TemplateService
- [ ] 13.2 Write unit tests for ProgramService
- [ ] 13.3 Write unit tests for ProgramLogService
- [ ] 13.4 Write integration tests for program creation from template
- [ ] 13.5 Write integration tests for audit logging on section updates