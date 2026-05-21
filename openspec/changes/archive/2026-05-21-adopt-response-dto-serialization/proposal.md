## Why

La revisión contra la skill `nestjs-best-practices` (regla `api-use-dto-serialization`) reveló que ningún módulo controla la serialización de respuestas con class-transformer: hay **0 usos de `@Expose`** en todo el backend. En su lugar conviven los dos anti-patrones que la regla marca como incorrectos: `calendar`, `users` y `departments` hacen mapeo manual campo-a-campo (`toResponse()`), y `worship-services` retorna entidades de TypeORM directamente. Esto genera código repetitivo y frágil, acopla el contrato de la API a la forma de las entidades, y deja el `ClassSerializerInterceptor` global (ya registrado) sin efecto. Conviene unificar el patrón ahora, antes de sumar más módulos.

## What Changes

- **Anotar los response DTOs con class-transformer** (`@Expose`, `@Exclude`, `@Type`, `@Transform`) además de los `@ApiProperty` existentes.
- **Reemplazar los `toResponse()` manuales** de `users`, `departments` y `calendar` por `plainToInstance(Dto, entity, { excludeExtraneousValues: true })`.
- **Dejar de retornar entidades directamente** en `worship-services`: mapear a sus response DTOs (`ServiceTemplateResponseDto`, `ServiceProgramResponseDto`, `HymnResponseDto`, etc.).
- **Apoyarse en el `ClassSerializerInterceptor` global** (ya registrado) y usar `excludeExtraneousValues` para que solo los campos `@Expose` salgan en la respuesta.
- **Transformaciones derivadas** (p. ej. `departmentName`, `coverImageUrl`, `organizers[].kind`) se expresan con `@Transform`/`@Type` en el DTO en vez de en el servicio.

## Capabilities

### New Capabilities
- `response-serialization`: política única de serialización de respuestas basada en class-transformer, que controla exactamente qué campos expone la API y elimina el mapeo manual.

### Modified Capabilities
(ninguna requiere cambio de requisitos a nivel spec; el comportamiento observable de cada endpoint se mantiene — cambia la implementación de cómo se construye la respuesta)

## Impact

- **Módulos NestJS afectados**: `UsersModule`, `DepartmentsModule`, `CalendarModule`, `WorshipServicesModule`.
- **Archivos clave**: los 6 response DTOs (`user-response`, `department-response`, `event-response`, `template-response`, `program-response`, `hymn-response`) y los servicios `users.service.ts`, `departments.service.ts`, `calendar.service.ts`, y los servicios/controllers de worship-services.
- **Dependencias**: ninguna nueva (`class-transformer` ya está instalado).
- **OpenAPI/Frontend**: el contrato de respuesta debe permanecer **idéntico**; se regenera el cliente y se verifica que no haya diffs de campos.
- **Roles y permisos**: sin cambios.

## Fuera del alcance

- Serialización condicional por `groups` / por rol (se puede agregar después si se necesita exponer campos distintos por audiencia).
- Cambios en los DTOs de request (Create/Update) o en la validación.
- Cambios en la forma del contrato (renombrar/agregar/quitar campos de respuesta).
- Refactor a repository pattern o cualquier otro gap de la auditoría.
