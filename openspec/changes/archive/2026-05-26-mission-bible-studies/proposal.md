## Why

El corazón del trabajo del Coordinador Misionero es el seguimiento de **interesados y estudiantes de la Biblia**. La pestaña "Interesados y estudiantes" del Excel registra ~90 personas con: un estado misionero (A=Bautismo, B=Graduado, C=Estudiando, D=Invitar a estudiar, Bautizado), el instructor que los acompaña, el curso bíblico que están tomando (Fe de Jesús, Daniel, Apocalipsis, etc.), la lección en que van, y notas de seguimiento.

Hoy todo esto es texto libre en una planilla: el instructor es un nombre suelto, el curso se escribe de cinco formas distintas ("Fe de Jesús", "fe de Jesús", "De de Jesús"), y no hay forma de listar "todos los estudiantes de un instructor" o "cuántos están en lección 10 o más". El coordinador necesita estructura para hacer seguimiento real del avance espiritual de cada persona.

Este change construye la capacidad central del módulo misionero: gestionar **cursos bíblicos** configurables y **estudios bíblicos** que vinculan una Persona (estudiante) con un curso, un instructor y un progreso. Depende del change `mission-people-registry`.

## What Changes

- **Backend** — capacidad de cursos bíblicos:
  - Entidad `BibleCourse` (mantenedor configurable: nombre, número de lecciones, audiencia opcional)
  - CRUD de cursos bíblicos
  - Cursos iniciales sembrados a partir del Excel: Fe de Jesús, Fe de Jesús niños, Daniel, Apocalipsis, El hogar adventista, Biblia fácil

- **Backend** — capacidad de estudios bíblicos:
  - Entidad `BibleStudy` que vincula una `Person` (estudiante) con un `BibleCourse`, un instructor (Persona), el estado misionero, la lección actual y notas
  - Estado misionero como enum: `Invitar`, `Estudiando`, `Graduado`, `Bautismo`, `Bautizado`
  - Estado de progreso de lección: no iniciado / número de lección / completo
  - Indicador de interés en bautizarse
  - CRUD de estudios bíblicos, con filtros por estado, instructor y curso
  - Endpoint para listar estudios de un instructor (sirve a la regla de permisos)

- **Frontend** — gestión de interesados y estudiantes:
  - Sub-sección "Interesados y estudios" en el módulo misionero
  - Listado de estudios con filtros por estado, instructor y curso; totales por estado
  - Formulario para crear/editar un estudio bíblico (selector de Persona, selector de instructor, selector de curso, lección, estado, notas)
  - Sub-sección "Cursos bíblicos" para administrar el mantenedor de cursos
  - Vista del progreso de una persona

- **Permisos**: control total para `Admin`/`Pastor`/`Anciano`/`CoordinadorMisionero`. Un instructor que sea usuario del sistema puede ver y actualizar el progreso de los estudios donde figura como instructor.

## Capabilities

### New Capabilities
- `mission-bible-courses`: Mantenedor de cursos bíblicos configurables (nombre, número de lecciones, audiencia). Reemplaza la lista informal de cursos del Excel.
- `mission-bible-studies`: Gestión de estudios bíblicos: vincula estudiante, curso, instructor, estado misionero y progreso de lección. Permite el seguimiento del avance de cada interesado/estudiante.

### Modified Capabilities
- `mission-people`: Se agrega la regla de bloqueo de eliminación de una Persona referenciada por un estudio bíblico (como estudiante o instructor), y se expone el progreso de estudios en el detalle de la Persona.

## Impact

- **Backend Module**: módulo `mission` (existente, se amplía)
- **New Entities**: `BibleCourse`, `BibleStudy`
- **Migrations**: crear tablas `bible_courses` y `bible_studies`
- **API Endpoints**:
  - `GET/POST /api/mission/bible-courses`, `GET/PATCH/DELETE /api/mission/bible-courses/:id`
  - `GET /api/mission/bible-studies` (filtros `?status=`, `?instructorId=`, `?courseId=`)
  - `GET /api/mission/bible-studies/:id`
  - `POST /api/mission/bible-studies`
  - `PATCH /api/mission/bible-studies/:id`
  - `DELETE /api/mission/bible-studies/:id`
  - `GET /api/mission/people/:id/bible-studies` (estudios de una persona como estudiante)
- **Frontend**: sub-secciones "Interesados y estudios" y "Cursos bíblicos"; listado con filtros y totales; formularios
- **Seeders**: `BibleCourseSeeder` (6 cursos iniciales) y `BibleStudySeeder` (estudios de ejemplo del Excel), registrados en el runner en orden de dependencia e idempotentes
- **Depende de**: `mission-people-registry`

## Fuera del alcance

- Soporte de **pareja misionera como instructor**: en este change el instructor es siempre una Persona individual. El change `mission-missionary-pairs` amplía `mission-bible-studies` para permitir que el instructor sea una pareja misionera.
- Currículo detallado de cada curso (contenido de cada lección): solo se modela el número de lecciones.
- Calendarización de las sesiones de estudio (qué día/hora se reúnen): puede abordarse luego.
- Conversión automática de estado a "miembro bautizado" en la Persona: el cambio de `isBaptizedMember` en `Person` es manual; el estado del estudio es independiente.
