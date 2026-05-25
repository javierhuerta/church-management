## Why

El backend tiene inconsistencias críticas en la serialización de respuestas API. Algunos módulos usan DTOs de respuesta con `@Expose()` + `toDto()`, otros devuelven entidades TypeORM directamente, y otros usan mapeo manual `mapToDto()` que replica campo a campo. Esto genera riesgo de filtrar datos sensibles (como passwords), respuestas API impredecibles, y código repetitivo difícil de mantener. Es necesario ahora porque cada nuevo módulo hereda estas inconsistencias y el problema crece con el codebase.

## What Changes

- **Estandarizar serialización en todos los módulos**: Todos los servicios deben devolver DTOs de respuesta, nunca entidades crudas.
- **Agregar `@Expose()` en cada campo de los DTOs de respuesta existentes**: Los DTOs que ya existen pero no usan `@Expose()` deben agregarlo en cada campo para que `excludeExtraneousValues: true` funcione correctamente.
- **Crear DTOs de respuesta para módulos que no los tienen**: Los módulos de catálogos (`sabbath-class`, `visit-statuses`, `rescue-stages`), `document-center` (`period`, `church-document`, `elder-shift`), y `hymn` devuelven entidades directamente. Necesitan DTOs de respuesta.
- **Reemplazar mapeo manual `mapToDto()` por `toDto()`**: Los servicios `UsersService` y `BibleStudyService` tienen métodos privados `mapToDto()` que copian campos manualmente. Deben usar el helper `toDto()` existente en `common/serialization`.
- **Agregar `@Exclude()` en campos sensibles de entidades**: Solo `User.password` tiene `@Exclude()`. Revisar si hay otros campos sensibles en entidades.
- **Eliminar `@Transform()` innecesarios en DTOs**: Algunos DTOs como `EventResponseDto` y `DepartmentResponseDto` usan `@Transform()` para mapear relaciones manualmente. Esto debe migrarse a `@Expose()` + `@Type()` cuando sea posible, o simplificarse.

## Capabilities

### New Capabilities
- `response-serialization`: Patrón estandarizado de serialización de respuestas API usando `@Expose()` en DTOs, `@Exclude()` en entidades, y helper `toDto()` en servicios. Cubre la convención, el helper existente, y la migración de todos los módulos.

### Modified Capabilities
- _(Ninguna — los cambios son de implementación, no de requisitos de spec existentes)_

## Impact

- **Módulos afectados**: `auth`, `users`, `calendar`, `departments`, `worship-services` (hymns, programs, templates), `mission` (bible-study, small-groups, visits, persons, rescue-members, missionary-teams), `catalogs` (sabbath-class, visit-statuses, rescue-stages), `document-center` (periods, documents, elder-shifts)
- **Archivos clave**: ~31 entidades, ~12 DTOs de respuesta existentes, ~15 servicios, ~1 helper (`common/serialization/to-dto.ts`)
- **APIs**: Sin cambios en contratos API — las respuestas mantienen la misma forma, solo se estandariza cómo se serializan internamente
- **Sin cambios en frontend**: Los contratos API no cambian, el frontend no necesita modificaciones

## Fuera del alcance

- Cambios en el frontend (los contratos API se mantienen idénticos)
- Refactor de la estructura de módulos NestJS
- Cambios en autenticación o autorización (roles/permisos)
- Migraciones de base de datos
- Creación de nuevos endpoints o funcionalidades
- Optimización de queries N+1 (problema separado)
- Refactor de validación de DTOs de entrada (create/update DTOs)