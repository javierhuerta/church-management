## 1. Configuracion inicial

- [x] 1.1 Inicializar proyecto NestJS en `backend/`
- [x] 1.2 Inicializar proyecto React con Vite en `frontend/`
- [x] 1.3 Configurar TypeORM con PostgreSQL
- [x] 1.4 Configurar shadcn/ui y Tailwind CSS
- [x] 1.5 Configurar OpenAPI/Swagger en NestJS

## 2. Modulo Common

- [x] 2.1 Crear DTO base de paginacion (`pagination.dto.ts`)
- [x] 2.2 Crear filtro global de excepciones (`all-exceptions.filter.ts`)
- [x] 2.3 Configurar timestamps en entidad base (`base.entity.ts`)
- [x] 2.4 Crear enum de roles de usuario (`user-role.enum.ts`)

## 3. Modulo Auth

- [x] 3.1 Crear entidad User (`user.entity.ts`)
- [x] 3.2 Crear DTOs de auth (`login.dto.ts`, `refresh-token.dto.ts`, `logout.dto.ts`)
- [x] 3.3 Implementar AuthService con JWT y refresh tokens
- [x] 3.4 Implementar AuthController con endpoints de login, refresh, logout
- [x] 3.5 Configurar Passport JWT guard (`jwt-auth.guard.ts`)
- [x] 3.6 Configurar roles guard (`roles.guard.ts`)
- [x] 3.7 Proteger endpoints de ejemplo con auth y roles

## 4. Modulo Calendar

- [x] 4.1 Crear entidad Event (`event.entity.ts`)
- [x] 4.2 Crear enum EventType (`event-type.enum.ts`)
- [x] 4.3 Crear DTOs de evento (`create-event.dto.ts`, `update-event.dto.ts`, `filter-event.dto.ts`)
- [x] 4.4 Implementar EventService (CRUD completo)
- [x] 4.5 Implementar EventController con endpoints CRUD y filtros
- [x] 4.6 Agregar validacion de fechas y roles

## 5. Configuracion API Client

- [x] 5.1 Configurar script `generate:api` en package.json del frontend
- [x] 5.2 Generar clientes API desde schema OpenAPI
- [x] 5.3 Configurar variable de entorno para API URL
- [x] 5.4 Configurar React Query provider

## 6. Validacion

- [x] 6.1 Correr `openspec validate estructura-base` para verificar specs
- [x] 6.2 Correr lint y typecheck en backend
- [x] 6.3 Correr lint y typecheck en frontend
- [x] 6.4 Hacer commit de la estructura base