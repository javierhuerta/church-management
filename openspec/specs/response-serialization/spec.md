# Response Serialization

## Purpose
Estandarizar la serialización de respuestas API en todo el backend NestJS para garantizar consistencia, seguridad y mantenibilidad.

## Requirements

### Requirement: Todos los servicios deben devolver DTOs de respuesta
El sistema SHALL garantizar que ningún servicio devuelva una entidad TypeORM directamente al controller. Todos los servicios MUST usar el helper `toDto()` de `common/serialization` para transformar entidades en DTOs de respuesta antes de retornarlos.

#### Scenario: Servicio que actualmente devuelve entidad directa
- **WHEN** un servicio de catálogo (sabbath-class, visit-statuses, rescue-stages) o document-center recibe una solicitud
- **THEN** el servicio SHALL transformar la entidad en su DTO de respuesta correspondiente usando `toDto()` antes de retornar

#### Scenario: Servicio que actualmente usa mapToDto manual
- **WHEN** un servicio como UsersService o BibleStudyService necesita serializar una respuesta
- **THEN** el servicio SHALL usar `toDto(DtoClass, entity)` en vez de un método privado `mapToDto()` que copia campos manualmente

### Requirement: Todos los DTOs de respuesta deben usar @Expose() en cada campo
El sistema SHALL garantizar que cada campo expuesto en un DTO de respuesta tiene el decorador `@Expose()` de class-transformer. Esto permite que `excludeExtraneousValues: true` filtre automáticamente cualquier campo no decorado.

#### Scenario: DTO de respuesta sin @Expose en algún campo
- **WHEN** se define un DTO de respuesta con un campo que falta el decorador `@Expose()`
- **THEN** ese campo SHALL ser excluido de la respuesta API serializada por `toDto()`

#### Scenario: DTO de respuesta con todos los campos decorados
- **WHEN** se define un DTO de respuesta donde todos los campos tienen `@Expose()`
- **THEN** `toDto()` SHALL incluir exactamente esos campos en la respuesta, sin campos extra de la entidad

### Requirement: Entidades con campos sensibles deben usar @Exclude()
El sistema SHALL garantizar que las entidades TypeORM con campos sensibles (passwords, tokens, secrets) usen `@Exclude()` de class-transformer como capa de seguridad adicional.

#### Scenario: Entidad User con campo password
- **WHEN** la entidad `User` tiene un campo `password`
- **THEN** el campo `password` SHALL tener el decorador `@Exclude()` para prevenir filtración accidental

#### Scenario: Entidad sin campos sensibles
- **WHEN** una entidad no tiene campos sensibles (ej: `SabbathClass`, `Department`)
- **THEN** la entidad SHALL NO requerir decoradores `@Exclude()` — la protección la provee el DTO de respuesta con `excludeExtraneousValues: true`

### Requirement: Helper toDto() como único mecanismo de serialización
El sistema SHALL usar exclusivamente el helper `toDto()` de `common/serialization/to-dto.ts` como mecanismo de serialización de respuestas. Este helper usa `plainToInstance` con `excludeExtraneousValues: true`.

#### Scenario: Serialización de una entidad individual
- **WHEN** un servicio necesita serializar una entidad individual
- **THEN** SHALL usar `toDto(DtoClass, entity)` que retorna una instancia del DTO con solo los campos `@Expose()`

#### Scenario: Serialización de un array de entidades
- **WHEN** un servicio necesita serializar un array de entidades
- **THEN** SHALL usar `toDto(DtoClass, entities)` que retorna un array de instancias del DTO

#### Scenario: Campos calculados después de toDto()
- **WHEN** un DTO tiene campos que requieren lógica de negocio adicional (ej: concatenar nombre/apellido, calcular URL de cover)
- **THEN** el servicio MAY asignar esos campos después de llamar `toDto()`, o el DTO MAY usar `@Transform()` para la transformación

### Requirement: DTOs de respuesta para módulos de catálogos
El sistema SHALL tener DTOs de respuesta para cada entidad de catálogo: `SabbathClassResponseDto`, `VisitStatusResponseDto`, `RescueStageResponseDto`. Estos DTOs replican los campos de las entidades correspondientes con `@Expose()` + `@ApiProperty()`.

#### Scenario: SabbathClassResponseDto
- **WHEN** el servicio `SabbathClassService` retorna una clase sabática
- **THEN** SHALL retornar un `SabbathClassResponseDto` con campos: id, name, description, displayOrder, isActive, createdAt, updatedAt

#### Scenario: VisitStatusResponseDto
- **WHEN** el servicio `VisitStatusesService` retorna un estado de visita
- **THEN** SHALL retornar un `VisitStatusResponseDto` con campos: id, name, description, displayOrder, isActive, color, createdAt, updatedAt

#### Scenario: RescueStageResponseDto
- **WHEN** el servicio `RescueStagesService` retorna una etapa de rescate
- **THEN** SHALL retornar un `RescueStageResponseDto` con campos: id, name, description, displayOrder, isActive, color, createdAt, updatedAt

### Requirement: DTOs de respuesta para módulo document-center
El sistema SHALL tener DTOs de respuesta para las entidades de document-center: `PeriodResponseDto`, `ChurchDocumentResponseDto`, `ElderShiftResponseDto`.

#### Scenario: PeriodResponseDto
- **WHEN** el servicio `PeriodService` retorna un período
- **THEN** SHALL retornar un `PeriodResponseDto` con los campos correspondientes al período

#### Scenario: ChurchDocumentResponseDto
- **WHEN** el servicio `DocumentCenterService` retorna un documento
- **THEN** SHALL retornar un `ChurchDocumentResponseDto` con los campos correspondientes al documento

#### Scenario: ElderShiftResponseDto
- **WHEN** el servicio retorna un turno de anciano
- **THEN** SHALL retornar un `ElderShiftResponseDto` con los campos correspondientes al turno

### Requirement: DTO de respuesta para módulo hymn
El sistema SHALL tener un `HymnResponseDto` para la entidad `Hymn`.

#### Scenario: HymnResponseDto
- **WHEN** el servicio `HymnService` retorna un himno
- **THEN** SHALL retornar un `HymnResponseDto` con campos: id, number, title, lyrics, author, createdAt, updatedAt

### Requirement: Eliminación de métodos mapToDto manuales
El sistema SHALL eliminar todos los métodos privados `mapToDto()` que copian campos manualmente, reemplazándolos con llamadas a `toDto()`.

#### Scenario: UsersService.mapToDto eliminado
- **WHEN** `UsersService` necesita serializar un usuario
- **THEN** SHALL usar `toDto(UserResponseDto, user)` en vez de `this.mapToDto(user)`
- **AND** el método privado `mapToDto` SHALL ser eliminado

#### Scenario: BibleStudyService.mapToDto eliminado
- **WHEN** `BibleStudyService` necesita serializar un estudio bíblico
- **THEN** SHALL usar `toDto(BibleStudyResponseDto, study)` en vez de `this.mapToDto(study)`
- **AND** el método privado `mapToDto` SHALL ser eliminado
- **AND** los campos calculados (ej: `instructorTeam.audience`) SHALL manejarse con `@Transform()` en el DTO o asignación post-`toDto()`

### Requirement: Migración de @Transform a @Type donde sea posible
El sistema SHALL migrar los decoradores `@Transform()` que copian campos de relaciones a `@Type()` + `@Expose()` cuando la relación ya está cargada por TypeORM.

#### Scenario: DepartmentResponseDto.directors
- **WHEN** `DepartmentResponseDto.directors` usa `@Transform()` para mapear la relación `directors`
- **THEN** SHALL migrar a `@Expose()` + `@Type(() => DirectorSummaryDto)` si la relación viene cargada desde TypeORM

#### Scenario: EventResponseDto.department
- **WHEN** `EventResponseDto.department` usa `@Transform()` para mapear la relación `department`
- **THEN** SHALL evaluar si `@Type()` es suficiente o si `@Transform()` es necesario por lógica de negocio (ej: valores default)

#### Scenario: Transform que calcula valores (no mapeo de relación)
- **WHEN** un `@Transform()` calcula un valor que no existe en la entidad (ej: `coverImageUrl`, `audience`)
- **THEN** ese `@Transform()` SHALL mantenerse, ya que no es un simple mapeo de relación

### Requirement: Contratos API sin cambios
El sistema SHALL garantizar que los contratos API (forma de las respuestas JSON) permanezcan idénticos después del refactor. Ningún campo SHALL ser agregado ni eliminado de las respuestas existentes.

#### Scenario: Respuesta de endpoint existente antes y después del refactor
- **WHEN** se refactoriza un servicio para usar `toDto()` en vez de entidad directa o `mapToDto`
- **THEN** la respuesta JSON SHALL ser idéntica a la respuesta antes del refactor
