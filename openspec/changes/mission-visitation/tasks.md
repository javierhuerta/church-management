## 1. Backend - Miembros a rescatar

- [x] 1.1 Crear enum `RescueStage` (`PorRescatar`, `Visitado`, `AsisteEsporadica`, `AsisteIglesia`, `DecisionRequerida`)
- [x] 1.2 Crear entidad `RescueMember` con FKs a `Person` y `User` usando `@JoinColumn` (`person_id`, `responsible_user_id`)
- [x] 1.3 Crear migración para la tabla `rescue_members`
- [x] 1.4 Crear DTOs: `CreateRescueMemberDto`, `UpdateRescueMemberDto`, `RescueMemberResponseDto`
- [x] 1.5 Crear `RescueMemberService` con CRUD y filtro por etapa; validar una Persona = un registro de rescate
- [x] 1.6 Crear `RescueMemberController` con endpoints CRUD y decoradores OpenAPI
- [x] 1.7 Restringir creación/edición/eliminación a `MISSION_FULL_ACCESS_ROLES`

## 2. Backend - Visitas

- [x] 2.1 Crear enum `VisitStatus` (`Planificada`, `Completada`, `Cancelada`)
- [x] 2.2 Crear entidad `Visit` con FKs a `Person`, `User` y `MissionaryPair` usando `@JoinColumn` (`person_id`, `responsible_user_id`, `responsible_pair_id`)
- [x] 2.3 Crear migración para la tabla `visits`
- [x] 2.4 Crear DTOs: `CreateVisitDto`, `UpdateVisitDto`, `VisitResponseDto`
- [x] 2.5 Crear `VisitService` con CRUD y filtros por estado y por persona; validar al menos un responsable presente
- [x] 2.6 Crear `VisitController` con endpoints CRUD, filtros y decoradores OpenAPI
- [x] 2.7 Endpoint `GET /mission/people/:id/visits` (historial de visitas de una persona)
- [x] 2.8 Restringir creación/edición/eliminación a `MISSION_FULL_ACCESS_ROLES`

## 3. Backend - Repositorios y reglas compartidas

- [x] 3.1 Crear repositorios para `RescueMember` y `Visit`
- [x] 3.2 Bloquear eliminación de una `Person` con visitas o registro de rescate (ampliar `mission-people`)
- [x] 3.3 Exponer el historial de visitas en el detalle de la Persona (ampliar `mission-people`)
- [x] 3.4 Crear `RescueMemberSeeder` y `VisitSeeder` en `src/seeds/mission/` con los datos del Excel (dependen de `PersonSeeder`); registrarlos en el runner, idempotentes

## 4. Frontend - Visitación

- [x] 4.1 Cargar skill `church-ui-design` antes de implementar componentes
- [x] 4.2 Regenerar cliente API desde OpenAPI; restaurar `request.ts` con git si queda vacío
- [x] 4.3 Agregar sub-secciones "Visitación" y "Miembros a rescatar" a la navegación del módulo
- [x] 4.4 Crear página de listado de visitas con filtro por estado y badges
- [x] 4.5 Crear formulario de registro/edición de visita (selector de Persona, estado, fechas, responsable, resultado)
- [x] 4.6 Crear página de listado de miembros a rescatar con filtro por etapa
- [x] 4.7 Crear formulario de registro/edición de miembro a rescatar
- [x] 4.8 Mostrar el historial de visitas en el detalle de la Persona

## 5. Verificación

- [x] 5.1 Probar CRUD de visitas y miembros a rescatar vía API
- [x] 5.2 Verificar el historial de visitas de una Persona
- [x] 5.3 Verificar filtros por estado y por etapa
- [x] 5.4 Verificar bloqueo de eliminación de Persona con visitas/rescate
- [x] 5.5 Probar el flujo completo en el frontend
- [x] 5.6 Verificar que las migraciones corren limpio
