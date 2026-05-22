## 1. Backend - Miembros a rescatar

- [ ] 1.1 Crear enum `RescueStage` (`PorRescatar`, `Visitado`, `AsisteEsporadica`, `AsisteIglesia`, `DecisionRequerida`)
- [ ] 1.2 Crear entidad `RescueMember` con FKs a `Person` y `User` usando `@JoinColumn` (`person_id`, `responsible_user_id`)
- [ ] 1.3 Crear migración para la tabla `rescue_members`
- [ ] 1.4 Crear DTOs: `CreateRescueMemberDto`, `UpdateRescueMemberDto`, `RescueMemberResponseDto`
- [ ] 1.5 Crear `RescueMemberService` con CRUD y filtro por etapa; validar una Persona = un registro de rescate
- [ ] 1.6 Crear `RescueMemberController` con endpoints CRUD y decoradores OpenAPI
- [ ] 1.7 Restringir creación/edición/eliminación a `MISSION_FULL_ACCESS_ROLES`

## 2. Backend - Visitas

- [ ] 2.1 Crear enum `VisitStatus` (`Planificada`, `Completada`, `Cancelada`)
- [ ] 2.2 Crear entidad `Visit` con FKs a `Person`, `User` y `MissionaryPair` usando `@JoinColumn` (`person_id`, `responsible_user_id`, `responsible_pair_id`)
- [ ] 2.3 Crear migración para la tabla `visits`
- [ ] 2.4 Crear DTOs: `CreateVisitDto`, `UpdateVisitDto`, `VisitResponseDto`
- [ ] 2.5 Crear `VisitService` con CRUD y filtros por estado y por persona; validar al menos un responsable presente
- [ ] 2.6 Crear `VisitController` con endpoints CRUD, filtros y decoradores OpenAPI
- [ ] 2.7 Endpoint `GET /mission/people/:id/visits` (historial de visitas de una persona)
- [ ] 2.8 Restringir creación/edición/eliminación a `MISSION_FULL_ACCESS_ROLES`

## 3. Backend - Repositorios y reglas compartidas

- [ ] 3.1 Crear repositorios para `RescueMember` y `Visit`
- [ ] 3.2 Bloquear eliminación de una `Person` con visitas o registro de rescate (ampliar `mission-people`)
- [ ] 3.3 Exponer el historial de visitas en el detalle de la Persona (ampliar `mission-people`)
- [ ] 3.4 Crear `RescueMemberSeeder` y `VisitSeeder` en `src/seeds/mission/` con los datos del Excel (dependen de `PersonSeeder`); registrarlos en el runner, idempotentes

## 4. Frontend - Visitación

- [ ] 4.1 Cargar skill `church-ui-design` antes de implementar componentes
- [ ] 4.2 Regenerar cliente API desde OpenAPI; restaurar `request.ts` con git si queda vacío
- [ ] 4.3 Agregar sub-secciones "Visitación" y "Miembros a rescatar" a la navegación del módulo
- [ ] 4.4 Crear página de listado de visitas con filtro por estado y badges
- [ ] 4.5 Crear formulario de registro/edición de visita (selector de Persona, estado, fechas, responsable, resultado)
- [ ] 4.6 Crear página de listado de miembros a rescatar con filtro por etapa
- [ ] 4.7 Crear formulario de registro/edición de miembro a rescatar
- [ ] 4.8 Mostrar el historial de visitas en el detalle de la Persona

## 5. Verificación

- [ ] 5.1 Probar CRUD de visitas y miembros a rescatar vía API
- [ ] 5.2 Verificar el historial de visitas de una Persona
- [ ] 5.3 Verificar filtros por estado y por etapa
- [ ] 5.4 Verificar bloqueo de eliminación de Persona con visitas/rescate
- [ ] 5.5 Probar el flujo completo en el frontend
- [ ] 5.6 Verificar que las migraciones corren limpio
