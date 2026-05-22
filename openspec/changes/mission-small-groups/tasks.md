## 1. Backend - Entidades y migraciones

- [ ] 1.1 Crear enums `MeetingDay` (días de la semana) y `MeetingMode` (`Presencial`, `Online`, `Mixto`)
- [ ] 1.2 Crear entidad `SmallGroup` con FK `leader` a `User` y FK `promoter` a `Person`, usando `@JoinColumn` (`leader_user_id`, `promoter_person_id`)
- [ ] 1.3 Crear migración para la tabla `small_groups`
- [ ] 1.4 Crear migración para la tabla `small_group_members` (`small_group_id`, `person_id`, unique en `person_id`)

## 2. Backend - CRUD de grupos pequeños

- [ ] 2.1 Crear DTOs: `CreateSmallGroupDto`, `UpdateSmallGroupDto`, `SmallGroupResponseDto` (incluir líder, promotor, número de integrantes)
- [ ] 2.2 Crear `SmallGroupService` con CRUD
- [ ] 2.3 Crear `SmallGroupController` con endpoints CRUD y decoradores OpenAPI
- [ ] 2.4 Restringir creación/eliminación a `MISSION_FULL_ACCESS_ROLES`
- [ ] 2.5 Permitir al maestro de clase editar el grupo del que es líder (`leaderUserId == user.id`)
- [ ] 2.6 Endpoint `GET /mission/small-groups/my` (grupos liderados por el usuario autenticado)
- [ ] 2.7 Crear repositorio de `SmallGroup`

## 3. Backend - Gestión de integrantes

- [ ] 3.1 Endpoint `POST /mission/small-groups/:id/members` para agregar una Persona como integrante
- [ ] 3.2 Endpoint `DELETE /mission/small-groups/:id/members/:personId` para quitar un integrante
- [ ] 3.3 Validar que una Persona pertenezca a un solo grupo a la vez
- [ ] 3.4 Permitir gestión de integrantes a control total y al maestro de clase del grupo
- [ ] 3.5 Bloquear eliminación de una `Person` integrante o promotora de un grupo (ampliar `mission-people`)
- [ ] 3.6 Al eliminar un grupo, eliminar sus filas de `small_group_members` sin borrar las Personas
- [ ] 3.7 Crear `SmallGroupSeeder` en `src/seeds/mission/` con los grupos del Excel y sus integrantes (depende de `PersonSeeder`); registrarlo en el runner, idempotente

## 4. Frontend - Grupos pequeños

- [ ] 4.1 Cargar skill `church-ui-design` antes de implementar componentes
- [ ] 4.2 Regenerar cliente API desde OpenAPI; restaurar `request.ts` con git si queda vacío
- [ ] 4.3 Agregar sub-sección "Grupos pequeños" a la navegación del módulo
- [ ] 4.4 Crear página de listado de grupos (líder, día/horario, número de integrantes, badges)
- [ ] 4.5 Crear formulario de creación/edición de grupo (selector de maestro de clase, promotor, día, modalidad)
- [ ] 4.6 Crear vista de detalle del grupo con gestión de integrantes (agregar/quitar)
- [ ] 4.7 Vista del maestro de clase: ver y editar solo su propio grupo, sin opciones de crear/eliminar

## 5. Verificación

- [ ] 5.1 Probar CRUD de grupos y gestión de integrantes vía API
- [ ] 5.2 Verificar que una Persona no puede estar en dos grupos
- [ ] 5.3 Verificar que un maestro de clase ve y edita solo su grupo
- [ ] 5.4 Verificar bloqueo de eliminación de Persona integrante/promotora
- [ ] 5.5 Probar el flujo completo en el frontend
- [ ] 5.6 Verificar que las migraciones corren limpio
