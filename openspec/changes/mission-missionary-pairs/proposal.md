## Why

La iglesia organiza el evangelismo en **parejas misioneras**: duplas de miembros que dan estudios bíblicos, visitan interesados y los acompañan hacia el bautismo. La pestaña "P. misioneras - I. bíblico" del Excel registra 14 parejas, cada una con dos integrantes, sus teléfonos, dirección y notas. Algunas duplas están incompletas ("En busca de pareja"), y aparecen agrupadas por audiencia (Niños, Gteen).

Hoy esta información es texto suelto en el Excel, sin relación con las Personas ya registradas ni con los estudios bíblicos que las parejas imparten. El coordinador necesita gestionar las parejas como entidades de primera clase: saber quién forma cada pareja, cuántas hay activas, y poder asignar una pareja como instructora de un estudio bíblico.

Este change crea la capacidad de **parejas misioneras** y amplía `mission-bible-studies` para que el instructor de un estudio pueda ser una pareja completa, no solo una persona individual. Depende de `mission-people-registry` y `mission-bible-studies`.

## What Changes

- **Backend** — capacidad de parejas misioneras:
  - Entidad `MissionaryPair`: una pareja con un nombre/etiqueta opcional, una audiencia opcional (Niños, Gteen/adolescentes, General) y notas
  - Cada pareja tiene dos integrantes `Person` (member A y member B); el segundo puede quedar vacío ("en busca de pareja")
  - Indicador de pareja activa
  - CRUD de parejas misioneras
  - Endpoint para listar parejas y sus integrantes

- **Backend** — ampliación de estudios bíblicos:
  - El instructor de un `BibleStudy` puede ser **una Persona O una pareja misionera** (FK `instructor_pair_id` nullable, exclusiva con `instructor_id`)
  - Filtros de estudios por pareja misionera instructora

- **Frontend** — gestión de parejas misioneras:
  - Sub-sección "Parejas misioneras" en el módulo misionero
  - Listado de parejas con sus integrantes, total de parejas activas
  - Formulario para crear/editar una pareja (selección de hasta dos Personas integrantes, audiencia, notas)
  - En el formulario de estudio bíblico, el selector de instructor permite elegir Persona o pareja

- **Permisos**: control total para `Admin`/`Pastor`/`Anciano`/`CoordinadorMisionero`; solo lectura para los demás.

## Capabilities

### New Capabilities
- `mission-missionary-pairs`: Gestión de parejas misioneras: duplas de Personas que dan estudios bíblicos y acompañan interesados, con audiencia y estado activo.

### Modified Capabilities
- `mission-bible-studies`: El instructor de un estudio bíblico puede ser una Persona individual o una pareja misionera completa. Se agregan filtros por pareja instructora.
- `mission-people`: Se agrega la regla de bloqueo de eliminación de una Persona que sea integrante de una pareja misionera.

## Impact

- **Backend Module**: módulo `mission` (existente, se amplía)
- **New Entities**: `MissionaryPair`
- **Modified Entities**: `BibleStudy` (nueva columna nullable `instructor_pair_id`)
- **Migrations**: crear tabla `missionary_pairs`; agregar columna `instructor_pair_id` a `bible_studies`
- **API Endpoints**:
  - `GET/POST /api/mission/missionary-pairs`, `GET/PATCH/DELETE /api/mission/missionary-pairs/:id`
  - `GET /api/mission/bible-studies` admite filtro `?instructorPairId=`
- **Frontend**: sub-sección "Parejas misioneras"; selector de instructor ampliado en el formulario de estudio
- **Seeders**: `MissionaryPairSeeder` con las parejas del Excel, registrado en el runner e idempotente
- **Depende de**: `mission-people-registry`, `mission-bible-studies`

## Fuera del alcance

- Histórico de cambios de integrantes de una pareja: solo se guarda la composición actual.
- Asignación de territorios geográficos a las parejas.
- Métricas de desempeño de cada pareja (bautismos logrados): puede derivarse a futuro de los estudios.
- Parejas de más de dos integrantes: el modelo es estrictamente una dupla.
