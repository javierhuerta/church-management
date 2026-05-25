## Context

El backend del sistema church-management tiene un problema de consistencia en la capa de serialización. Actualmente coexisten tres patrones diferentes:

1. **DTOs con `@Expose()` + `toDto()`**: Módulos como `calendar`, `worship-services`, `departments` y `users` usan DTOs de respuesta con `@Expose()` en cada campo y el helper `toDto()` de `common/serialization`. Este es el patrón correcto.

2. **Mapeo manual `mapToDto()`**: Los servicios `UsersService` y `BibleStudyService` tienen métodos privados `mapToDto()` que copian campo a campo manualmente, incluso para campos que ya tienen `@Expose()`. Esto genera código duplicado y propenso a errores.

3. **Entidades devueltas directamente**: Los módulos de catálogos (`sabbath-class`, `visit-statuses`, `rescue-stages`), `document-center` y `hymn` devuelven entidades TypeORM crudas desde los servicios, sin pasar por ningún DTO de respuesta.

El helper `toDto()` ya existe en `common/serialization/to-dto.ts` y usa `plainToInstance` con `excludeExtraneousValues: true`, que es el mecanismo correcto para filtrar campos. El problema es que no se usa de forma consistente.

### Estado actual por módulo

| Módulo | Patrón actual | DTOs de respuesta | `@Expose()` en DTOs | Usa `toDto()` |
|--------|---------------|-------------------|---------------------|---------------|
| `auth/user` | `@Exclude()` en entidad | Sí | Sí | No (usa `mapToDto` manual) |
| `users` | `mapToDto` manual | Sí | Sí | No |
| `calendar` | `@Expose` + `@Transform` | Sí | Sí | Parcial |
| `departments` | `@Expose` + `@Transform` | Sí | Sí | Parcial |
| `worship-services` | `@Expose` + `@Type` | Sí | Sí | Sí |
| `mission/bible-study` | `mapToDto` manual | Sí | No (asigna manual) | No |
| `mission/small-groups` | `toDto` | Sí | Sí | Sí |
| `mission/visits` | `toDto` | Sí | Sí | Sí |
| `catalogs/*` | Entidad directa | No | N/A | No |
| `document-center` | Entidad directa | No | N/A | No |
| `hymn` | Entidad directa | No | N/A | No |

## Goals / Non-Goals

**Goals:**
- Todos los servicios devuelven DTOs de respuesta, nunca entidades crudas
- Todos los DTOs de respuesta usan `@Expose()` en cada campo expuesto
- Todas las entidades con campos sensibles usan `@Exclude()` como capa de seguridad
- Todos los servicios usan el helper `toDto()` de `common/serialization` en vez de mapeo manual
- Los contratos API permanecen idénticos — sin cambios en la forma de las respuestas
- Eliminar métodos `mapToDto()` privados que duplican lógica de `@Expose()`

**Non-Goals:**
- Refactor de la estructura de módulos NestJS
- Cambios en autenticación, autorización o roles
- Optimización de queries N+1 (problema separado)
- Cambios en DTOs de entrada (create/update)
- Cambios en el frontend
- Creación de nuevos endpoints

## Decisions

### D1: Patrón de serialización — `@Expose()` + `toDto()` en todos los módulos

**Decisión**: Usar el patrón existente `@Expose()` en cada campo del DTO + helper `toDto()` en servicios como estándar único.

**Alternativa considerada**: Crear un decorador personalizado `@ApiExpose()` que combine `@ApiProperty` + `@Expose`. **Descartada** porque el usuario prefiere código simple y repetitivo sobre abstracciones que ocultan comportamiento.

**Razón**: El patrón ya funciona en varios módulos (`worship-services`, `mission/small-groups`, `mission/visits`). Es explícito, predecible y fácil de auditar. Cada campo que aparece en la respuesta API está decorado con `@Expose()`, y `excludeExtraneousValues: true` garantiza que nada se filtre accidentalmente.

### D2: Eliminar `mapToDto()` manual — reemplazar con `toDto()`

**Decisión**: Los métodos privados `mapToDto()` en `UsersService` y `BibleStudyService` se eliminan. Los campos calculados (como `personName` en `UserResponseDto`) se manejan con `@Transform()` en el DTO o se asignan después de `toDto()`.

**Razón**: El mapeo manual duplica la definición de campos que ya está en el DTO con `@Expose()`. Si se agrega un campo al DTO pero se olvida el `mapToDto()`, el campo no aparece en la respuesta. Con `toDto()`, basta con agregar `@Expose()` al campo.

**Para campos calculados**: Se usa `@Transform()` en el DTO cuando la transformación es simple (ej: concatenar nombre/apellido), o se asigna después de `toDto()` cuando la lógica es más compleja (ej: consultar datos adicionales).

### D3: DTOs de respuesta para módulos de catálogos y document-center

**Decisión**: Crear DTOs de respuesta para `SabbathClass`, `VisitStatus`, `RescueStage`, `Period`, `ChurchDocument`, `ElderShift` y `Hymn`. Estos módulos actualmente devuelven entidades directamente.

**Razón**: Sin DTOs de respuesta, cualquier cambio en la entidad (agregar un campo interno) se filtra automáticamente a la API. Los DTOs actúan como contrato explícito entre backend y frontend.

### D4: `@Exclude()` en entidades — solo campos sensibles

**Decisión**: Mantener `@Exclude()` solo en campos sensibles de entidades (ej: `User.password`). No agregar `@Exclude()` a todas las entidades como capa general, ya que los DTOs de respuesta con `excludeExtraneousValues: true` ya filtran todo lo que no tiene `@Expose()`.

**Razón**: `@Exclude()` en entidades es una red de seguridad para el caso donde alguien olvide usar `toDto()` y devuelva la entidad directamente. Pero no es la capa principal de protección — los DTOs lo son. Agregar `@Exclude()` a todos los campos de todas las entidades sería ruido innecesario.

### D5: `@Transform()` en DTOs — migrar a `@Type()` cuando sea posible

**Decisión**: Los `@Transform()` que mapean relaciones manualmente (ej: `DepartmentResponseDto.directors`, `EventResponseDto.department`) se migran a `@Expose()` + `@Type()` cuando la relación ya viene cargada desde TypeORM. Se mantiene `@Transform()` solo para transformaciones que no se pueden resolver con `@Type()` (ej: `EventResponseDto.coverImageUrl` que calcula una URL de cover).

**Razón**: `@Type()` es más simple y predecible que `@Transform()`. Cuando la relación ya está cargada por TypeORM (con `relations`), `@Type()` + `@Expose()` serializa automáticamente. `@Transform()` se reserva para lógica de negocio que no es simple mapeo de campos.

## Risks / Trade-offs

- **[Riesgo: Respuestas API cambien accidentalmente]** → Mitigación: Los DTOs existentes ya definen la forma de las respuestas. Al agregar `@Expose()` a campos que ya lo tienen, no hay cambio. Para nuevos DTOs, se replica la forma exacta de la entidad. Se debe verificar con tests de integración que las respuestas no cambian.
- **[Riesgo: `@Transform()` complejos en BibleStudyService]** → Mitigación: El `mapToDto()` de `BibleStudyService` tiene lógica de negocio (ej: `inferTeamAudience`). Esta lógica se mueve al DTO como `@Transform()` o se asigna después de `toDto()`. No se pierde funcionalidad.
- **[Riesgo: Módulos de catálogos cambien su tipo de retorno]** → Mitigación: Los controllers de catálogos actualmente retornan `SabbathClassEntity[]`, etc. Al cambiar a DTOs, el tipo de retorno del controller cambia, pero la forma JSON de la respuesta se mantiene idéntica porque los DTOs replican los mismos campos.
- **[Trade-off: Verbosidad]** → Los DTOs con `@Expose()` en cada campo son verbosos, pero esto es intencional. El usuario prefiere código explícito y repetitivo sobre abstracciones que ocultan comportamiento.

## Migration Plan

1. **Fase 1 — Módulos que ya usan `toDto()` parcialmente**: Migrar `mapToDto()` manual a `toDto()` en `UsersService` y `BibleStudyService`. Eliminar métodos privados `mapToDto()`.

2. **Fase 2 — Módulos de catálogos**: Crear DTOs de respuesta para `SabbathClass`, `VisitStatus`, `RescueStage`. Actualizar servicios y controllers.

3. **Fase 3 — Módulo document-center**: Crear DTOs de respuesta para `Period`, `ChurchDocument`, `ElderShift`. Actualizar servicios y controllers.

4. **Fase 4 — Módulo hymn**: Crear DTO de respuesta para `Hymn`. Actualizar servicio y controller.

5. **Fase 5 — Limpieza de `@Transform()`**: Migrar `@Transform()` a `@Type()` donde sea posible en `EventResponseDto` y `DepartmentResponseDto`.

6. **Fase 6 — Verificación**: Ejecutar tests de integración para confirmar que las respuestas API no cambiaron. Regenerar cliente OpenAPI del frontend si es necesario.

**Rollback**: Cada fase es independiente. Si una fase causa problemas, se revierte solo esa fase. Los cambios son internos (serialización) y no afectan la base de datos.

## Open Questions

- ¿Hay campos en entidades de `document-center` o `catalogs` que deban excluirse de la API (ej: campos internos, IDs de relaciones que no se exponen actualmente)?
- ¿El módulo `mission/persons` necesita DTO de respuesta separado o ya usa `toDto()` consistentemente?

<!-- No UI Scenarios: backend-only change -->