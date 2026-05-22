## Context

La pestaña "Grupos pequeños" del Excel registra 8 grupos (M. infantil, M. adolescente, Clase 1–6). Columnas observadas:

- **Unidad de acción**: a qué categoría pertenece el grupo ("M. infantil", "M. adolecente", "Clase 1"… "Clase 6").
- **Nombre del grupo**: "Sellados", "Gteen", "Generación 215", "Bethel", "Bereanos", "Maranatha", "Nuevo Nacimiento".
- **Líder**: el maestro de clase (a veces dos nombres, ej. "Javier Huerta / Debora Aranda").
- **Promotor misionero**: rol opcional dentro del grupo.
- **Día de reunión**, **Horario** (texto: "19:00 hrs", "18:00 a 20:00 hrs", "Presencial 15:00 hrs Templo").
- **Contacto** (teléfono), **Notas**.

El líder corresponde al rol `MaestroClase` ya existente en el sistema, que será un usuario con login. Según la decisión de modelado acordada, el grupo pequeño **es** la clase de Escuela Sabática (un solo concepto). Sus integrantes son `Person`.

Este change construye sobre `mission-people-registry`.

## Goals / Non-Goals

**Goals:**
- Modelar el grupo pequeño con su líder (maestro de clase), promotor y datos de reunión.
- Gestionar los integrantes del grupo (Personas).
- Permitir al maestro de clase ver y mantener su propio grupo.

**Non-Goals:**
- Registro de asistencia a reuniones.
- Vínculo con el módulo de Cultos.
- Histórico de líderes/integrantes.

## Decisions

### 1. `SmallGroup` — el grupo pequeño

**Decisión:** entidad `SmallGroup` con:

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | |
| `name` | string nullable | nombre del grupo ("Bereanos") |
| `actionUnit` | string | unidad de acción ("Clase 4", "M. infantil") |
| `leader` | FK `User` nullable | el maestro de clase, usuario con rol `MaestroClase` |
| `promoter` | FK `Person` nullable | promotor misionero |
| `meetingDay` | enum nullable | día de la semana de reunión |
| `meetingTime` | string nullable | horario en texto libre (los datos del Excel son irregulares) |
| `meetingMode` | enum nullable | `Presencial`, `Online`, `Mixto` |
| `meetingPlace` | string nullable | lugar ("Templo") |
| `contactPhone` | string nullable | teléfono de contacto del grupo |
| `isActive` | boolean | `true` por defecto |
| `notes` | text nullable | |
| `createdAt`/`updatedAt` | timestamp | |

`@JoinColumn` obligatorio en `leader` (`leader_user_id`) y `promoter` (`promoter_person_id`).

**`actionUnit` como texto, no enum:** las unidades del Excel ("Clase 1"…"Clase 6", "M. infantil") podrían cambiar; un campo de texto evita migraciones por cada ajuste. Si más adelante se requiere normalizar, se hace en un change posterior.

**`leader` como `User`, no `Person`:** el maestro de clase necesita login para mantener su grupo; el rol `MaestroClase` ya existe. El `User` se vincula opcionalmente a su `Person` (vía `mission-people`), así que se conserva la trazabilidad.

### 2. Integrantes del grupo

**Decisión:** un grupo pequeño tiene muchos integrantes; cada integrante es una `Person`. Una Persona pertenece a lo sumo a un grupo pequeño a la vez.

**Modelo:** columna `small_group_id` nullable en una relación uno-a-muchos `SmallGroup → Person`. Como `Person` es compartida por varias capacidades, NO se agrega la columna directamente a `people`; se usa una tabla de relación `small_group_members` (`small_group_id`, `person_id`, único por `person_id`) para mantener `Person` agnóstica del módulo de grupos.

**Rationale:** mantener `Person` como entidad central limpia, sin acoplarla a cada capacidad. La unicidad por `person_id` impone "una Persona en un solo grupo".

### 3. Maestro de clase y permisos

**Decisión:**
- Control total (`Admin`/`Pastor`/`Anciano`/`CoordinadorMisionero`): CRUD completo de grupos y de integrantes.
- **Maestro de clase** (`User` con rol `MaestroClase`): puede ver y editar **el grupo del que es líder** (`SmallGroup.leaderUserId == user.id`), incluyendo agregar/quitar integrantes y editar datos de reunión y notas. NO puede crear ni eliminar grupos, ni cambiar el líder.
- Otros roles: solo lectura.

`GET /mission/small-groups/my` devuelve el/los grupo(s) liderados por el usuario autenticado.

### 4. Día de reunión

**Decisión:** `meetingDay` es un enum de días de la semana (`Lunes`…`Domingo`) para permitir filtrado. El horario (`meetingTime`) queda como texto libre porque el Excel mezcla formatos ("19:00 hrs", "18:00 a 20:00 hrs").

### 5. Eliminación

- `SmallGroup`: control total puede eliminar; al eliminar, se borran sus filas de `small_group_members` (los integrantes-Persona no se borran).
- `Person` integrante o promotora de un grupo: no se puede eliminar — regla agregada a `mission-people`.

## Risks / Trade-offs

- **Líder doble en el Excel** ("Javier Huerta / Debora Aranda"): el modelo admite un solo `leader`. Mitigación: se elige el maestro de clase responsable; el segundo nombre va en notas o como promotor.
- **`actionUnit` como texto:** flexible pero sin validación. Aceptable para v1.

## Migration Plan

1. Migración: crear tabla `small_groups`.
2. Migración: crear tabla `small_group_members` (`small_group_id`, `person_id`, unique en `person_id`).
3. Seeder: `SmallGroupSeeder` con los grupos del Excel y sus integrantes, registrado en el runner e idempotente.

## Diseño visual

Cargar la skill `church-ui-design` antes de implementar componentes.

- **Listado de grupos:** patrón mobile/desktop. Cada grupo se muestra como tarjeta: nombre, unidad de acción, líder, día/horario, número de integrantes.
- **Badge de estado** activo/inactivo y badge de modalidad (Presencial/Online/Mixto) con colores de la paleta.
- **Formulario de grupo:** campos agrupados (identidad / liderazgo / reunión / notas). Selector de `User` para el líder (filtrado a rol `MaestroClase`), selector de `Person` para el promotor, select de día, select de modalidad.
- **Gestión de integrantes:** dentro del detalle del grupo, una sección con la lista de integrantes y un selector de Persona con autocompletar para agregar; botón para quitar cada integrante.
- **Vista del maestro de clase:** al entrar a "Grupos pequeños" ve directamente su grupo con edición habilitada.
- Tipografía según la jerarquía de la skill; soporte dark mode.

## UI Scenarios

### Scenario: Coordinador ve el listado de grupos pequeños

- **URL**: `/misionero/grupos`
- **Description**: Un usuario con control total ve los grupos pequeños con su líder, día de reunión e integrantes.
- **Steps**:
  1. `login` as `CoordinadorMisionero`
  2. `navigate` to `/misionero/grupos`
  3. `expect` page heading text `Grupos pequeños`
  4. `expect` element `data-testid="small-group-list"` visible
  5. `expect` `data-testid="small-group-list"` shows each group with leader and member count

```
+------------------------------------------------------------+
| Misionero > Grupos pequeños                  [+ Nuevo]     |
+------------------------------------------------------------+
| Bereanos      Clase 4   Líder: A. Huerta  Jue 19:30  (8)   |
| Gteen         M. adol.  Líder: J. Huerta  Vie 18:00  (12)  |
| Bethel        Clase 2   Líder: L. Contreras  -       (5)   |
+------------------------------------------------------------+
```

### Scenario: Coordinador crea un grupo pequeño

- **URL**: `/misionero/grupos`
- **Description**: Un usuario con control total crea un grupo pequeño con líder y datos de reunión.
- **Steps**:
  1. `login` as `CoordinadorMisionero`
  2. `navigate` to `/misionero/grupos`
  3. `click` button `data-testid="small-group-new-button"`
  4. `expect` page heading text `Nuevo grupo pequeño`
  5. `type` into `data-testid="group-name-input"` text `Emanuel`
  6. `type` into `data-testid="group-actionUnit-input"` text `Clase 7`
  7. `select` `data-testid="group-leader-select"` a user with role `MaestroClase`
  8. `select` `data-testid="group-meetingDay-select"` value `Viernes`
  9. `type` into `data-testid="group-meetingTime-input"` text `19:30 hrs`
  10. `click` button `data-testid="group-save-button"`
  11. `expect` redirect to `/misionero/grupos`
  12. `expect` `data-testid="small-group-list"` contains `Emanuel`

```
+------------------------------------------------+
| Nuevo grupo pequeño                            |
+------------------------------------------------+
| Nombre        [ Emanuel        ]               |
| Unidad acción*[ Clase 7        ]               |
| Maestro clase [ (usuario)   v  ]               |
| Promotor      [ (persona)      ]               |
| Día reunión   [ Viernes     v  ]  [19:30 hrs]  |
| Modalidad     [ Presencial  v  ]               |
| Activo                       [ on ]            |
| Notas         [                ]               |
|                     [ Cancelar ] [ Guardar ]   |
+------------------------------------------------+
```

### Scenario: Coordinador gestiona los integrantes de un grupo

- **URL**: `/misionero/grupos`
- **Description**: Un usuario con control total agrega una Persona como integrante de un grupo pequeño.
- **Steps**:
  1. `login` as `CoordinadorMisionero`
  2. `navigate` to `/misionero/grupos`
  3. `click` group row `data-testid="small-group-row-0"`
  4. `expect` element `data-testid="group-members-list"` visible
  5. `type` into `data-testid="group-add-member-select"` text `Pedro`
  6. `click` autocomplete option for `Pedro Soto`
  7. `click` button `data-testid="group-add-member-button"`
  8. `expect` `data-testid="group-members-list"` contains `Pedro Soto`

```
+------------------------------------------------+
| Grupo: Bereanos (Clase 4)                      |
+------------------------------------------------+
| Integrantes (9)                                |
|  - Alejandro Huerta              [ quitar ]    |
|  - Pedro Soto                    [ quitar ]    |
|  ...                                           |
| Agregar: [ Pedro...        ]  [ Agregar ]      |
+------------------------------------------------+
```

### Scenario: Maestro de clase ve y edita su propio grupo

- **URL**: `/misionero/grupos`
- **Description**: Un usuario con rol Maestro de Clase accede al módulo y gestiona el grupo del que es líder.
- **Steps**:
  1. `login` as `MaestroClase`
  2. `navigate` to `/misionero/grupos`
  3. `expect` element `data-testid="small-group-list"` shows only the user's own group
  4. `click` group row `data-testid="small-group-row-0"`
  5. `expect` element `data-testid="group-add-member-button"` visible
  6. `expect` element `data-testid="small-group-new-button"` not visible

```
+------------------------------------------------+
| Mi grupo: Bereanos (Clase 4)                   |
+------------------------------------------------+
| Día: Jueves 19:30   Modalidad: Presencial      |
| Integrantes (8)                  [ + Agregar ] |
|  - ...                           [ quitar ]    |
| (sin opción de crear/eliminar grupos)          |
+------------------------------------------------+
```
