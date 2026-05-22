## 1. Backend - Entidad y migración

- [ ] 1.1 Crear enum `MissionaryPairAudience` (`Ninos`, `Adolescentes`, `General`)
- [ ] 1.2 Crear entidad `MissionaryPair` con FKs `memberA`/`memberB` a `Person` usando `@JoinColumn` (`member_a_id`, `member_b_id`)
- [ ] 1.3 Crear migración para la tabla `missionary_pairs`
- [ ] 1.4 Crear migración para agregar columna nullable `instructor_pair_id` a `bible_studies` (FK ON DELETE SET NULL)

## 2. Backend - CRUD de parejas misioneras

- [ ] 2.1 Crear DTOs: `CreateMissionaryPairDto`, `UpdateMissionaryPairDto`, `MissionaryPairResponseDto` (incluir datos de ambos integrantes)
- [ ] 2.2 Crear `MissionaryPairService` con CRUD; validar que A y B sean Personas distintas
- [ ] 2.3 Implementar conteo de parejas activas
- [ ] 2.4 Bloquear eliminación de una pareja que sea instructora de estudios
- [ ] 2.5 Crear `MissionaryPairController` con endpoints CRUD y decoradores OpenAPI
- [ ] 2.6 Restringir creación/edición/eliminación a `MISSION_FULL_ACCESS_ROLES`
- [ ] 2.7 Crear repositorio de `MissionaryPair`
- [ ] 2.8 Crear `MissionaryPairSeeder` en `src/seeds/mission/` con las parejas del Excel (depende de `PersonSeeder`); registrarlo en el runner, idempotente

## 3. Backend - Ampliación de estudios bíblicos

- [ ] 3.1 Agregar relación `instructorPair` a la entidad `BibleStudy` con `@JoinColumn({ name: 'instructor_pair_id' })`
- [ ] 3.2 Validar exclusividad: un estudio tiene instructor Persona O pareja, no ambos
- [ ] 3.3 Agregar filtro `?instructorPairId=` al listado de estudios
- [ ] 3.4 Ampliar la regla de permiso de instructor-usuario: un usuario integrante de la pareja instructora puede gestionar el progreso del estudio
- [ ] 3.5 Actualizar DTOs de `BibleStudy` para exponer el instructor pareja
- [ ] 3.6 Bloquear eliminación de una `Person` integrante de una pareja (ampliar `mission-people`)

## 4. Frontend - Parejas misioneras

- [ ] 4.1 Cargar skill `church-ui-design` antes de implementar componentes
- [ ] 4.2 Regenerar cliente API desde OpenAPI; restaurar `request.ts` con git si queda vacío
- [ ] 4.3 Agregar sub-sección "Parejas misioneras" a la navegación del módulo
- [ ] 4.4 Crear página de listado de parejas con contador de activas y badges de audiencia/estado
- [ ] 4.5 Crear formulario de creación/edición de pareja (dos selectores de Persona, audiencia, activa, notas)
- [ ] 4.6 Agregar eliminación con diálogo de confirmación

## 5. Frontend - Selector de instructor en estudios

- [ ] 5.1 Modificar el formulario de estudio bíblico para que el instructor pueda ser Persona o Pareja
- [ ] 5.2 Mostrar el instructor pareja en el listado y detalle de estudios
- [ ] 5.3 Agregar filtro por pareja instructora en el listado de estudios

## 6. Verificación

- [ ] 6.1 Probar CRUD de parejas vía API
- [ ] 6.2 Verificar conteo de parejas activas
- [ ] 6.3 Verificar que un estudio acepta instructor Persona O pareja, no ambos
- [ ] 6.4 Verificar que un integrante-usuario de la pareja instructora puede gestionar el progreso del estudio
- [ ] 6.5 Verificar bloqueo de eliminación de Persona integrante de pareja
- [ ] 6.6 Probar el flujo completo en el frontend
- [ ] 6.7 Verificar que las migraciones corren limpio
