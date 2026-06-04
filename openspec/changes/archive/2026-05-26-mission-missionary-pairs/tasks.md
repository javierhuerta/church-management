## 1. Backend - Clases de Escuela Sabática (CRUD)

- [x] 1.1 Crear `SabbathClassService` con CRUD y validación de eliminación (no eliminar si tiene grupos pequeños o equipos asociados)
- [x] 1.2 Crear DTOs: `CreateSabbathClassDto`, `UpdateSabbathClassDto`, `SabbathClassResponseDto`
- [x] 1.3 Crear `SabbathClassController` con endpoints CRUD y decoradores OpenAPI
- [x] 1.4 Restringir creación/edición/eliminación a roles con control total del módulo misionero
- [x] 1.5 Crear `SabbathClassSeeder` en `src/seeds/catalogs/` con las 8 clases del Excel (M. infantil, M. adolescente, Clase 1–6); registrar en el runner como categoría `catalog`, idempotente

## 2. Backend - Equipo misionero: entidades y migraciones

- [x] 2.1 Crear entidad `MissionaryTeam` con FKs a `Period` (obligatorio), `SmallGroup` (nullable), `SabbathClassEntity` (nullable) usando `@JoinColumn`; campos `label` (nullable), `isActive`, `notes`
- [x] 2.2 Crear entidad `MissionaryTeamMember` con FKs a `MissionaryTeam` y `Person` usando `@JoinColumn`; campos `joinedAt` (nullable), `leftAt` (nullable)
- [x] 2.3 Crear migración para la tabla `missionary_teams`
- [x] 2.4 Crear migración para la tabla `missionary_team_members`
- [x] 2.5 Crear migración para agregar columna nullable `instructor_team_id` a `bible_studies` (FK ON DELETE SET NULL)

## 3. Backend - Equipo misionero: CRUD

- [x] 3.1 Crear DTOs: `CreateMissionaryTeamDto`, `UpdateMissionaryTeamDto`, `MissionaryTeamResponseDto` (incluir miembros activos, audiencia inferida, nombre del grupo/clase)
- [x] 3.2 Crear `MissionaryTeamService` con CRUD; validar mínimo 2 miembros activos; validar que `smallGroupId` y `sabbathClassId` sean mutuamente excluyentes; validar que una Persona no esté en dos equipos activos del mismo período
- [x] 3.3 Implementar lógica de audiencia inferida: grupo pequeño → actionUnit/clase; clase directa → nombre; ninguno → "Iglesia"
- [x] 3.4 Implementar conteo de equipos activos por período
- [x] 3.5 Implementar agregar/remover miembros con `joinedAt`/`leftAt`; al remover, setear `leftAt` en vez de eliminar; advertir si el equipo queda con menos de 2 activos
- [x] 3.6 Bloquear eliminación de un equipo que sea instructor de estudios bíblicos
- [x] 3.7 Crear `MissionaryTeamController` con endpoints CRUD, filtros por período/grupo/clase y decoradores OpenAPI
- [x] 3.8 Restringir creación/edición/eliminación a `MISSION_FULL_ACCESS_ROLES`
- [x] 3.9 Crear repositorios para `MissionaryTeam` y `MissionaryTeamMember`
- [x] 3.10 Bloquear eliminación de una `Person` que sea miembro activo de un equipo misionero (ampliar `mission-people`)
- [x] 3.11 Exponer el equipo misionero en el detalle de la Persona (ampliar `mission-people`)

## 4. Backend - Ampliación de estudios bíblicos

- [x] 4.1 Agregar relación `instructorTeam` a la entidad `BibleStudy` con `@JoinColumn({ name: 'instructor_team_id' })`
- [x] 4.2 Validar exclusividad: un estudio tiene instructor Persona O equipo, no ambos
- [x] 4.3 Agregar filtro `?instructorTeamId=` al listado de estudios
- [x] 4.4 Ampliar la regla de permiso de instructor-usuario: un usuario miembro activo del equipo instructor puede gestionar el progreso del estudio
- [x] 4.5 Actualizar DTOs de `BibleStudy` para exponer el instructor equipo

## 5. Backend - Seeder de equipos misioneros

- [x] 5.1 Crear `MissionaryTeamSeeder` en `src/seeds/mission/` con los equipos del Excel (depende de `PersonSeeder`, `SabbathClassSeeder`, `SmallGroupSeeder` y existencia de un `Period` para el año 2026); registrar en el runner en orden de dependencia, idempotente

## 6. Frontend - Clases de Escuela Sabática

- [x] 6.1 Cargar skill `church-ui-design` antes de implementar componentes
- [x] 6.2 Regenerar cliente API desde OpenAPI; restaurar `request.ts` con git si queda vacío
- [x] 6.3 Agregar sub-sección "Clases ES" a la navegación del módulo misionero
- [x] 6.4 Crear página de listado de clases con nombre, descripción, orden y estado
- [x] 6.5 Crear formulario de creación/edición de clase (nombre, descripción, orden, activa)

## 7. Frontend - Equipos misioneros

- [x] 7.1 Agregar sub-sección "Equipos misioneros" a la navegación del módulo misionero
- [x] 7.2 Crear página de listado de equipos con selector de período, filtros por grupo pequeño y clase ES, contador de activos, badges de audiencia y estado
- [x] 7.3 Crear formulario de creación/edición de equipo (selector de período, multi-selector de Personas con mínimo 2, selector de grupo pequeño o clase ES mutuamente excluyentes, switch de activa, notas)
- [x] 7.4 Implementar vista de detalle de equipo con miembros activos e históricos (joinedAt/leftAt)
- [x] 7.5 Implementar agregar/remover integrantes con confirmación si el equipo queda con menos de 2 activos
- [x] 7.6 Mostrar el equipo misionero en el detalle de la Persona

## 8. Frontend - Selector de instructor en estudios

- [x] 8.1 Modificar el formulario de estudio bíblico para que el instructor pueda ser Persona o Equipo
- [x] 8.2 Mostrar el instructor equipo en el listado y detalle de estudios
- [x] 8.3 Agregar filtro por equipo instructor en el listado de estudios

## 9. Verificación

- [x] 9.1 Probar CRUD de clases de escuela sabática vía API
- [x] 9.2 Probar CRUD de equipos misioneros vía API
- [x] 9.3 Verificar que un equipo requiere mínimo 2 miembros activos
- [x] 9.4 Verificar que una Persona no puede estar en dos equipos activos del mismo período
- [x] 9.5 Verificar que `smallGroupId` y `sabbathClassId` son mutuamente excluyentes
- [x] 9.6 Verificar la audiencia inferida (grupo → clase, clase directa → nombre, ninguno → "Iglesia")
- [ ] 9.7 Verificar que un estudio acepta instructor Persona O equipo, no ambos [BLOQUEADO: requiere mission-bible-studies]
- [ ] 9.8 Verificar que un miembro activo del equipo instructor puede gestionar el progreso del estudio [BLOQUEADO: requiere mission-bible-studies]
- [ ] 9.9 Verificar bloqueo de eliminación de Persona miembro activo de equipo [pendiente: requiere backend corriendo]
- [ ] 9.10 Verificar bloqueo de eliminación de clase ES con grupos o equipos asociados [pendiente: requiere backend corriendo]
- [ ] 9.11 Probar el flujo completo en el frontend [pendiente: requiere backend corriendo]
- [ ] 9.12 Verificar que las migraciones y seeders corren limpio [pendiente: requiere backend corriendo]