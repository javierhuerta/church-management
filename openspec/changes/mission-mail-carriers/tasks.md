## 1. Backend - Carteros misioneros

- [ ] 1.1 Crear enum `JacketSize` (`S`, `M`, `L`, `XL`, `XXL`)
- [ ] 1.2 Crear entidad `MailCarrier` con FK a `Person` usando `@JoinColumn` (`person_id`)
- [ ] 1.3 Crear migración para la tabla `mail_carriers`
- [ ] 1.4 Crear DTOs: `CreateMailCarrierDto`, `UpdateMailCarrierDto`, `MailCarrierResponseDto`
- [ ] 1.5 Crear `MailCarrierService` con CRUD; validar una Persona = un registro de cartero
- [ ] 1.6 Crear `MailCarrierController` con endpoints CRUD y decoradores OpenAPI
- [ ] 1.7 Restringir creación/edición/eliminación a `MISSION_FULL_ACCESS_ROLES`

## 2. Backend - Capacitaciones

- [ ] 2.1 Crear enums `TrainingStatus` (`SinComenzar`, `EnCurso`, `Completada`) y `TrainingMode` (`Presencial`, `Online`, `Mixto`)
- [ ] 2.2 Crear entidad `Training` con FK a `User` usando `@JoinColumn` (`responsible_user_id`)
- [ ] 2.3 Crear migración para la tabla `trainings`
- [ ] 2.4 Crear migración para la tabla `training_attendees` (`training_id`, `person_id`, unique en la combinación)
- [ ] 2.5 Crear DTOs: `CreateTrainingDto`, `UpdateTrainingDto`, `TrainingResponseDto`
- [ ] 2.6 Crear `TrainingService` con CRUD y gestión de asistentes
- [ ] 2.7 Crear `TrainingController` con endpoints CRUD, gestión de asistentes y decoradores OpenAPI
- [ ] 2.8 Endpoints `POST /mission/trainings/:id/attendees` y `DELETE /mission/trainings/:id/attendees/:personId`
- [ ] 2.9 Restringir escritura a `MISSION_FULL_ACCESS_ROLES`

## 3. Backend - Repositorios y reglas compartidas

- [ ] 3.1 Crear repositorios para `MailCarrier` y `Training`
- [ ] 3.2 Bloquear eliminación de una `Person` que sea cartero o tenga asistencia registrada (ampliar `mission-people`)
- [ ] 3.3 Al eliminar una capacitación, eliminar sus filas de `training_attendees` sin borrar Personas
- [ ] 3.4 Crear `MailCarrierSeeder` y `TrainingSeeder` (con sus asistentes) en `src/seeds/mission/` a partir del Excel (dependen de `PersonSeeder`); registrarlos en el runner, idempotentes

## 4. Frontend - Carteros misioneros

- [ ] 4.1 Cargar skill `church-ui-design` antes de implementar componentes
- [ ] 4.2 Regenerar cliente API desde OpenAPI; restaurar `request.ts` con git si queda vacío
- [ ] 4.3 Agregar sub-sección "Carteros misioneros" a la navegación del módulo
- [ ] 4.4 Crear página de listado de carteros con contador y talla de chaqueta
- [ ] 4.5 Crear formulario de registro/edición de cartero

## 5. Frontend - Capacitaciones

- [ ] 5.1 Agregar sub-sección "Capacitaciones" a la navegación del módulo
- [ ] 5.2 Crear página de listado de capacitaciones con badge de estado y número de asistentes
- [ ] 5.3 Crear formulario de creación/edición de capacitación
- [ ] 5.4 Crear vista de detalle con gestión de asistentes (agregar/quitar)

## 6. Verificación

- [ ] 6.1 Probar CRUD de carteros y capacitaciones vía API
- [ ] 6.2 Verificar registro y eliminación de asistentes
- [ ] 6.3 Verificar bloqueo de eliminación de Persona cartero/con asistencia
- [ ] 6.4 Probar el flujo completo en el frontend
- [ ] 6.5 Verificar que las migraciones corren limpio
