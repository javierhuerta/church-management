## Context

La pestaña "Interesados y estudiantes" del Excel "Registro misionero" es el núcleo del trabajo del Coordinador Misionero. Análisis de sus ~90 filas:

- **Estado de confirmación** (categoría misionera): `A (Bautismo)`, `B (Graduado)`, `C (Estudiando)`, `D (Invitar a estudiar)` / `D (interesado)`, `Bautizado`, más variantes informales (`invitar`). El bloque de totales cuenta: A=1, B=7, C=25, D=34, Bautizado=3.
- **Instructor**: nombre de la persona o pareja que da el estudio. A veces es un grupo ("M. Infantil", "Colegio", "Madre"). Frecuentemente vacío.
- **Curso**: `Fe de Jesús`, `Fe de Jesús niños`, `Daniel`, `Apocalipsis`, `El hogar adventista`, `Biblia fácil`, escrito de forma inconsistente.
- **Lección**: `No iniciado`, un número (1–23), `Iniciado`, `Completo`.
- **Domicilio**, **Teléfono**, **Notas** de seguimiento (interés en bautismo, visitas pendientes, etc.).

Este change construye sobre `mission-people-registry`: el estudiante y el instructor son `Person`. El domicilio y teléfono ya viven en `Person`, así que el estudio NO los duplica.

## Goals / Non-Goals

**Goals:**
- Mantenedor de cursos bíblicos configurable.
- Modelar el estudio bíblico de una persona: curso, instructor, estado, progreso, notas.
- Filtros y totales por estado misionero.
- Permitir al instructor (si es usuario) actualizar el progreso de sus estudios.

**Non-Goals:**
- Pareja misionera como instructor (lo agrega el change de parejas misioneras).
- Currículo/contenido de las lecciones.
- Calendarización de sesiones.

## Decisions

### 1. `BibleCourse` como entidad configurable

**Decisión:** Crear la entidad `BibleCourse` con `name`, `lessonCount` (número de lecciones del curso) y `audience` opcional (`Adultos`, `Niños`, `Jóvenes`, `Familia`). El coordinador puede crear cursos nuevos sin desplegar código.

Cursos sembrados inicialmente: Fe de Jesús, Fe de Jesús niños, Daniel, Apocalipsis, El hogar adventista, Biblia fácil. `lessonCount` se completa con el valor conocido de cada curso (configurable).

**Alternativas consideradas:** enum hardcodeado — descartado porque el Excel ya muestra cursos que aparecen y desaparecen y se necesita agregarlos sin despliegue.

### 2. `BibleStudy` — un estudio por (estudiante, curso)

**Decisión:** `BibleStudy` representa el seguimiento de una Persona en un curso. Campos:

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | |
| `student` | FK `Person` | obligatorio — el interesado/estudiante |
| `course` | FK `BibleCourse` nullable | el curso que está tomando (puede no estar definido aún) |
| `instructor` | FK `Person` nullable | quien da el estudio |
| `status` | enum `BibleStudyStatus` | estado misionero, ver decisión 3 |
| `lessonProgress` | enum `LessonProgress` | `NoIniciado` / `EnCurso` / `Completo` |
| `currentLesson` | int nullable | número de lección cuando `lessonProgress = EnCurso` |
| `interestedInBaptism` | boolean | refleja interés en bautizarse |
| `notes` | text nullable | seguimiento |
| `createdAt`/`updatedAt` | timestamp | |

Una Persona puede tener varios estudios (p.ej. terminó "Fe de Jesús" y empezó "Daniel"); el Excel muestra casos como "Fe de Jesús, Daniel".

**`@JoinColumn` obligatorio** en cada `@ManyToOne` con su columna snake_case (`student_id`, `course_id`, `instructor_id`), según la convención del proyecto.

### 3. `BibleStudyStatus` — estado misionero

**Decisión:** enum con los estados del Excel, normalizados:

| Valor | Significado (Excel) |
|---|---|
| `Invitar` | D — Invitar a estudiar / interesado |
| `Estudiando` | C — Estudiando |
| `Graduado` | B — Graduado (terminó el curso) |
| `Bautismo` | A — En proceso de bautismo |
| `Bautizado` | Bautizado |

El listado muestra totales por estado, replicando el bloque de totales del Excel.

### 4. Progreso de lección

**Decisión:** separar `lessonProgress` (enum: `NoIniciado`, `EnCurso`, `Completo`) de `currentLesson` (entero). El Excel mezcla "No iniciado", números, "Iniciado", "Completo" en una sola columna; separarlos permite consultas como "estudiantes en lección ≥ 10". `currentLesson` solo aplica cuando `lessonProgress = EnCurso` y se valida contra `course.lessonCount` cuando hay curso asignado.

### 5. Instructor en este change: solo Persona

**Decisión:** en este change el instructor es una `Person` nullable. El Excel a veces pone parejas ("Ale y Glen") o grupos ("Colegio"); en v1 se elige la Persona responsable y el resto va en notas.

El change `mission-missionary-pairs` ampliará `BibleStudy` para que el instructor pueda ser **una Persona O una Pareja misionera** (relación polimórfica resuelta con dos FKs nullables y una validación de exclusividad). Se documenta aquí para que la implementación del modelo deje espacio a esa extensión.

### 6. Permisos

**Decisión:**
- Control total (`Admin`/`Pastor`/`Anciano`/`CoordinadorMisionero`): CRUD completo de cursos y estudios.
- **Instructor como usuario**: si un `User` está vinculado a una `Person` que figura como `instructor` de un `BibleStudy`, ese usuario puede **ver y actualizar el progreso** (lección, estado, notas) de ese estudio, pero no crear/eliminar estudios ni cambiar el estudiante. La verificación se hace comparando `user.personId` con `bibleStudy.instructorId`.
- Cursos bíblicos: solo control total puede modificarlos.

### 7. Eliminación

- `BibleCourse` referenciado por estudios: no se puede eliminar (se sugiere desactivar; en v1 simplemente se bloquea).
- `BibleStudy`: control total puede eliminar.
- `Person` referenciada como estudiante o instructor: no se puede eliminar — regla agregada a `mission-people`.

## Risks / Trade-offs

- **Migración de datos del Excel:** los nombres de instructor inconsistentes harán que el matching automático sea imperfecto. Mitigación: el seeder solo siembra cursos; los estudios se cargan manualmente o con una utilidad de import posterior (fuera de alcance).
- **Polimorfismo de instructor:** dejar la puerta abierta a "pareja como instructor" sin sobre-diseñar. Decisión: en este change una sola FK `instructor_id` a `Person`; el change de parejas agrega `instructor_pair_id` nullable.

## Migration Plan

1. Migración: crear tabla `bible_courses`.
2. Migración: crear tabla `bible_studies` con FKs a `people` (student, instructor) y `bible_courses`.
3. Seeder: insertar los 6 cursos bíblicos iniciales.

## Diseño visual

Cargar la skill `church-ui-design` antes de implementar componentes.

- **Listado de estudios:** patrón mobile/desktop. Desktop: tabla con columnas Estudiante, Estado, Curso, Lección, Instructor. Mobile: tarjetas apiladas.
- **Totales por estado:** fila de contadores arriba del listado (Invitar / Estudiando / Graduado / Bautismo / Bautizado), usando los STATUS_COLORS de la skill para diferenciar estados.
- **Badge de estado misionero:** cada estado usa un color de la paleta de status badges (ej. Invitar = neutro, Estudiando = info, Graduado = positivo suave, Bautismo = acento GOLD, Bautizado = positivo).
- **Filtros:** selects de shadcn para estado, instructor y curso.
- **Formulario de estudio:** selector de Persona con autocompletar (estudiante e instructor), select de curso, input numérico de lección, select de estado, switch de interés en bautismo, textarea de notas.
- **Mantenedor de cursos:** tabla simple (nombre, audiencia, nº lecciones) con formulario.
- Tipografía según jerarquía de la skill; soporte dark mode.

## UI Scenarios

### Scenario: Coordinador ve el listado de interesados y estudios con totales

- **URL**: `/misionero/estudios`
- **Description**: Un usuario con control total ve el listado de estudios bíblicos con los totales por estado misionero.
- **Steps**:
  1. `login` as `CoordinadorMisionero`
  2. `navigate` to `/misionero/estudios`
  3. `expect` page heading text `Interesados y estudios`
  4. `expect` element `data-testid="bible-study-totals"` visible
  5. `expect` element `data-testid="bible-study-list"` visible
  6. `select` `data-testid="filter-status"` value `Estudiando`
  7. `expect` `data-testid="bible-study-list"` shows only studies with status `Estudiando`

```
+------------------------------------------------------------+
| Misionero > Interesados y estudios          [+ Nuevo]      |
+------------------------------------------------------------+
| Invitar 34 | Estudiando 25 | Graduado 7 | Bautismo 1 | ... |
+------------------------------------------------------------+
| Estado: [Estudiando v]  Curso: [Todos v]  Instructor:[v]   |
+------------------------------------------------------------+
| Estudiante        Estado      Curso         Lección   Inst |
| Boris Vásquez     Estudiando  Biblia fácil  4         L.C. |
| Camila Fuentes    Estudiando  Fe de Jesús   18        R.G. |
+------------------------------------------------------------+
```

### Scenario: Coordinador crea un estudio bíblico para una persona

- **URL**: `/misionero/estudios`
- **Description**: Un usuario con control total registra un nuevo estudio bíblico vinculando estudiante, curso e instructor.
- **Steps**:
  1. `login` as `CoordinadorMisionero`
  2. `navigate` to `/misionero/estudios`
  3. `click` button `data-testid="bible-study-new-button"`
  4. `expect` page heading text `Nuevo estudio bíblico`
  5. `type` into `data-testid="study-student-select"` text `Pedro`
  6. `click` autocomplete option for `Pedro Soto`
  7. `select` `data-testid="study-course-select"` value `Fe de Jesús`
  8. `type` into `data-testid="study-instructor-select"` text `Ruth`
  9. `click` autocomplete option for `Ruth García`
  10. `select` `data-testid="study-status-select"` value `Estudiando`
  11. `type` into `data-testid="study-lesson-input"` text `1`
  12. `click` button `data-testid="study-save-button"`
  13. `expect` redirect to `/misionero/estudios`
  14. `expect` `data-testid="bible-study-list"` contains `Pedro Soto`

```
+------------------------------------------------------------+
| Nuevo estudio bíblico                                      |
+------------------------------------------------------------+
| Estudiante*   [ Pedro Soto            ]                    |
| Curso         [ Fe de Jesús        v  ]                    |
| Instructor    [ Ruth García           ]                    |
| Estado*       [ Estudiando         v  ]                    |
| Lección       [ 1   ]   Progreso [ En curso v ]            |
| Interés en bautizarse           [ off ]                    |
| Notas         [                       ]                    |
|                          [ Cancelar ] [ Guardar ]         |
+------------------------------------------------------------+
```

### Scenario: Instructor actualiza el progreso de su estudiante

- **URL**: `/misionero/estudios`
- **Description**: Un usuario instructor (vinculado a una Persona) actualiza la lección de un estudio donde figura como instructor.
- **Steps**:
  1. `login` as instructor user (User vinculado a Person instructora)
  2. `navigate` to `/misionero/estudios`
  3. `expect` `data-testid="bible-study-list"` shows only studies where the user is instructor
  4. `click` study row `data-testid="bible-study-row-0"`
  5. `expect` `data-testid="study-lesson-input"` editable
  6. `type` into `data-testid="study-lesson-input"` text `8`
  7. `click` button `data-testid="study-save-button"`
  8. `expect` confirmation message visible

```
+------------------------------------------------------------+
| Estudio: Boris Vásquez                                     |
+------------------------------------------------------------+
| Curso: Biblia fácil        Estado: [ Estudiando v ]        |
| Lección: [ 8 ]   Progreso: [ En curso v ]                  |
| Notas: [ ... ]                                             |
|                                       [ Guardar ]         |
+------------------------------------------------------------+
```

### Scenario: Coordinador administra los cursos bíblicos

- **URL**: `/misionero/cursos`
- **Description**: Un usuario con control total ve y crea cursos bíblicos.
- **Steps**:
  1. `login` as `CoordinadorMisionero`
  2. `navigate` to `/misionero/cursos`
  3. `expect` page heading text `Cursos bíblicos`
  4. `expect` `data-testid="course-list"` contains `Fe de Jesús`
  5. `click` button `data-testid="course-new-button"`
  6. `type` into `data-testid="course-name-input"` text `Esperanza`
  7. `type` into `data-testid="course-lessons-input"` text `12`
  8. `click` button `data-testid="course-save-button"`
  9. `expect` `data-testid="course-list"` contains `Esperanza`

```
+------------------------------------------------+
| Misionero > Cursos bíblicos        [+ Nuevo]   |
+------------------------------------------------+
| Curso              Audiencia    Lecciones      |
| Fe de Jesús        Adultos      28             |
| Fe de Jesús niños  Niños        ...            |
| Daniel             Adultos      ...            |
+------------------------------------------------+
```
