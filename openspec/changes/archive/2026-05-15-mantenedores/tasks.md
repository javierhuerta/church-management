## 1. Backend - Department Entity (Migration)

- [x] 1.1 Create migration to convert Department enum to Department entity
- [x] 1.2 Create user_departments join table with is_director column
- [x] 1.3 Update Event entity to use FK to departments instead of enum
- [x] 1.4 Update Department enum to Department entity with BaseEntity
- [x] 1.5 Add relations to User entity (many-to-many with departments)
- [ ] 1.6 Run migration and verify data integrity

## 2. Backend - UsersModule

- [x] 2.1 Create UsersModule, UsersController, UsersService
- [x] 2.2 Create DTOs: CreateUserDto, UpdateUserDto, UserResponseDto
- [x] 2.3 Implement CRUD endpoints: GET/POST /users, GET/PATCH/DELETE /users/:id
- [x] 2.4 Add password hashing with bcrypt
- [x] 2.5 Add validation for unique email
- [x] 2.6 Add role-based access: Admin only for all endpoints
- [x] 2.7 Handle deletion blocked if user has programs

## 3. Backend - DepartmentsModule

- [x] 3.1 Create DepartmentsModule, DepartmentsController, DepartmentsService
- [x] 3.2 Create DTOs: CreateDepartmentDto, UpdateDepartmentDto, DepartmentResponseDto
- [x] 3.3 Implement CRUD endpoints: GET/POST /departments, GET/PATCH/DELETE /departments/:id
- [x] 3.4 Add endpoint GET /departments/:id/directors
- [x] 3.5 Add role-based access: Admin only
- [x] 3.6 Handle cascade delete for user_departments

## 4. Backend - Seeders

- [x] 4.1 Update UserSeeder to work with new UsersModule structure
- [x] 4.2 Create DepartmentSeeder with initial departments
- [ ] 4.3 Test seeders after migration

## 5. Backend - Templates (Existing)

- [x] 5.1 Add GET /worship-services/templates without query filter (list all)
- [x] 5.2 Verify existing POST/PATCH/DELETE have correct roles (Admin + Pastor)

## 6. Frontend - Mantenedores Menu

- [x] 6.1 Add "Mantenedores" section to sidebar
- [x] 6.2 Add routes for /mantenedores/* in App.tsx
- [x] 6.3 Create MantenedoresLayout with sub-navigation
- [x] 6.4 Protect all mantenedores routes with Admin role check

## 7. Frontend - Users Page

- [x] 7.1 Create UsersListPage component
- [x] 7.2 Create UserFormPage component (create/edit)
- [x] 7.3 Add department selector with multi-select
- [x] 7.4 Add role selector
- [x] 7.5 Generate API client from OpenAPI schema
- [x] 7.6 Add delete confirmation dialog

## 8. Frontend - Departments Page

- [x] 8.1 Create DepartmentsListPage component
- [x] 8.2 Create DepartmentFormPage component (create/edit)
- [x] 8.3 Add directors list display
- [x] 8.4 Generate API client from OpenAPI schema
- [x] 8.5 Add delete confirmation dialog

## 9. Frontend - Templates (Existing)

- [x] 9.1 Add link/redirect from /mantenedores/plantillas to existing TemplatesListPage
- [x] 9.2 Verify TemplatesListPage is accessible to Admin + Pastor

## 10. Testing & Verification

- [ ] 10.1 Test all CRUD operations for users via API
- [ ] 10.2 Test all CRUD operations for departments via API
- [ ] 10.3 Test frontend user creation flow
- [ ] 10.4 Test frontend department creation flow
- [ ] 10.5 Verify role-based access (Admin vs Pastor)
- [ ] 10.6 Verify seeders work correctly after clean slate