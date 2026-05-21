## Why

La auditoría marcó `arch-use-repository-pattern` como gap parcial: la lógica de queries (queryBuilder, filtros, joins) vive dentro de los servicios (`program.service`, `calendar.service`), mezclando reglas de negocio con acceso a datos. Eso dificulta el testeo y acopla los servicios a TypeORM. Extraer las queries complejas a repositorios custom mantiene los servicios enfocados en negocio.

## What Changes

- **Repositorios custom** para las consultas complejas: `ProgramRepository` (findAll con filtros, findOne con relaciones, findByDateRange) y `EventRepository` (findAll paginado/filtrado, loadOne con relaciones, uniqueShareSlug).
- **Los servicios consumen los repos custom** en lugar de construir queryBuilders inline.
- **Las queries quedan testeables** de forma aislada y mockeable desde los servicios.

## Capabilities

### New Capabilities
- `data-access-repositories`: encapsulación del acceso a datos complejo en repositorios custom, desacoplando la lógica de negocio de TypeORM.

### Modified Capabilities
(ninguna a nivel de comportamiento observable; es refactor interno)

## Impact

- **Módulos**: `CalendarModule`, `WorshipServicesModule` (registrar los repos custom como providers).
- **Archivos clave**: nuevos `calendar/repositories/event.repository.ts`, `worship-services/repositories/program.repository.ts`; `calendar.service.ts` y `program.service.ts` adelgazan.
- **Dependencias**: ninguna.
- **Roles/permisos**: sin cambios; la autorización permanece en los servicios.

## Fuera del alcance

- Migrar TODAS las queries triviales (`findOne({where})`) a repos — solo las complejas (queryBuilder/joins/filtros).
- Cambiar el ORM o introducir un patrón de Unit of Work.
- Repos para `users`/`departments` (sus queries son simples).
