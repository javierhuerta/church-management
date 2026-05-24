## Why

La iglesia organiza el evangelismo en **equipos misioneros**: grupos de 2 o más miembros que dan estudios bíblicos, visitan interesados y los acompañan hacia el bautismo. La pestaña "P. misioneras - I. bíblico" del Excel registra estos equipos, cada uno con sus integrantes, sus teléfonos y notas. Algunos equipos están incompletos ("En busca de pareja"), y aparecen agrupados por audiencia (Niños, Gteen/Adolescentes, General).

Los equipos misioneros cambian con el tiempo: miembros se integran o dejan el equipo, y la composición de un año puede ser distinta a la del siguiente. El sistema necesita hacer seguimiento a estos cambios, asociando cada equipo a un **período** (año) para mantener un histórico.

Además, los equipos misioneros se relacionan con los **grupos pequeños**, que a su vez están asociados a una **clase de escuela sabática**. Un equipo puede pertenecer a un grupo pequeño (y su audiencia se infiere de ahí), o directamente a una clase de escuela sabática, o a la iglesia en general si no tiene otra asignación.

Hoy esta información es texto suelto en el Excel, sin relación con las Personas ya registradas ni con los estudios bíblicos que los equipos imparten. El coordinador necesita gestionar los equipos como entidades de primera clase: saber quién forma cada equipo, cuántos hay activos por período, y poder asignar un equipo como instructor de un estudio bíblico.

Este change crea la capacidad de **equipos misioneros** con histórico por período, agrega un mantenedor de **clases de escuela sabática**, y amplía `mission-bible-studies` para que el instructor de un estudio pueda ser un equipo completo, no solo una persona individual. Depende de `mission-people-registry` y `mission-bible-studies`.

## What Changes

- **Backend** — capacidad de equipos misioneros:
  - Entidad `MissionaryTeam`: un equipo con etiqueta opcional, período obligatorio, relación opcional con grupo pequeño o clase de escuela sabática, y estado activo/inactivo
  - Tabla de unión `missionary_team_members` con `joinedAt`/`leftAt` para histórico de integrantes (mínimo 2 activos por equipo)
  - Una Persona no puede estar en dos equipos del mismo período
  - CRUD de equipos misioneros con filtros por período, grupo pequeño y clase
  - Audiencia inferida: del grupo pequeño, de la clase de escuela sabática, o "Iglesia" por defecto

- **Backend** — mantenedor de clases de escuela sabática:
  - CRUD completo para `SabbathClassEntity` (que ya existe como entidad sin servicio)
  - Seeder con las 8 clases del Excel
  - Endpoint `GET /api/catalogs/sabbath-classes`

- **Backend** — ampliación de estudios bíblicos:
  - El instructor de un `BibleStudy` puede ser **una Persona O un equipo misionero** (FK `instructor_team_id` nullable, exclusiva con `instructor_id`)
  - Filtros de estudios por equipo misionero instructor

- **Frontend** — gestión de equipos misioneros:
  - Sub-sección "Equipos misioneros" en el módulo misionero
  - Listado de equipos con filtro por período, grupo pequeño y clase
  - Formulario para crear/editar un equipo (selección de 2+ Personas, período, grupo pequeño o clase, notas)
  - Vista de histórico: qué equipos existían en períodos anteriores

- **Frontend** — mantenedor de clases de escuela sabática:
  - Sub-sección "Clases ES" en el módulo misionero o en configuración
  - CRUD de clases con nombre, descripción y orden

- **Permisos**: control total para `Admin`/`Pastor`/`Anciano`/`CoordinadorMisionero`; solo lectura para los demás roles.

## Capabilities

### New Capabilities
- `mission-missionary-pairs`: Gestión de equipos misioneros: grupos de 2+ Personas que dan estudios bíblicos y acompañan interesados, con histórico por período, relación con grupo pequeño o clase de escuela sabática, y estado activo/inactivo.
- `catalogs-sabbath-classes`: Mantenedor de clases de escuela sabática: CRUD de clases con nombre, descripción y orden de presentación.

### Modified Capabilities
- `mission-bible-studies`: El instructor de un estudio bíblico puede ser una Persona individual o un equipo misionero completo. Se agregan filtros por equipo instructor.
- `mission-people`: Se agrega la regla de bloqueo de eliminación de una Persona que sea miembro activo de un equipo misionero.

## Impact

- **Backend Module**: módulo `mission` (existente, se amplía) y módulo `catalogs` (se amplía con SabbathClass CRUD)
- **New Entities**: `MissionaryTeam`, `MissionaryTeamMember`; tabla de unión `missionary_team_members`
- **Modified Entities**: `BibleStudy` (nueva columna nullable `instructor_team_id`), `SabbathClassEntity` (ya existe, se agrega CRUD)
- **Migrations**: crear tablas `missionary_teams` y `missionary_team_members`; agregar columna `instructor_team_id` a `bible_studies`
- **API Endpoints**:
  - `GET/POST /api/mission/missionary-teams`, `GET/PATCH/DELETE /api/mission/missionary-teams/:id`
  - `GET/POST /api/catalogs/sabbath-classes`, `GET/PATCH/DELETE /api/catalogs/sabbath-classes/:id`
  - `GET /api/mission/bible-studies` admite filtro `?instructorTeamId=`
- **Frontend**: sub-sección "Equipos misioneros"; sub-sección "Clases ES"; selector de instructor ampliado en estudios
- **Seeders**: `SabbathClassSeeder` (8 clases), `MissionaryTeamSeeder` (equipos del Excel), registrados en el runner en orden de dependencia e idempotentes
- **Depende de**: `mission-people-registry`, `mission-bible-studies`

## Fuera del alcance

- Asignación de territorios geográficos a los equipos.
- Métricas de desempeño de cada equipo (bautismos logrados): puede derivarse a futuro de los estudios.
- Histórico de cambios de integrantes dentro del mismo período (solo se registra `joinedAt`/`leftAt`).
- Formulario público de inscripción a equipos misioneros.