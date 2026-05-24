## Context

La pestaña "P. misioneras - I. bíblico" del Excel registra los equipos misioneros de la iglesia. Análisis de su estructura:

- Hay un encabezado "PAREJAS MISIONERAS" con un total (14).
- Los equipos están agrupados por audiencia: "Niños" (M. infantil), "Gteen" (M. adolescente), y luego numerados (1–5) para audiencia general.
- Cada equipo tiene 2 o más integrantes con sus datos. Algunos integrantes están marcados como "En busca de pareja".
- Los equipos misioneros funcionan por un período determinado (año) y su composición cambia con el tiempo.

Los integrantes de un equipo **son Personas** (miembros bautizados, ya registrados o registrables en `mission-people`). Los teléfonos y direcciones ya viven en `Person`, así que el equipo NO los duplica.

Los equipos se relacionan con **grupos pequeños**, que a su vez están asociados a una **clase de escuela sabática**. La hoja "Grupos pequeños" muestra 8 grupos, cada uno con una unidad de acción que corresponde a una clase ES. Un equipo puede pertenecer a un grupo pequeño (y su audiencia se infiere de ahí), directamente a una clase de escuela sabática, o a la iglesia en general.

La entidad `SabbathClassEntity` ya existe en el módulo `catalogs` pero **no tiene servicio, controlador ni seeder** — solo la entidad y la migración.

La entidad `Period` ya existe en el módulo `document-center` con `year`, `startDate`, `endDate` y CRUD completo.

Este change también cierra la decisión dejada abierta en `mission-bible-studies`: el instructor de un estudio puede ser un equipo misionero completo.

## Goals / Non-Goals

**Goals:**
- Modelar el equipo misionero como grupo de 2+ Personas con histórico por período.
- CRUD de equipos; conteo de equipos activos por período.
- Relación opcional con grupo pequeño o clase de escuela sabática; audiencia inferida.
- CRUD de clases de escuela sabática (entidad ya existe, falta servicio).
- Permitir asignar un equipo como instructor de un estudio bíblico.
- Histórico de integrantes con `joinedAt`/`leftAt`.

**Non-Goals:**
- Histórico detallado de cambios de integrantes dentro del mismo período (solo `joinedAt`/`leftAt`).
- Territorios geográficos.
- Métricas de desempeño de cada equipo.
- Formulario público de inscripción.

## Decisions

### 1. `MissionaryTeam` — equipo misionero con miembros flexibles

**Decisión:** entidad `MissionaryTeam` con tabla de unión para miembros:

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | |
| `label` | string nullable | etiqueta opcional (ej. "Equipo 4") |
| `periodId` | FK `Period` | **obligatorio** — el año en que este equipo funciona |
| `smallGroupId` | FK `SmallGroup` nullable | grupo pequeño al que pertenece |
| `sabbathClassId` | FK `SabbathClassEntity` nullable | clase ES directa (solo si no hay grupo) |
| `isActive` | boolean | `true` por defecto |
| `notes` | text nullable | |
| `createdAt`/`updatedAt` | timestamp | |

`@JoinColumn` obligatorio en `periodId` (`period_id`), `smallGroupId` (`small_group_id`) y `sabbathClassId` (`sabbath_class_id`).

**Validación:** si `smallGroupId` está seteado → `sabbathClassId` debe ser null (la clase se infiere del grupo). Si `smallGroupId` es null → `sabbathClassId` puede ser null (→ "Iglesia") o tener un valor (→ clase directa).

**Razón:** `periodId` obligatorio permite mantener un histórico: cada año tiene sus equipos. Un equipo del 2026 puede tener miembros distintos al del 2025.

### 2. `MissionaryTeamMember` — miembros con histórico

**Decisión:** tabla de unión `missionary_team_members` con timestamps:

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | |
| `missionaryTeamId` | FK `MissionaryTeam` | |
| `personId` | FK `Person` | |
| `joinedAt` | date nullable | cuándo se integró la persona al equipo |
| `leftAt` | date nullable | cuándo dejó el equipo (null = activo) |

**Validaciones:**
- Mínimo 2 miembros activos (`leftAt` es null) por equipo al crear.
- Una Persona no puede estar en dos equipos del mismo período como miembro activo.
- `joinedAt` y `leftAt` permiten rastrear cuándo alguien se integró o dejó el equipo.

**Alternativa considerada:** miembros embebidos en `MissionaryTeam` como JSON — descartada porque impide consultas eficientes y relaciones con `Person`.

### 3. Audiencia inferida (solo lectura)

**Decisión:** la audiencia del equipo no se almacena, se infiere:

| Condición | Audiencia |
|---|---|
| Tiene `smallGroupId` | `actionUnit` del grupo pequeño (o nombre de la clase ES del grupo) |
| No tiene grupo, tiene `sabbathClassId` | Nombre de la clase ES |
| Ninguno | "Iglesia" |

**Razón:** evitar duplicar información que ya existe en el grupo pequeño o la clase ES. La audiencia se calcula en el servicio y se expone en el DTO de respuesta.

### 4. Etiqueta opcional, sin nombre obligatorio

**Decisión:** el equipo no requiere nombre. En el Excel se identifican por número y por sus integrantes. El listado los muestra como "Integrante 1 + Integrante 2 (+ Integrante 3...)". `label` es solo un alias opcional.

### 5. Instructor de estudio bíblico: Persona o Equipo

**Decisión:** ampliar `BibleStudy` con `instructorTeam` (FK nullable a `missionary_teams`, columna `instructor_team_id`). Reglas:

- Un estudio puede tener instructor `Person` **o** instructor `MissionaryTeam` **o** ninguno, pero **no ambos a la vez** (validación de exclusividad mutua a nivel de servicio).
- Los filtros de estudios admiten `?instructorTeamId=`.
- La regla de permiso "instructor-usuario gestiona sus estudios" se amplía: si el `User.personId` coincide con un miembro activo del equipo instructor de un estudio, ese usuario también puede gestionar el progreso de ese estudio.

**Alternativa considerada:** tabla polimórfica única para instructor — descartada por complejidad; dos FKs nullables con validación es suficiente y explícito.

### 6. Eliminación

- `MissionaryTeam`: control total puede eliminar. Si el equipo es instructor de estudios, se bloquea (igual que un curso en uso) — se exige reasignar primero.
- `MissionaryTeamMember`: control total puede agregar/remover miembros. Al remover, se setea `leftAt` en vez de eliminar el registro (histórico).
- `Person` miembro activo de un equipo: no se puede eliminar — regla agregada a `mission-people`.
- `SabbathClass`: control total puede eliminar si no tiene grupos pequeños ni equipos asociados.

### 7. Permisos

Control total: CRUD de equipos y clases ES. Roles de solo lectura: ven el listado. No hay permiso fino especial en este change (un integrante-usuario no edita su equipo; eso lo decide el coordinador).

### 8. Clases de Escuela Sabática — CRUD

**Decisión:** la entidad `SabbathClassEntity` ya existe con `name`, `description`, `displayOrder`, `isActive`. Se agrega:

- `SabbathClassService` con CRUD y validación de eliminación (no eliminar si tiene grupos pequeños o equipos asociados).
- `SabbathClassController` con endpoints REST y decoradores OpenAPI.
- DTOs: `CreateSabbathClassDto`, `UpdateSabbathClassDto`, `SabbathClassResponseDto`.
- Seeder con las 8 clases del Excel.

**Endpoints:**
- `GET /api/catalogs/sabbath-classes`
- `POST /api/catalogs/sabbath-classes`
- `PATCH /api/catalogs/sabbath-classes/:id`
- `DELETE /api/catalogs/sabbath-classes/:id`

## Risks / Trade-offs

- **Exclusividad instructor Persona/Equipo:** se valida en el servicio, no con un constraint de BD. Riesgo bajo; el formulario del frontend ofrece un único selector que produce uno u otro valor.
- **Miembro en múltiples equipos del mismo período:** se previene con validación en el servicio. Un miembro solo puede estar activo en un equipo por período.
- **Mínimo 2 miembros activos:** se valida al crear y al remover miembros. Si al remover un miembro el equipo queda con menos de 2 activos, se advierte o se desactiva el equipo.
- **`periodId` obligatorio:** requiere que exista un período para el año correspondiente antes de crear equipos. El seeder crea el período 2026 si no existe.

## Migration Plan

1. Migración: crear tabla `missionary_teams` con FKs a `periods`, `small_groups`, `sabbath_classes`.
2. Migración: crear tabla `missionary_team_members` con FKs a `missionary_teams` y `persons`.
3. Migración: agregar columna nullable `instructor_team_id` a `bible_studies` (FK ON DELETE SET NULL).
4. Seeder: `SabbathClassSeeder` con las 8 clases del Excel.
5. Seeder: `MissionaryTeamSeeder` con los equipos del Excel (depende de `PersonSeeder`, `SabbathClassSeeder`, `SmallGroupSeeder` y `PeriodSeeder`).

## Diseño visual

Cargar la skill `church-ui-design` antes de implementar componentes.

- **Listado de equipos misioneros:** patrón mobile/desktop. Cada equipo se muestra como una tarjeta con los integrantes; si falta un integrante, indicar "En busca de integrante". Filtro por período (selector de año), grupo pequeño y clase ES.
- **Contador** de equipos activos arriba del listado.
- **Badge de audiencia** inferida del grupo/clase: "M. infantil", "Adolescentes", "Clase 4 — Bereanos", "Iglesia".
- **Badge de estado** activa/inactiva con STATUS_COLORS de la skill.
- **Selector de período** prominente: por defecto el año actual, con opción de ver años anteriores.
- **Formulario de equipo:** selector de período, multi-selector de Personas integrantes (mínimo 2), selector de grupo pequeño o clase ES (mutuamente excluyentes), switch de activa, textarea de notas.
- **Vista de histórico:** al cambiar de período, se muestran los equipos de ese año con sus integrantes.
- **Mantenedor de clases ES:** tabla simple con nombre, descripción, orden y estado activo.
- **Selector de instructor en el formulario de estudio:** un único selector que distingue Personas y Equipos (ej. agrupados o con un toggle Persona/Equipo).
- Tipografía según la jerarquía de la skill; soporte dark mode.

## UI Scenarios

### Scenario: Coordinador ve el listado de equipos misioneros

- **URL**: `/misionero/equipos`
- **Description**: Un usuario con control total ve los equipos misioneros del período actual con sus integrantes y el total de equipos activos.
- **Steps**:
  1. `login` as `CoordinadorMisionero`
  2. `navigate` to `/misionero/equipos`
  3. `expect` page heading text `Equipos misioneros`
  4. `expect` element `data-testid="teams-count"` visible
  5. `expect` element `data-testid="teams-list"` visible
  6. `expect` `data-testid="teams-list"` shows teams with their members and audience badge

```
+------------------------------------------------------------+
| Misionero > Equipos misioneros   [12 activos]  [+ Nuevo]  |
+------------------------------------------------------------+
| Período: [2026 v]   Grupo: [Todos v]   Clase: [Todos v]    |
+------------------------------------------------------------+
| Equipo                              Audiencia    Estado      |
| Alejandra Huerta + Glen Jaramillo   General      Activo    |
| Luis Contreras + Luis Rojas         Clase 1      Activo    |
| Amelia Pincheira + (buscando...)    Adolescentes Activo    |
+------------------------------------------------------------+
```

### Scenario: Coordinador crea un equipo misionero

- **URL**: `/misionero/equipos`
- **Description**: Un usuario con control total crea un equipo seleccionando integrantes, período y grupo pequeño.
- **Steps**:
  1. `login` as `CoordinadorMisionero`
  2. `navigate` to `/misionero/equipos`
  3. `click` button `data-testid="team-new-button"`
  4. `expect` page heading text `Nuevo equipo misionero`
  5. `select` `data-testid="team-period-select"` value `2026`
  6. `type` into `data-testid="team-member-search"` text `Alejandra`
  7. `click` autocomplete option for `Alejandra Huerta`
  8. `type` into `data-testid="team-member-search"` text `Glen`
  9. `click` autocomplete option for `Glen Jaramillo`
  10. `select` `data-testid="team-small-group-select"` value `Clase 4 — Bereanos`
  11. `click` button `data-testid="team-save-button"`
  12. `expect` redirect to `/misionero/equipos`
  13. `expect` `data-testid="teams-list"` contains `Alejandra Huerta`

```
+------------------------------------------------------------+
| Nuevo equipo misionero                                     |
+------------------------------------------------------------+
| Período*       [ 2026                  v  ]                 |
| Integrantes    [ Alejandra Huerta  ✕ ]                     |
|                [ Glen Jaramillo     ✕ ]                     |
|                [ + Agregar integrante ]                    |
| Grupo pequeño  [ Clase 4 — Bereanos  v  ]                  |
|   (o Clase ES) [ Ninguna            v  ]                  |
| Activa                       [ on ]                        |
| Notas          [                    ]                       |
|                     [ Cancelar ] [ Guardar ]               |
+------------------------------------------------------------+
```

### Scenario: Coordinador asigna un equipo como instructor de un estudio bíblico

- **URL**: `/misionero/estudios`
- **Description**: Al crear o editar un estudio bíblico, el instructor puede ser un equipo misionero.
- **Steps**:
  1. `login` as `CoordinadorMisionero`
  2. `navigate` to `/misionero/estudios`
  3. `click` button `data-testid="bible-study-new-button"`
  4. `type` into `data-testid="study-student-select"` text `Pedro`
  5. `click` autocomplete option for `Pedro Soto`
  6. `click` toggle `data-testid="study-instructor-type-team"`
  7. `type` into `data-testid="study-instructor-select"` text `Alejandra`
  8. `click` autocomplete option for team `Alejandra Huerta + Glen Jaramillo`
  9. `select` `data-testid="study-status-select"` value `Estudiando`
  10. `click` button `data-testid="study-save-button"`
  11. `expect` redirect to `/misionero/estudios`
  12. `expect` `data-testid="bible-study-list"` row shows team as instructor

```
+------------------------------------------------------------+
| Nuevo estudio bíblico                                      |
+------------------------------------------------------------+
| Estudiante*   [ Pedro Soto               ]                 |
| Instructor    ( ) Persona  (•) Equipo                      |
|               [ Alejandra Huerta + Glen Jaramillo  v ]     |
| Estado*       [ Estudiando            v  ]                 |
|                          [ Cancelar ] [ Guardar ]         |
+------------------------------------------------------------+
```

### Scenario: Coordinador gestiona clases de escuela sabática

- **URL**: `/misionero/clases-es`
- **Description**: Un usuario con control total ve y edita las clases de escuela sabática.
- **Steps**:
  1. `login` as `CoordinadorMisionero`
  2. `navigate` to `/misionero/clases-es`
  3. `expect` page heading text `Clases de Escuela Sabática`
  4. `expect` element `data-testid="sabbath-classes-list"` visible
  5. `expect` list shows 8 classes with names and order

```
+------------------------------------------------------------+
| Misionero > Clases ES                       [+ Nueva]      |
+------------------------------------------------------------+
| #  Nombre              Descripción         Estado          |
| 1  M. infantil         Ministerio infantil  Activo         |
| 2  M. adolescente      Gteen                Activo         |
| 3  Clase 1             Generación 215       Activo         |
| 4  Clase 2             Bethel               Activo         |
| 5  Clase 3                                  Activo         |
| 6  Clase 4             Bereanos             Activo         |
| 7  Clase 5             Maranatha            Activo         |
| 8  Clase 6             Nuevo Nacimiento     Activo         |
+------------------------------------------------------------+
```

### Scenario: Coordinador ve equipos de un período anterior

- **URL**: `/misionero/equipos`
- **Description**: Un usuario cambia el filtro de período para ver equipos de años anteriores.
- **Steps**:
  1. `login` as `CoordinadorMisionero`
  2. `navigate` to `/misionero/equipos`
  3. `select` `data-testid="team-period-select"` value `2025`
  4. `expect` `data-testid="teams-list"` shows teams from 2025
  5. `expect` teams from 2026 are not shown

### Scenario: Coordinador remueve un integrante de un equipo

- **URL**: `/misionero/equipos/:id`
- **Description**: Un coordinador remueve un integrante de un equipo, registrando la fecha de salida.
- **Steps**:
  1. `login` as `CoordinadorMisionero`
  2. `navigate` to `/misionero/equipos`
  3. `click` on a team card
  4. `click` remove button next to an integrante
  5. `expect` confirmation dialog
  6. `click` confirm
  7. `expect` integrante removed from active members list
  8. `expect` integrante appears in historical members section with `leftAt` date