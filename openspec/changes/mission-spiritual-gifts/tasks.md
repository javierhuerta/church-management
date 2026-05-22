## 1. Backend - Catálogo de áreas de actividad

- [ ] 1.1 Crear entidad `ActivityArea` (`code`, `name`, `displayOrder`)
- [ ] 1.2 Crear migración para la tabla `activity_areas`
- [ ] 1.3 Crear `ActivityAreaService` y endpoint `GET /mission/activity-areas`
- [ ] 1.4 Crear `ActivityAreaSeeder` en `src/seeds/mission/` con las 14 áreas de actividad (A–N) del Excel, idempotente

## 2. Backend - Evaluación de dones: entidad

- [ ] 2.1 Crear enums `GiftStartMode` (`ProbarUnaVez`, `IntegrarmeUnMes`, `Capacitacion`, `Orientacion`, `SinRespuesta`) y `GiftStage` (`Registrado`, `Contactado`, `EnIntegracion`, `Integrado`)
- [ ] 2.2 Crear entidad `GiftAssessment` con FK a `Person` y `User` usando `@JoinColumn`, dos relaciones M:N a `ActivityArea` (afinidad y top), y columna `startModes` de tipo `enum[]` para multi-selección
- [ ] 2.3 Crear migración para la tabla `gift_assessments`
- [ ] 2.4 Crear migraciones para las tablas de unión `gift_assessment_affinity_areas` y `gift_assessment_top_areas`

## 3. Backend - Evaluación de dones: CRUD

- [ ] 3.1 Crear DTOs: `CreateGiftAssessmentDto`, `UpdateGiftAssessmentDto`, `GiftAssessmentResponseDto`
- [ ] 3.2 Crear `GiftAssessmentService` con CRUD y filtros por área de afinidad y por etapa
- [ ] 3.3 Validar: una Persona = una evaluación; top 3 con máximo 3 áreas; top áreas contenidas en áreas afines
- [ ] 3.4 Crear `GiftAssessmentController` con endpoints CRUD, filtros y decoradores OpenAPI
- [ ] 3.5 Restringir creación/edición/eliminación a `MISSION_FULL_ACCESS_ROLES`
- [ ] 3.6 Crear repositorios para `ActivityArea` y `GiftAssessment`
- [ ] 3.7 Bloquear eliminación de una `Person` con evaluación de dones (ampliar `mission-people`)
- [ ] 3.8 Exponer la evaluación de dones en el detalle de la Persona (ampliar `mission-people`)
- [ ] 3.9 Crear `GiftAssessmentSeeder` en `src/seeds/mission/` con las evaluaciones del Excel (depende de `PersonSeeder` y `ActivityAreaSeeder`); registrar ambos seeders en el runner en orden de dependencia

## 4. Frontend - Descubrimiento de dones

- [ ] 4.1 Cargar skill `church-ui-design` antes de implementar componentes
- [ ] 4.2 Regenerar cliente API desde OpenAPI; restaurar `request.ts` con git si queda vacío
- [ ] 4.3 Agregar sub-sección "Descubrimiento de dones" a la navegación del módulo
- [ ] 4.4 Crear página de listado de evaluaciones con filtros por área y por etapa
- [ ] 4.5 Crear formulario de creación/edición de evaluación (multi-selección de áreas afines, top 3, multi-selección de modos de inicio, etapa)
- [ ] 4.6 Validar en el formulario el máximo de 3 áreas top
- [ ] 4.7 Mostrar la evaluación de dones en el detalle de la Persona

## 5. Verificación

- [ ] 5.1 Probar CRUD de evaluaciones vía API
- [ ] 5.2 Verificar las validaciones (una evaluación por persona, máximo 3 top, top ⊆ afines)
- [ ] 5.3 Verificar el filtro de Personas por área de actividad afín
- [ ] 5.4 Verificar bloqueo de eliminación de Persona con evaluación
- [ ] 5.5 Probar el flujo completo en el frontend
- [ ] 5.6 Verificar que las migraciones y el seeder corren limpio
