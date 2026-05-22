## Context

La pestaña "P. misioneras - I. bíblico" del Excel registra las parejas misioneras de la iglesia. Análisis de su estructura:

- Hay un encabezado "PAREJAS MISIONERAS" con un total (14).
- Cada pareja está agrupada bajo un número (1–N). Cada bloque contiene varios nombres con sus teléfonos — en la práctica **dos integrantes por dupla**, a veces con anotaciones de hijos o "En busca de pareja".
- Algunas parejas están etiquetadas por audiencia: "Niños", "Gteen" (adolescentes).
- Columnas: nombre, fono, dirección, notas.

Los integrantes de una pareja **son Personas** (la mayoría miembros bautizados, ya registrados o registrables en `mission-people`). Los teléfonos y direcciones ya viven en `Person`, así que la pareja NO los duplica.

Este change también cierra la decisión dejada abierta en `mission-bible-studies`: el instructor de un estudio puede ser una pareja completa ("Ale y Glen" en el Excel).

## Goals / Non-Goals

**Goals:**
- Modelar la pareja misionera como dupla de Personas.
- CRUD de parejas; conteo de parejas activas.
- Permitir asignar una pareja como instructora de un estudio bíblico.

**Non-Goals:**
- Histórico de composición de parejas.
- Territorios geográficos.
- Parejas de más de dos integrantes.

## Decisions

### 1. `MissionaryPair` — dupla de Personas

**Decisión:** entidad `MissionaryPair` con:

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | |
| `label` | string nullable | etiqueta opcional (ej. "Pareja 4", o un nombre dado) |
| `memberA` | FK `Person` | primer integrante, obligatorio |
| `memberB` | FK `Person` nullable | segundo integrante; `null` = "en busca de pareja" |
| `audience` | enum nullable | `Ninos`, `Adolescentes` (Gteen), `General` |
| `isActive` | boolean | `true` por defecto |
| `notes` | text nullable | |
| `createdAt`/`updatedAt` | timestamp | |

`@JoinColumn` obligatorio en `memberA` (`member_a_id`) y `memberB` (`member_b_id`).

**Decisión sobre dupla estricta:** exactamente dos slots (A y B), B nullable. El Excel siempre maneja duplas; un slot vacío representa "en busca de pareja". Evita una tabla pivote para algo que siempre son dos.

**Validación:** `memberA` y `memberB` deben ser Personas distintas.

### 2. Etiqueta opcional, sin nombre obligatorio

**Decisión:** la pareja no requiere nombre. En el Excel se identifican por número y por sus integrantes. El listado las muestra como "Integrante A + Integrante B". `label` es solo un alias opcional.

### 3. Instructor de estudio bíblico: Persona o Pareja

**Decisión:** ampliar `BibleStudy` con `instructorPair` (FK nullable a `missionary_pairs`, columna `instructor_pair_id`). Reglas:

- Un estudio puede tener instructor `Person` **o** instructor `MissionaryPair` **o** ninguno, pero **no ambos a la vez** (validación de exclusividad mutua a nivel de servicio).
- Los filtros de estudios admiten `?instructorPairId=`.
- La regla de permisos "instructor-usuario gestiona sus estudios" de `mission-bible-studies` se amplía: si el `User.personId` coincide con `memberA` o `memberB` de la pareja instructora de un estudio, ese usuario también puede gestionar el progreso de ese estudio.

**Alternativa considerada:** tabla polimórfica única para instructor — descartada por complejidad; dos FKs nullables con validación es suficiente y explícito.

### 4. Eliminación

- `MissionaryPair`: control total puede eliminar. Si la pareja es instructora de estudios, se bloquea (igual que un curso en uso) o se exige reasignar primero — en v1 se bloquea.
- `Person` integrante de una pareja: no se puede eliminar — regla agregada a `mission-people`.

### 5. Permisos

Control total: CRUD de parejas. Roles de solo lectura: ven el listado. No hay permiso fino especial en este change (un integrante-usuario no edita su pareja; eso lo decide el coordinador).

## Risks / Trade-offs

- **Exclusividad instructor Persona/Pareja:** se valida en el servicio, no con un constraint de BD. Riesgo bajo; el formulario del frontend ofrece un único selector que produce uno u otro valor.
- **Integrante en múltiples parejas:** el modelo no lo prohíbe (una Persona podría estar en dos parejas). En la práctica es raro; no se agrega constraint para no bloquear casos legítimos de transición.

## Migration Plan

1. Migración: crear tabla `missionary_pairs`.
2. Migración: agregar columna nullable `instructor_pair_id` a `bible_studies` con FK a `missionary_pairs` (ON DELETE SET NULL).
3. Sin backfill: los estudios existentes mantienen su `instructor_id` de Persona.

## Diseño visual

Cargar la skill `church-ui-design` antes de implementar componentes.

- **Listado de parejas:** patrón mobile/desktop. Cada pareja se muestra como una tarjeta con los dos integrantes; si falta el segundo, indicar "En busca de pareja".
- **Contador** de parejas activas arriba del listado.
- **Badge de audiencia** (Niños / Adolescentes / General) con colores de la paleta.
- **Badge de estado** activa/inactiva.
- **Formulario de pareja:** dos selectores de Persona con autocompletar (integrante A obligatorio, B opcional), select de audiencia, switch de activa, textarea de notas.
- **Selector de instructor en el formulario de estudio:** un único selector que distingue Personas y Parejas (ej. agrupados o con un toggle Persona/Pareja).
- Tipografía según la jerarquía de la skill; soporte dark mode.

## UI Scenarios

### Scenario: Coordinador ve el listado de parejas misioneras

- **URL**: `/misionero/parejas`
- **Description**: Un usuario con control total ve las parejas misioneras con sus integrantes y el total de parejas activas.
- **Steps**:
  1. `login` as `CoordinadorMisionero`
  2. `navigate` to `/misionero/parejas`
  3. `expect` page heading text `Parejas misioneras`
  4. `expect` element `data-testid="pairs-count"` visible
  5. `expect` element `data-testid="pairs-list"` visible
  6. `expect` `data-testid="pairs-list"` shows pairs with two members each

```
+------------------------------------------------------------+
| Misionero > Parejas misioneras   [12 activas]  [+ Nueva]   |
+------------------------------------------------------------+
| [ Alejandra Huerta  +  Glen Jaramillo ]   [General]        |
| [ Luis Contreras    +  Luis Rojas      ]  [General]        |
| [ Amelia Pincheira  +  En busca...     ]  [Adolescentes]   |
+------------------------------------------------------------+
```

### Scenario: Coordinador crea una pareja misionera

- **URL**: `/misionero/parejas`
- **Description**: Un usuario con control total crea una pareja seleccionando dos Personas integrantes.
- **Steps**:
  1. `login` as `CoordinadorMisionero`
  2. `navigate` to `/misionero/parejas`
  3. `click` button `data-testid="pair-new-button"`
  4. `expect` page heading text `Nueva pareja misionera`
  5. `type` into `data-testid="pair-memberA-select"` text `Alejandra`
  6. `click` autocomplete option for `Alejandra Huerta`
  7. `type` into `data-testid="pair-memberB-select"` text `Glen`
  8. `click` autocomplete option for `Glen Jaramillo`
  9. `select` `data-testid="pair-audience-select"` value `General`
  10. `click` button `data-testid="pair-save-button"`
  11. `expect` redirect to `/misionero/parejas`
  12. `expect` `data-testid="pairs-list"` contains `Alejandra Huerta`

```
+------------------------------------------------+
| Nueva pareja misionera                         |
+------------------------------------------------+
| Integrante A* [ Alejandra Huerta   ]           |
| Integrante B  [ Glen Jaramillo     ]           |
| Audiencia     [ General         v  ]           |
| Activa                       [ on ]            |
| Notas         [                    ]           |
|                     [ Cancelar ] [ Guardar ]   |
+------------------------------------------------+
```

### Scenario: Asignar una pareja como instructora de un estudio bíblico

- **URL**: `/misionero/estudios`
- **Description**: Al crear o editar un estudio bíblico, el instructor puede ser una pareja misionera.
- **Steps**:
  1. `login` as `CoordinadorMisionero`
  2. `navigate` to `/misionero/estudios`
  3. `click` button `data-testid="bible-study-new-button"`
  4. `type` into `data-testid="study-student-select"` text `Pedro`
  5. `click` autocomplete option for `Pedro Soto`
  6. `click` toggle `data-testid="study-instructor-type-pair"`
  7. `type` into `data-testid="study-instructor-select"` text `Alejandra`
  8. `click` autocomplete option for pair `Alejandra Huerta + Glen Jaramillo`
  9. `select` `data-testid="study-status-select"` value `Estudiando`
  10. `click` button `data-testid="study-save-button"`
  11. `expect` redirect to `/misionero/estudios`
  12. `expect` `data-testid="bible-study-list"` row shows pair as instructor

```
+------------------------------------------------------------+
| Nuevo estudio bíblico                                      |
+------------------------------------------------------------+
| Estudiante*   [ Pedro Soto               ]                 |
| Instructor    ( ) Persona  (•) Pareja                      |
|               [ Alejandra Huerta + Glen Jaramillo  v ]     |
| Estado*       [ Estudiando            v  ]                 |
|                          [ Cancelar ] [ Guardar ]         |
+------------------------------------------------------------+
```
