## 1. Verificar helper toDto() y exportaciones

- [x] 1.1 Verificar que `toDto()` en `common/serialization/to-dto.ts` maneja correctamente arrays y objetos individuales, y que está exportado desde `common/index.ts`
- [x] 1.2 Verificar que `@Expose()` y `@Type()` de class-transformer están disponibles en los módulos que los necesitan

## 2. Migrar servicios con mapToDto manual a toDto()

- [x] 2.1 Refactorizar `UsersService`: reemplazar `this.mapToDto(user)` con `toDto(UserResponseDto, user)`, manejar campos calculados (`personId`, `personName`) con asignación post-`toDto()` o `@Transform()`, y eliminar el método privado `mapToDto`
- [x] 2.2 Refactorizar `BibleStudyService`: reemplazar `this.mapToDto(study)` con `toDto(BibleStudyResponseDto, study)`, migrar campos calculados (`instructorTeam.audience`, `student`, `course`, `instructor`) a `@Transform()` en el DTO, y eliminar el método privado `mapToDto`
- [x] 2.3 Verificar que las respuestas API de `/users` y `/mission/bible-studies` son idénticas antes y después del refactor

## 3. Crear DTOs de respuesta para módulos de catálogos

- [x] 3.1 Crear `SabbathClassResponseDto` con `@Expose()` + `@ApiProperty()` en cada campo, replicando la forma de `SabbathClassEntity`
- [x] 3.2 Crear `VisitStatusResponseDto` con `@Expose()` + `@ApiProperty()` en cada campo, replicando la forma de `VisitStatusEntity`
- [x] 3.3 Crear `RescueStageResponseDto` con `@Expose()` + `@ApiProperty()` en cada campo, replicando la forma de `RescueStageEntity`
- [x] 3.4 Actualizar `SabbathClassService` para usar `toDto(SabbathClassResponseDto, ...)` en todos los métodos que retornan entidades
- [x] 3.5 Actualizar `VisitStatusesService` para usar `toDto(VisitStatusResponseDto, ...)` en todos los métodos que retornan entidades
- [x] 3.6 Actualizar `RescueStagesService` para usar `toDto(RescueStageResponseDto, ...)` en todos los métodos que retornan entidades
- [x] 3.7 Actualizar los controllers de catálogos para tipar los retornos con los nuevos DTOs de respuesta
- [x] 3.8 Verificar que las respuestas API de `/catalogs/*` son idénticas antes y después del refactor

## 4. Crear DTOs de respuesta para módulo document-center

- [x] 4.1 Crear `PeriodResponseDto` con `@Expose()` + `@ApiProperty()` en cada campo
- [x] 4.2 Crear `ChurchDocumentResponseDto` con `@Expose()` + `@ApiProperty()` en cada campo
- [x] 4.3 Crear `ElderShiftResponseDto` con `@Expose()` + `@ApiProperty()` en cada campo
- [x] 4.4 Actualizar `PeriodService` para usar `toDto(PeriodResponseDto, ...)` en todos los métodos que retornan entidades
- [x] 4.5 Actualizar `DocumentCenterService` para usar `toDto(ChurchDocumentResponseDto, ...)` en todos los métodos que retornan entidades
- [x] 4.6 Actualizar el controller de document-center para tipar los retornos con los nuevos DTOs
- [x] 4.7 Verificar que las respuestas API de `/document-center/*` son idénticas antes y después del refactor

## 5. Crear DTO de respuesta para módulo hymn

- [x] 5.1 Crear `HymnResponseDto` con `@Expose()` + `@ApiProperty()` en cada campo
- [x] 5.2 Actualizar `HymnService` para usar `toDto(HymnResponseDto, ...)` en todos los métodos que retornan entidades
- [x] 5.3 Actualizar el controller de hymn para tipar los retornos con el nuevo DTO
- [x] 5.4 Verificar que las respuestas API de `/worship-services/hymns` son idénticas antes y después del refactor

## 6. Migrar @Transform a @Type donde sea posible

- [x] 6.1 Evaluar y migrar `DepartmentResponseDto.directors` de `@Transform()` a `@Expose()` + `@Type()` si la relación viene cargada desde TypeORM — **Mantenido**: `directors` no es relación cargada en la entidad, `@Transform()` es necesario
- [x] 6.2 Evaluar y migrar `EventResponseDto.department` de `@Transform()` a `@Expose()` + `@Type()` si es posible — **Migrado**: eliminado `@Transform()`, ahora usa solo `@Type(() => EventDepartmentDto)`
- [x] 6.3 Evaluar `EventResponseDto.coverImageUrl` — mantener `@Transform()` ya que calcula un valor que no existe en la entidad — **Mantenido**
- [x] 6.4 Verificar que las respuestas API de `/departments` y `/calendar/events` son idénticas antes y después de la migración

## 7. Verificación final y limpieza

- [x] 7.1 Ejecutar `npm run build` en backend para verificar que no hay errores de compilación — **PASS**
- [x] 7.2 Ejecutar tests existentes para verificar que no hay regresiones — **PASS** (2 fallos preexistentes no relacionados con este change)
- [x] 7.3 Verificar que ningún servicio retorna entidades directamente (grep por tipos de retorno en services) — **PASS**
- [x] 7.4 Verificar que ningún método `mapToDto` privado queda en el codebase — **PASS**
- [x] 7.5 Regenerar cliente OpenAPI del frontend si los tipos cambiaron (`npm run generate:api` en frontend) — **Regenerado**: cambios en RescueStagesService y VisitStatusesService del cliente
