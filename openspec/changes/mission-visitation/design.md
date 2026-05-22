## Context

El Excel "Registro misionero" cubre el seguimiento de personas mediante dos pestañas:

**"Miembros rescate"** (~50 filas): miembros bautizados que dejaron de asistir. Columnas: Nombre, Etapa (`a rescatar`, `Visitado`, `Asiste a iglesia`, `Asiste esporádica`, `Decisión requerida`), Domicilio, Tiempo de bautismo (años), Responsable visita, Notas.

**"Visitación"** (~20 filas): personas a visitar. Columnas: Visitado (nombre), Dirección, Fono, Estado (`Sin comenzar`, `Completado`), Responsable, Fecha, Notas. El encabezado indica que el responsable de visitación son "Pastor, ancianos, diáconos…".

El dato más valioso que hoy se pierde es la **historia**: el Excel solo guarda la última visita y un estado. Según la decisión acordada, el sistema debe guardar un **historial completo de visitas** por persona.

Ambas pestañas referencian Personas; el domicilio/teléfono ya viven en `Person`. Este change construye sobre `mission-people-registry`.

## Goals / Non-Goals

**Goals:**
- Registrar miembros a rescatar con su etapa y responsable.
- Guardar un historial de visitas por persona (fecha, responsable, resultado).
- Ver la trayectoria de seguimiento de una persona.

**Non-Goals:**
- Recordatorios/notificaciones.
- Mapa/geolocalización.
- Agendar visitas en el calendario.

## Decisions

### 1. `RescueMember` — estado de rescate de un miembro inactivo

**Decisión:** entidad `RescueMember` que vincula una `Person` con su seguimiento de rescate:

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | |
| `person` | FK `Person` | el miembro inactivo (único: una Persona tiene a lo sumo un registro de rescate) |
| `stage` | enum `RescueStage` | etapa de rescate |
| `yearsSinceBaptism` | int nullable | "Tiempo de bautismo (años)" del Excel |
| `responsible` | FK `User` nullable | responsable del seguimiento |
| `notes` | text nullable | |
| `createdAt`/`updatedAt` | timestamp | |

`RescueStage`: `PorRescatar`, `Visitado`, `AsisteEsporadica`, `AsisteIglesia`, `DecisionRequerida`.

`@JoinColumn` en `person` (`person_id`) y `responsible` (`responsible_user_id`).

**Por qué entidad separada y no un campo en `Person`:** no toda Persona es un miembro a rescatar; el registro de rescate es un estado opcional y transitorio. Mantenerlo aparte conserva `Person` limpia.

### 2. `Visit` — historial de visitas

**Decisión:** entidad `Visit` que representa una visita (planificada o realizada) a una `Person`:

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | |
| `person` | FK `Person` | la persona visitada |
| `status` | enum `VisitStatus` | `Planificada`, `Completada`, `Cancelada` |
| `scheduledDate` | date nullable | fecha planificada |
| `completedDate` | date nullable | fecha en que se realizó |
| `responsibleUser` | FK `User` nullable | responsable usuario |
| `responsiblePair` | FK `MissionaryPair` nullable | responsable pareja misionera |
| `responsibleText` | string nullable | responsable como texto libre (ej. "Pr. Israel Jaramillo", "cuarteto") |
| `outcome` | text nullable | resultado de la visita / notas |
| `createdAt`/`updatedAt` | timestamp | |

Cada Persona acumula muchas visitas → historial. Un listado ordenado por fecha muestra la trayectoria completa.

**Responsable flexible:** el Excel mezcla usuarios, parejas y nombres sueltos ("Ale y Glen", "Pr. Israel Jaramillo", "Herbert Gallardo y Lidia Vera"). Se modela con tres campos opcionales: `responsibleUser`, `responsiblePair` y `responsibleText`. Al menos uno debería estar presente; la combinación se permite (un usuario puede acompañar a una pareja). `responsiblePair` solo se usa si el change `mission-missionary-pairs` ya está aplicado; si no, ese campo se omite y se usa `responsibleText`.

`@JoinColumn` en todas las FKs (`person_id`, `responsible_user_id`, `responsible_pair_id`).

### 3. Relación entre las dos capacidades

**Decisión:** `RescueMember` y `Visit` son independientes pero complementarios. Un miembro a rescatar tendrá visitas registradas; el listado de rescate puede mostrar la fecha de la última visita consultando `Visit`. No hay FK directa entre ambos: las visitas se asocian a la `Person`, no al `RescueMember`. Esto permite registrar visitas a interesados que no son miembros a rescatar.

### 4. Estado de rescate se actualiza manualmente

**Decisión:** completar una visita NO cambia automáticamente la etapa de `RescueMember`. El coordinador evalúa y actualiza la etapa manualmente (de "Por rescatar" a "Visitado", etc.). Evita lógica implícita y mantiene control humano sobre el juicio pastoral.

### 5. Permisos

Control total: CRUD completo de ambas capacidades. Roles de solo lectura: ven los listados. No hay permiso fino especial en este change (el responsable de una visita no obtiene edición automática; en v1 lo gestiona el coordinador).

### 6. Eliminación

- `RescueMember`, `Visit`: control total puede eliminar.
- `Person` con visitas o registro de rescate: no se puede eliminar — regla agregada a `mission-people` (se elimina primero el rescate/visitas o se conserva la Persona).

## Risks / Trade-offs

- **Responsable con tres campos:** flexible pero requiere validación "al menos uno presente". Trade-off aceptado para capturar la realidad del Excel.
- **Dependencia opcional de parejas:** si `mission-missionary-pairs` no está aplicado, `responsiblePair` se omite. La implementación debe ordenarse después de ese change, o degradar el campo con elegancia.

## Migration Plan

1. Migración: crear tabla `rescue_members`.
2. Migración: crear tabla `visits`.
3. Seeders: `RescueMemberSeeder` y `VisitSeeder` con los datos del Excel, registrados en el runner e idempotentes.

## Diseño visual

Cargar la skill `church-ui-design` antes de implementar componentes.

- **Listado de visitas:** patrón mobile/desktop. Desktop: tabla (Persona, Estado, Fecha, Responsable). Mobile: tarjetas.
- **Listado de miembros a rescatar:** tabla/tarjetas con Persona, etapa, años de bautismo, responsable.
- **Badges de estado/etapa:** estados de visita y etapas de rescate usan STATUS_COLORS de la skill (Planificada = neutro, Completada = positivo, Cancelada = atenuado; Por rescatar = atención, Asiste a iglesia = positivo).
- **Formulario de visita:** selector de Persona, select de estado, date pickers (planificada/realizada), selector de responsable, textarea de resultado.
- **Formulario de miembro a rescatar:** selector de Persona, select de etapa, input de años, selector de responsable, notas.
- **Historial de visitas:** en el detalle de la Persona, una línea de tiempo descendente con cada visita (fecha, responsable, resultado).
- Tipografía según la jerarquía de la skill; soporte dark mode.

## UI Scenarios

### Scenario: Coordinador registra una visita a una persona

- **URL**: `/misionero/visitas`
- **Description**: Un usuario con control total registra una visita realizada a una Persona.
- **Steps**:
  1. `login` as `CoordinadorMisionero`
  2. `navigate` to `/misionero/visitas`
  3. `expect` page heading text `Visitación`
  4. `click` button `data-testid="visit-new-button"`
  5. `type` into `data-testid="visit-person-select"` text `Boris`
  6. `click` autocomplete option for `Boris Vásquez`
  7. `select` `data-testid="visit-status-select"` value `Completada`
  8. `set` date `data-testid="visit-completedDate"` to a valid date
  9. `type` into `data-testid="visit-outcome-input"` text `Recibido con interés, agenda nuevo estudio`
  10. `click` button `data-testid="visit-save-button"`
  11. `expect` redirect to `/misionero/visitas`
  12. `expect` `data-testid="visit-list"` contains `Boris Vásquez`

```
+------------------------------------------------------------+
| Registrar visita                                           |
+------------------------------------------------------------+
| Persona*      [ Boris Vásquez       ]                      |
| Estado*       [ Completada       v  ]                      |
| Fecha visita  [  __/__/____      ]                         |
| Responsable   [ (usuario/pareja)    ]                      |
| Resultado     [ Recibido con interés... ]                  |
|                          [ Cancelar ] [ Guardar ]         |
+------------------------------------------------------------+
```

### Scenario: Coordinador ve el listado de visitas filtrado por estado

- **URL**: `/misionero/visitas`
- **Description**: Un usuario con control total filtra las visitas pendientes.
- **Steps**:
  1. `login` as `CoordinadorMisionero`
  2. `navigate` to `/misionero/visitas`
  3. `expect` element `data-testid="visit-list"` visible
  4. `select` `data-testid="visit-filter-status"` value `Planificada`
  5. `expect` `data-testid="visit-list"` shows only planned visits

```
+------------------------------------------------------------+
| Misionero > Visitación        Estado: [Planificada v]      |
+------------------------------------------------------------+
| Persona            Estado       Fecha       Responsable    |
| Normilda           Planificada  --          --             |
| Ángela Contreras   Planificada  --          Pr. Israel     |
+------------------------------------------------------------+
```

### Scenario: Coordinador gestiona miembros a rescatar

- **URL**: `/misionero/rescate`
- **Description**: Un usuario con control total registra un miembro a rescatar con su etapa.
- **Steps**:
  1. `login` as `CoordinadorMisionero`
  2. `navigate` to `/misionero/rescate`
  3. `expect` page heading text `Miembros a rescatar`
  4. `click` button `data-testid="rescue-new-button"`
  5. `type` into `data-testid="rescue-person-select"` text `Doris`
  6. `click` autocomplete option for `Doris Queipul`
  7. `select` `data-testid="rescue-stage-select"` value `Visitado`
  8. `type` into `data-testid="rescue-years-input"` text `30`
  9. `click` button `data-testid="rescue-save-button"`
  10. `expect` redirect to `/misionero/rescate`
  11. `expect` `data-testid="rescue-list"` contains `Doris Queipul`

```
+------------------------------------------------------------+
| Misionero > Miembros a rescatar              [+ Nuevo]     |
+------------------------------------------------------------+
| Persona          Etapa         Años baut.  Responsable     |
| Doris Queipul    Visitado      30          Ale y Glen      |
| Abner García     Decisión req. --          --              |
+------------------------------------------------------------+
```

### Scenario: Ver el historial de visitas de una persona

- **URL**: `/misionero/personas`
- **Description**: En el detalle de una Persona se ve el historial completo de visitas.
- **Steps**:
  1. `login` as `CoordinadorMisionero`
  2. `navigate` to `/misionero/personas`
  3. `click` person row for `Boris Vásquez`
  4. `expect` element `data-testid="person-visit-history"` visible
  5. `expect` `data-testid="person-visit-history"` lists past visits with date and outcome

```
+------------------------------------------------------------+
| Persona: Boris Vásquez                                     |
+------------------------------------------------------------+
| Historial de visitas                                       |
|  • 12/05/2026  Completada  - Recibido con interés...       |
|  • 03/03/2026  Completada  - Primera visita, contacto...   |
+------------------------------------------------------------+
```
