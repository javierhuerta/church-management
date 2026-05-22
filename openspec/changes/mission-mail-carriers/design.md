## Context

Dos pestañas del Excel "Registro misionero" se relacionan en este change:

**"Carteros misioneros"** (~33 filas): los participantes del programa de Cartero Misionero, que distribuye material puerta a puerta. Columnas: N°, Nombre Completo, Teléfono, Talla Chaqueta (S/M/L/XL — para el uniforme), Notas. La pestaña tiene además columnas de fecha (`25 Abril`, `18 Mayo`, `19 Mayo`) con valores booleanos: marcan **asistencia a capacitaciones** del programa. El encabezado indica "Blanco: 30 carteros misioneros" (meta).

**"Capacitación"** (~5 filas): capacitaciones planificadas — "Uso de Registro misionero (clase maestros)", "Recepción", "Pareja Misionera", "Grupo pequeño", "Instructor bíblico". Columnas: Capacitación, Estado (`Sin comenzar`), Responsable, Lugar, Fecha, Notas.

Las columnas de asistencia de la pestaña de carteros y la pestaña de capacitaciones son la misma idea: capacitaciones con asistentes. Se modelan juntas: `Training` con un registro de asistentes.

Los carteros son `Person`. Teléfono ya vive en `Person`. Este change construye sobre `mission-people-registry`.

## Goals / Non-Goals

**Goals:**
- Registrar carteros misioneros con su talla de chaqueta y estado.
- Gestionar capacitaciones del módulo con su estado.
- Registrar la asistencia de Personas a cada capacitación.

**Non-Goals:**
- Inventario de material distribuido.
- Rutas/territorios.
- Publicar capacitaciones en el calendario.
- Certificados.

## Decisions

### 1. `MailCarrier` — cartero misionero

**Decisión:** entidad `MailCarrier` que vincula una `Person` con datos del programa:

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | |
| `person` | FK `Person` | el cartero (único: una Persona = un registro de cartero) |
| `jacketSize` | enum nullable | `S`, `M`, `L`, `XL`, `XXL` — talla de chaqueta del uniforme |
| `isActive` | boolean | `true` por defecto |
| `notes` | text nullable | |
| `createdAt`/`updatedAt` | timestamp | |

`@JoinColumn` en `person` (`person_id`).

**Por qué entidad separada y no campos en `Person`:** ser cartero es una participación opcional en un programa; la talla de chaqueta es un dato del programa, no de la Persona. Mantener `Person` limpia.

### 2. `Training` — capacitación

**Decisión:** entidad `Training` para las capacitaciones del módulo misionero:

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | |
| `name` | string | nombre de la capacitación |
| `status` | enum `TrainingStatus` | `SinComenzar`, `EnCurso`, `Completada` |
| `responsibleUser` | FK `User` nullable | responsable |
| `responsibleText` | string nullable | responsable como texto (ej. "Mipes") |
| `place` | string nullable | lugar |
| `date` | date nullable | fecha |
| `mode` | enum nullable | `Presencial`, `Online`, `Mixto` |
| `notes` | text nullable | |
| `createdAt`/`updatedAt` | timestamp | |

`@JoinColumn` en `responsibleUser` (`responsible_user_id`).

`responsibleText` cubre el caso del Excel donde el responsable es un departamento/sigla ("Mipes") y no un usuario concreto.

### 3. Asistencia a capacitaciones

**Decisión:** una capacitación tiene muchos asistentes; cada asistente es una `Person`. Tabla de relación `training_attendees` (`training_id`, `person_id`, único por combinación). Esto reemplaza las columnas-fecha del Excel: cada fecha era una capacitación, cada celda booleana es una fila de asistencia.

El endpoint para ver "a qué capacitaciones asistió una Persona" consulta esta tabla; sirve para la vista de asistencia de un cartero.

### 4. Carteros y capacitaciones: capacidades separadas pero relacionadas

**Decisión:** `mission-mail-carriers` y `mission-trainings` son capacidades distintas en el mismo change. No hay FK directa entre `MailCarrier` y `Training`: la asistencia se registra por `Person`. Un cartero asiste a una capacitación porque su `Person` está en `training_attendees`. Esto permite que cualquier Persona (no solo carteros) asista a capacitaciones — el Excel ya capacita también a maestros, parejas, etc.

### 5. Permisos y eliminación

- Control total: CRUD completo de carteros, capacitaciones y asistencia.
- Roles de solo lectura: ven los listados.
- `Person` que es cartero o tiene asistencia registrada: no se puede eliminar — regla agregada a `mission-people`.
- Eliminar una `Training` borra sus filas de `training_attendees` sin borrar Personas.

## Risks / Trade-offs

- **Meta de 30 carteros:** el Excel anota un "blanco" de 30. En v1 no se modela la meta como dato; el listado muestra el conteo de carteros activos y el coordinador compara mentalmente. Una capacidad de metas/planificación queda fuera de alcance.

## Migration Plan

1. Migración: crear tabla `mail_carriers`.
2. Migración: crear tabla `trainings`.
3. Migración: crear tabla `training_attendees` (`training_id`, `person_id`, unique).
4. Seeders: `MailCarrierSeeder` y `TrainingSeeder` (con asistentes) a partir del Excel, registrados en el runner e idempotentes.

## Diseño visual

Cargar la skill `church-ui-design` antes de implementar componentes.

- **Listado de carteros:** patrón mobile/desktop. Tabla/tarjetas con Persona, talla de chaqueta, estado. Contador de carteros activos arriba.
- **Listado de capacitaciones:** tabla/tarjetas con nombre, estado, fecha, responsable, número de asistentes. Badge de estado con STATUS_COLORS de la skill.
- **Formulario de cartero:** selector de Persona, select de talla, switch de activo, notas.
- **Formulario de capacitación:** nombre, select de estado, selector de responsable, date picker, select de modalidad, lugar, notas.
- **Gestión de asistentes:** dentro del detalle de la capacitación, lista de asistentes con selector de Persona para agregar y botón para quitar.
- Tipografía según la jerarquía de la skill; soporte dark mode.

## UI Scenarios

### Scenario: Coordinador ve el listado de carteros misioneros

- **URL**: `/misionero/carteros`
- **Description**: Un usuario con control total ve los carteros misioneros con su talla de chaqueta.
- **Steps**:
  1. `login` as `CoordinadorMisionero`
  2. `navigate` to `/misionero/carteros`
  3. `expect` page heading text `Carteros misioneros`
  4. `expect` element `data-testid="carriers-count"` visible
  5. `expect` element `data-testid="carrier-list"` visible
  6. `expect` `data-testid="carrier-list"` shows each carrier with jacket size

```
+------------------------------------------------+
| Misionero > Carteros misioneros [28]  [+ Nuevo]|
+------------------------------------------------+
| Cartero                 Talla    Estado        |
| Jaime López             M        Activo        |
| Berggreen Lafontant     L        Activo        |
+------------------------------------------------+
```

### Scenario: Coordinador registra un cartero misionero

- **URL**: `/misionero/carteros`
- **Description**: Un usuario con control total registra una Persona como cartero misionero.
- **Steps**:
  1. `login` as `CoordinadorMisionero`
  2. `navigate` to `/misionero/carteros`
  3. `click` button `data-testid="carrier-new-button"`
  4. `type` into `data-testid="carrier-person-select"` text `Pedro`
  5. `click` autocomplete option for `Pedro Soto`
  6. `select` `data-testid="carrier-jacketSize-select"` value `L`
  7. `click` button `data-testid="carrier-save-button"`
  8. `expect` redirect to `/misionero/carteros`
  9. `expect` `data-testid="carrier-list"` contains `Pedro Soto`

```
+------------------------------------------------+
| Nuevo cartero misionero                        |
+------------------------------------------------+
| Persona*      [ Pedro Soto      ]              |
| Talla chaqueta[ L            v  ]              |
| Activo                       [ on ]            |
| Notas         [                ]               |
|                     [ Cancelar ] [ Guardar ]   |
+------------------------------------------------+
```

### Scenario: Coordinador crea una capacitación y registra asistentes

- **URL**: `/misionero/capacitaciones`
- **Description**: Un usuario con control total crea una capacitación y registra Personas asistentes.
- **Steps**:
  1. `login` as `CoordinadorMisionero`
  2. `navigate` to `/misionero/capacitaciones`
  3. `expect` page heading text `Capacitaciones`
  4. `click` button `data-testid="training-new-button"`
  5. `type` into `data-testid="training-name-input"` text `Capacitación Carteros`
  6. `select` `data-testid="training-status-select"` value `Sin comenzar`
  7. `click` button `data-testid="training-save-button"`
  8. `click` training row `data-testid="training-row-0"`
  9. `type` into `data-testid="training-add-attendee-select"` text `Pedro`
  10. `click` autocomplete option for `Pedro Soto`
  11. `click` button `data-testid="training-add-attendee-button"`
  12. `expect` `data-testid="training-attendees-list"` contains `Pedro Soto`

```
+------------------------------------------------+
| Capacitación: Capacitación Carteros            |
+------------------------------------------------+
| Estado: Sin comenzar    Fecha: --              |
| Asistentes (1)                                 |
|  - Pedro Soto                    [ quitar ]    |
| Agregar: [ Pedro...      ]  [ Agregar ]        |
+------------------------------------------------+
```
