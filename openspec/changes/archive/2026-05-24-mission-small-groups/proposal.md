## Why

La iglesia organiza a sus miembros en **grupos pequeños** (unidades de acción / clases de Escuela Sabática) que se reúnen periódicamente para estudio y vida comunitaria. La pestaña "Grupos pequeños" del Excel registra cada grupo con: la unidad de acción a la que pertenece (M. infantil, M. adolescente, Clase 1–6), un nombre, un líder, un promotor misionero, día y horario de reunión, un contacto y notas.

El líder de cada grupo pequeño es el **maestro de clase**, un rol que ya existe en el sistema (`MaestroClase`) y que será un usuario con login. El coordinador misionero necesita gestionar los grupos como entidades estructuradas: saber quién lidera cada uno, cuándo se reúnen, y quiénes son sus integrantes. A su vez, el maestro de clase debe poder ver y mantener su propio grupo.

Este change crea la capacidad de **grupos pequeños**: el grupo, su maestro de clase, su promotor misionero, sus datos de reunión y sus integrantes (Personas). Depende de `mission-people-registry`.

## What Changes

- **Backend** — capacidad de grupos pequeños:
  - Entidad `SmallGroup`: unidad de acción, nombre, día y horario de reunión, modalidad/lugar, contacto, estado activo, notas
  - El **maestro de clase** del grupo es un `User` con rol `MaestroClase` (FK opcional al usuario líder)
  - El **promotor misionero** del grupo es una `Person` (FK opcional)
  - Integrantes del grupo: relación con `Person` (un grupo tiene muchas Personas; una Persona puede pertenecer a un grupo)
  - CRUD de grupos pequeños y gestión de integrantes
  - Endpoint para listar el/los grupo(s) de un maestro de clase

- **Frontend** — gestión de grupos pequeños:
  - Sub-sección "Grupos pequeños" en el módulo misionero
  - Listado de grupos con su líder, día/horario y número de integrantes
  - Formulario para crear/editar un grupo (unidad de acción, nombre, maestro de clase, promotor, día/horario, modalidad, notas)
  - Gestión de integrantes del grupo (agregar/quitar Personas)
  - Vista del maestro de clase: ve y edita su propio grupo y sus integrantes

- **Permisos**: control total para `Admin`/`Pastor`/`Anciano`/`CoordinadorMisionero`. Un usuario con rol `MaestroClase` puede ver y editar el grupo del que es líder, incluida la gestión de sus integrantes. Los demás roles tienen solo lectura.

## Capabilities

### New Capabilities
- `mission-small-groups`: Gestión de grupos pequeños (unidades de acción / clases de Escuela Sabática): líder maestro de clase, promotor misionero, datos de reunión e integrantes.

### Modified Capabilities
- `mission-people`: Se agrega la regla de bloqueo de eliminación de una Persona que sea integrante o promotora de un grupo pequeño.

## Impact

- **Backend Module**: módulo `mission` (existente, se amplía)
- **New Entities**: `SmallGroup`; tabla de relación grupo–integrantes
- **Migrations**: crear tabla `small_groups` y la tabla de integrantes (`small_group_members` o columna `small_group_id` en una relación con `people`)
- **API Endpoints**:
  - `GET/POST /api/mission/small-groups`, `GET/PATCH/DELETE /api/mission/small-groups/:id`
  - `POST /api/mission/small-groups/:id/members` (agregar integrante)
  - `DELETE /api/mission/small-groups/:id/members/:personId` (quitar integrante)
  - `GET /api/mission/small-groups/my` (grupo(s) del maestro de clase autenticado)
- **Frontend**: sub-sección "Grupos pequeños"; listado, formulario y gestión de integrantes
- **Roles afectados**: el rol `MaestroClase` obtiene permiso de edición sobre su propio grupo
- **Depende de**: `mission-people-registry`
- **Seeders**: `SmallGroupSeeder` con los grupos del Excel y sus integrantes, registrado en el runner e idempotente

## Fuera del alcance

- Registro de asistencia a las reuniones del grupo: puede abordarse como capacidad posterior.
- Vínculo entre grupo pequeño y el módulo de Cultos / Escuela Sabática litúrgica.
- Histórico de cambios de líder o de integrantes.
- Reportes de crecimiento por grupo (relación con bautismos).
