## 1. Backend - Department Entity (Migration)

- [ ] 1.1 Create migration to convert Department enum to Department entity
- [ ] 1.2 Create user_departments join table with is_director column
- [ ] 1.3 Update Event entity to use FK to departments instead of enum
- [ ] 1.4 Update Department enum to Department entity with BaseEntity
- [ ] 1.5 Add relations to User entity (many-to-many with departments)
- [ ] 1.6 Run migration and verify data integrity

## 2. Backend - UsersModule

- [ ] 2.1 Create UsersModule, UsersController, UsersService
- [ ] 2.2 Create DTOs: CreateUserDto, UpdateUserDto, UserResponseDto
- [ ] 2.3 Implement CRUD endpoints: GET/POST /users, GET/PATCH/DELETE /users/:id
- [ ] 2.4 Add password hashing with bcrypt
- [ ] 2.5 Add validation for unique email
- [ ] 2.6 Add role-based access: Admin only for all endpoints
- [ ] 2.7 Handle deletion blocked if user has programs

## 3. Backend - DepartmentsModule

- [ ] 3.1 Create DepartmentsModule, DepartmentsController, DepartmentsService
- [ ] 3.2 Create DTOs: CreateDepartmentDto, UpdateDepartmentDto, DepartmentResponseDto
- [ ] 3.3 Implement CRUD endpoints: GET/POST /departments, GET/PATCH/DELETE /departments/:id
- [ ] 3.4 Add endpoint GET /departments/:id/directors
- [ ] 3.5 Add role-based access: Admin only
- [ ] 3.6 Handle cascade delete for user_departments

## 4. Backend - Seeders

- [ ] 4.1 Update UserSeeder to work with new UsersModule structure
- [ ] 4.2 Create DepartmentSeeder with initial departments
- [ ] 4.3 Test seeders after migration

## 5. Backend - Templates (Existing)

- [ ] 5.1 Add GET /worship-services/templates without query filter (list all)
- [ ] 5.2 Verify existing POST/PATCH/DELETE have correct roles (Admin + Pastor)

## 6. Frontend - Mantenedores Menu

- [ ] 6.1 Add "Mantenedores" section to sidebar
- [ ] 6.2 Add routes for /mantenedores/* in App.tsx
- [ ] 6.3 Create MantenedoresLayout with sub-navigation
- [ ] 6.4 Protect all mantenedores routes with Admin role check

## 7. Frontend - Users Page

- [ ] 7.1 Create UsersListPage component
- [ ] 7.2 Create UserFormPage component (create/edit)
- [ ] 7.3 Add department selector with multi-select
- [ ] 7.4 Add role selector
- [ ] 7.5 Generate API client from OpenAPI schema
- [ ] 7.6 Add delete confirmation dialog

## 8. Frontend - Departments Page

- [ ] 8.1 Create DepartmentsListPage component
- [ ] 8.2 Create DepartmentFormPage component (create/edit)
- [ ] 8.3 Add directors list display
- [ ] 8.4 Generate API client from OpenAPI schema
- [ ] 8.5 Add delete confirmation dialog

## 9. Frontend - Templates (Existing)

- [ ] 9.1 Add link/redirect from /mantenedores/plantillas to existing TemplatesListPage
- [ ] 9.2 Verify TemplatesListPage is accessible to Admin + Pastor

## 10. Testing & Verification

- [ ] 10.1 Test all CRUD operations for users via API
- [ ] 10.2 Test all CRUD operations for departments via API
- [ ] 10.3 Test frontend user creation flow
- [ ] 10.4 Test frontend department creation flow
- [ ] 10.5 Verify role-based access (Admin vs Pastor)
- [ ] 10.6 Verify seeders work correctly after clean slate