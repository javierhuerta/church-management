## Context

`program.service.findAll/findOne/findByDateRange` y `calendar.service.findAll/loadOne/uniqueShareSlug` construyen queryBuilders y `findOne({relations})` extensos inline. La lógica de negocio (permisos, transacciones) convive con la de acceso a datos.

## Goals / Non-Goals

**Goals:** extraer las queries complejas a repositorios custom inyectables; servicios más delgados y testeables; comportamiento idéntico.

**Non-Goals:** mover queries triviales, cambiar ORM, Unit of Work, tocar users/departments.

## Decisions

**1. Repositorios custom como providers que extienden/encapsulan el `Repository<T>` de TypeORM.** Patrón: clase `@Injectable()` que recibe `@InjectRepository(Entity)` (o `DataSource`) y expone métodos de dominio (`findWithFilters`, `findOneWithRelations`, `findByDateRange`, `generateUniqueShareSlug`). Alternativa descartada: `Repository.extend()` / custom repository de TypeORM 0.3 — funciona, pero la clase `@Injectable` es más natural para el DI de Nest y más fácil de mockear en tests.

**2. Los servicios inyectan el repo custom en vez de `@InjectRepository`.** Para las operaciones complejas. Las escrituras transaccionales (ya implementadas con `DataSource.transaction`) permanecen en el servicio, pasando el `EntityManager` donde aplique.

**3. Contrato idéntico.** Los métodos del repo devuelven las mismas entidades/relaciones que hoy; los servicios siguen mapeando a DTOs (cambio de serialización ya hecho).

## Risks / Trade-offs

- **[Riesgo] Romper la carga de relaciones (N+1 o relaciones faltantes)** → preservar exactamente los `relations`/joins actuales; cubrir con los specs de servicio existentes.
- **[Riesgo] Interacción con transacciones** → las queries de lectura van al repo; las escrituras multi-entidad siguen en el servicio con `EntityManager`.
- **[Trade-off] Más clases/archivos** a cambio de servicios enfocados y queries testeables aisladamente.

## Migration Plan

1. Crear `EventRepository`, mover findAll/loadOne/uniqueShareSlug, registrar provider, refactor `calendar.service`.
2. Crear `ProgramRepository`, mover findAll/findOne/findByDateRange, registrar, refactor `program.service`.
3. Correr specs de servicio (ajustar mocks: ahora mockean el repo custom).

Rollback: por commit y por módulo; comportamiento sin cambios.

## Open Questions

- ¿Incluir también las queries de `template-crud.service`, o limitarse a program/calendar en esta iteración?
