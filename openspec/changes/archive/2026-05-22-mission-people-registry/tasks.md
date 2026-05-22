## 1. Backend - Módulo Mission y entidad Person

- [x] 1.1 Crear módulo NestJS `mission` (`mission.module.ts`) registrado en `AppModule`
- [x] 1.2 Crear entidad `Person` (`person.entity.ts`) extendiendo `BaseEntity` con los campos definidos en design.md
- [x] 1.3 Crear constante `MISSION_FULL_ACCESS_ROLES` (`Admin`, `Pastor`, `Anciano`, `CoordinadorMisionero`)
- [x] 1.4 Crear migración para la tabla `people`

## 2. Backend - Vínculo User ↔ Person

- [x] 2.1 Agregar columna nullable `person_id` a la entidad `User` con `@ManyToOne` + `@JoinColumn({ name: 'person_id' })`
- [x] 2.2 Crear migración para agregar la columna `person_id` a `users` (FK ON DELETE SET NULL)
- [x] 2.3 Verificar que la migración no afecta usuarios existentes (quedan con `person_id` NULL)

## 3. Backend - CRUD de Personas

- [x] 3.1 Crear DTOs: `CreatePersonDto`, `UpdatePersonDto`, `PersonResponseDto` (usar `@ApiProperty`/`@ApiPropertyOptional` con `type` explícito)
- [x] 3.2 Crear `PersonService` con CRUD y búsqueda por nombre/apellido (insensible a mayúsculas) + paginación
- [x] 3.3 Crear `PersonController` con endpoints `GET/POST /mission/people`, `GET/PATCH/DELETE /mission/people/:id`
- [x] 3.4 Agregar decoradores OpenAPI completos (`@ApiTags`, `@ApiOperation`, `@ApiResponse`)
- [x] 3.5 Proteger creación/edición/eliminación con `MISSION_FULL_ACCESS_ROLES`; permitir lectura a roles autenticados
- [x] 3.6 Validar `firstName` obligatorio; resto opcional

## 4. Backend - Repositorio y seeders

- [x] 4.1 Crear `PersonRepository` siguiendo el patrón de repositorios del proyecto
- [x] 4.2 Crear `PersonSeeder` en `src/seeds/mission/` con Personas de ejemplo a partir de los datos del Excel
- [x] 4.3 Registrar el seeder en el runner principal (`seeder.ts` / `scripts/seeders/run-all.ts`), idempotente (no duplicar si ya existe)

## 5. Frontend - Navegación del módulo

- [x] 5.1 Cargar skill `church-ui-design` antes de implementar componentes
- [x] 5.2 Agregar sección "Misionero" al sidebar con `data-testid="nav-misionero"`
- [x] 5.3 Agregar rutas `/misionero/*` en `App.tsx` con sub-navegación
- [x] 5.4 Crear layout del módulo misionero con sub-navegación (entrada "Personas")
- [x] 5.5 Restringir acciones de escritura del módulo a roles con control total

## 6. Frontend - Mantenedor de Personas

- [x] 6.1 Regenerar cliente API desde OpenAPI (`npm run generate:api`); restaurar `request.ts` con git si queda vacío
- [x] 6.2 Crear página de listado de Personas con búsqueda y paginación (variante mobile/desktop)
- [x] 6.3 Crear formulario de creación/edición de Persona
- [x] 6.4 Mostrar badge de "Miembro bautizado" en listado y detalle
- [x] 6.5 Agregar eliminación con diálogo de confirmación
- [x] 6.6 Ocultar acciones de creación/edición/eliminación para roles de solo lectura

## 7. Verificación

- [x] 7.1 Probar CRUD de Personas vía API (control total)
- [x] 7.2 Verificar que un rol de solo lectura puede listar/ver pero no modificar
- [x] 7.3 Probar el flujo de creación de Persona en el frontend
- [x] 7.4 Verificar búsqueda por nombre en el listado
- [x] 7.5 Verificar que la migración corre limpio sobre una base existente
