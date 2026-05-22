## 1. Backend - Cursos bíblicos

- [ ] 1.1 Crear entidad `BibleCourse` (`name`, `lessonCount`, `audience` opcional) extendiendo `BaseEntity`
- [ ] 1.2 Crear migración para la tabla `bible_courses`
- [ ] 1.3 Crear DTOs: `CreateBibleCourseDto`, `UpdateBibleCourseDto`, `BibleCourseResponseDto`
- [ ] 1.4 Crear `BibleCourseService` con CRUD; bloquear eliminación si el curso tiene estudios
- [ ] 1.5 Crear `BibleCourseController` con endpoints CRUD y decoradores OpenAPI
- [ ] 1.6 Restringir creación/edición/eliminación a `MISSION_FULL_ACCESS_ROLES`

## 2. Backend - Estudios bíblicos: entidad

- [ ] 2.1 Crear enum `BibleStudyStatus` (`Invitar`, `Estudiando`, `Graduado`, `Bautismo`, `Bautizado`)
- [ ] 2.2 Crear enum `LessonProgress` (`NoIniciado`, `EnCurso`, `Completo`)
- [ ] 2.3 Crear entidad `BibleStudy` con FKs a `Person` (student, instructor) y `BibleCourse`, usando `@JoinColumn` con columnas snake_case
- [ ] 2.4 Crear migración para la tabla `bible_studies`

## 3. Backend - Estudios bíblicos: CRUD

- [ ] 3.1 Crear DTOs: `CreateBibleStudyDto`, `UpdateBibleStudyDto`, `BibleStudyResponseDto` (incluir datos del estudiante, instructor y curso)
- [ ] 3.2 Crear `BibleStudyService` con CRUD y filtros por estado, instructor y curso
- [ ] 3.3 Validar `currentLesson` contra `course.lessonCount` cuando haya curso asignado
- [ ] 3.4 Implementar cálculo de totales por estado misionero
- [ ] 3.5 Crear `BibleStudyController` con endpoints CRUD, filtros y decoradores OpenAPI
- [ ] 3.6 Endpoint `GET /mission/people/:id/bible-studies` (estudios de una persona como estudiante)
- [ ] 3.7 Permisos: control total = CRUD completo; instructor-usuario = ver y actualizar progreso de sus estudios
- [ ] 3.8 Bloquear eliminación de una `Person` referenciada como estudiante o instructor (ampliar `mission-people`)

## 4. Backend - Repositorios y seeders

- [ ] 4.1 Crear repositorios para `BibleCourse` y `BibleStudy`
- [ ] 4.2 Crear `BibleCourseSeeder` en `src/seeds/mission/` con los 6 cursos iniciales
- [ ] 4.3 Crear `BibleStudySeeder` en `src/seeds/mission/` con estudios de ejemplo a partir del Excel (depende de `PersonSeeder` y `BibleCourseSeeder`)
- [ ] 4.4 Registrar ambos seeders en el runner de seeders, en orden de dependencia e idempotentes

## 5. Frontend - Cursos bíblicos

- [ ] 5.1 Cargar skill `church-ui-design` antes de implementar componentes
- [ ] 5.2 Regenerar cliente API desde OpenAPI; restaurar `request.ts` con git si queda vacío
- [ ] 5.3 Agregar sub-sección "Cursos bíblicos" a la navegación del módulo misionero
- [ ] 5.4 Crear página de listado de cursos con formulario de creación/edición y eliminación

## 6. Frontend - Interesados y estudios

- [ ] 6.1 Agregar sub-sección "Interesados y estudios" a la navegación del módulo
- [ ] 6.2 Crear página de listado de estudios con totales por estado y filtros (estado, curso, instructor)
- [ ] 6.3 Crear formulario de creación/edición de estudio (selectores de Persona con autocompletar, curso, estado, lección, notas)
- [ ] 6.4 Mostrar badge de estado misionero con colores de la paleta
- [ ] 6.5 Mostrar el progreso de estudios en el detalle de la Persona
- [ ] 6.6 Vista de instructor-usuario: solo sus estudios, edición limitada a progreso/estado/notas

## 7. Verificación

- [ ] 7.1 Probar CRUD de cursos y estudios vía API
- [ ] 7.2 Verificar totales por estado y filtros
- [ ] 7.3 Verificar que un instructor-usuario solo ve y edita sus estudios
- [ ] 7.4 Verificar bloqueo de eliminación de Persona referenciada
- [ ] 7.5 Probar el flujo completo en el frontend (crear estudio, actualizar progreso)
- [ ] 7.6 Verificar que las migraciones corren limpio
