## Context

La pestaña "Dones" del Excel "Registro misionero" registra el descubrimiento de dones espirituales de ~60 miembros. Estructura observada:

**Leyenda de actividades (categorías A–N):**
- A: Escuchar, acompañar y orar por alguien
- B: Visitar/apoyar a personas que lo necesitan
- C: Recibir a la gente y hacer que se sientan en casa
- D: Ayudar en la organización y logística
- E: Enseñar o apoyar clases bíblicas (adultos/niños/jóvenes)
- F: Participar en música (canto, instrumentos, apoyo)
- G: Apoyar en audio / proyección / redes / diseño / cámara
- H: Invitar a otros, acompañarlos y hacer seguimiento
- I: Trabajar con niños
- J: Trabajar con adolescentes / jóvenes
- K: Promover vida sana / salud / bienestar
- L: Apoyar a familias (matrimonio, crianza, cultos familiares)
- M: Apoyar a personas con necesidades especiales, inclusión
- N: Servir en el templo (orden, reverencia, apoyo práctico)

**Tabla de respuestas:** N°, Nombre, Contacto, Actividad afín (lista de letras: "H, J, L"), Top 3 ("A, I, E" o "Sin respuesta"), Quiero iniciar ("Probar 1 vez", "Capacitación", "Orientación", "Integrarme 1 mes"), Responsable de inicio, Etapa, Notas.

El propósito del instrumento es conectar a cada miembro con un ministerio. Las Personas evaluadas son `Person`; el contacto ya vive en `Person`. Este change construye sobre `mission-people-registry`.

## Goals / Non-Goals

**Goals:**
- Catálogo configurable de áreas de actividad del ministerio.
- Registrar la evaluación de dones de una Persona (áreas afines, top 3, modo de iniciar).
- Seguimiento de la etapa de integración al servicio.
- Filtrar Personas por área de actividad afín.

**Non-Goals:**
- Formulario público de auto-evaluación.
- Recomendación automática de ministerios.
- Cuestionario detallado pregunta por pregunta.

## Decisions

### 1. `ActivityArea` — catálogo de áreas

**Decisión:** entidad `ActivityArea` con `code` (letra A–N), `name` (descripción) y `displayOrder`. Se siembra con las 14 categorías del Excel. Es configurable para que la iglesia pueda ajustar las descripciones o agregar áreas sin desplegar código.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | |
| `code` | string | letra identificadora, único (`A`…`N`) |
| `name` | string | descripción de la actividad |
| `displayOrder` | int | orden de presentación |

### 2. `GiftAssessment` — evaluación de dones de una Persona

**Decisión:** entidad `GiftAssessment` que vincula una `Person` con el resultado de su descubrimiento de dones:

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | |
| `person` | FK `Person` | la persona evaluada (única: una Persona = una evaluación vigente) |
| `affinityAreas` | M:N `ActivityArea` | áreas con las que la Persona se siente afín (columna "Actividad afín") |
| `topAreas` | M:N `ActivityArea` | las 3 áreas principales (columna "Top 3") |
| `startModes` | array de enum | modos preferidos de iniciar el servicio (multi-selección) |
| `stage` | enum `GiftStage` | etapa de seguimiento de la integración |
| `responsibleUser` | FK `User` nullable | responsable de inicio |
| `notes` | text nullable | |
| `assessedAt` | date nullable | fecha de la evaluación |
| `createdAt`/`updatedAt` | timestamp | |

`@JoinColumn` en `person` (`person_id`) y `responsibleUser` (`responsible_user_id`).

`startModes` es una **multi-selección**: el Excel muestra que una persona combina varios modos ("Probar 1 vez, Capacitación"). Se almacena como un arreglo de valores del enum `GiftStartMode` (`ProbarUnaVez`, `IntegrarmeUnMes`, `Capacitacion`, `Orientacion`, `SinRespuesta`), usando una columna de tipo `enum[]` de PostgreSQL (`@Column({ type: 'enum', enum: GiftStartMode, array: true })`). Puede quedar vacío.

`GiftStage` (enum, basado en "Etapa"): `Registrado`, `Contactado`, `EnIntegracion`, `Integrado`. Captura el seguimiento de "ya se conectó esta persona con un ministerio".

### 3. Dos relaciones M:N con `ActivityArea`

**Decisión:** `affinityAreas` (todas las áreas afines) y `topAreas` (las 3 principales) son dos relaciones M:N separadas hacia `ActivityArea`, con dos tablas de unión (`gift_assessment_affinity_areas`, `gift_assessment_top_areas`).

Validación: `topAreas` debe tener a lo sumo 3 áreas y todas deben estar contenidas en `affinityAreas`.

**Alternativa considerada:** una sola tabla de unión con un flag `isTop` — descartada porque complica la validación de "máximo 3 top".

### 4. Una evaluación vigente por persona

**Decisión:** una `Person` tiene a lo sumo una `GiftAssessment` (la vigente). Si la persona vuelve a hacer el test, se edita la evaluación existente. No se modela histórico de evaluaciones en v1.

### 5. Filtrar personas por don

**Decisión:** el caso de uso clave es "encontrar quién tiene afinidad con visitar (área B) para armar parejas". El listado de evaluaciones admite filtro `?areaId=` (sobre `affinityAreas`) y `?stage=`. Así el coordinador arma equipos según los dones.

### 6. Permisos y eliminación

- Control total: CRUD completo de evaluaciones y del catálogo de áreas.
- Roles de solo lectura: ven los listados.
- `Person` con una evaluación de dones: no se puede eliminar — regla agregada a `mission-people`.

## Risks / Trade-offs

- **`startModes` como `enum[]` de PostgreSQL:** se usa una columna de arreglo de enum en lugar de una tabla de unión separada. Es más simple y suficiente para una lista corta de valores fijos; el trade-off es que no se puede agregar metadata por cada modo, lo cual no se necesita.
- **Sin histórico de evaluaciones:** si una persona re-evalúa, se pierde la anterior. Aceptable: el instrumento se aplica esporádicamente y lo relevante es el resultado vigente.

## Migration Plan

1. Migración: crear tabla `activity_areas`.
2. Migración: crear tabla `gift_assessments`.
3. Migración: crear tablas de unión `gift_assessment_affinity_areas` y `gift_assessment_top_areas`.
4. Seeder: insertar las 14 áreas de actividad (A–N).

## Diseño visual

Cargar la skill `church-ui-design` antes de implementar componentes.

- **Listado de evaluaciones:** patrón mobile/desktop. Desktop: tabla (Persona, Top 3, Modo de inicio, Etapa). Mobile: tarjetas.
- **Badge de etapa** de integración con STATUS_COLORS de la skill (Registrado = neutro, Contactado = info, En integración = atención, Integrado = positivo).
- **Áreas de actividad** como chips/badges; las áreas del top 3 se destacan visualmente (ej. con el color de acento GOLD).
- **Filtros:** select de área de actividad y de etapa.
- **Formulario de evaluación:** selector de Persona, multi-selección de áreas afines, selección de hasta 3 áreas top, select de modo de inicio, select de etapa, selector de responsable, fecha, notas.
- **Vista en el detalle de Persona:** sección que muestra las áreas afines, el top 3 y la etapa de integración.
- Tipografía según la jerarquía de la skill; soporte dark mode.

## UI Scenarios

### Scenario: Coordinador ve el listado de evaluaciones de dones

- **URL**: `/misionero/dones`
- **Description**: Un usuario con control total ve las evaluaciones de dones con su etapa de integración.
- **Steps**:
  1. `login` as `CoordinadorMisionero`
  2. `navigate` to `/misionero/dones`
  3. `expect` page heading text `Descubrimiento de dones`
  4. `expect` element `data-testid="gift-assessment-list"` visible
  5. `select` `data-testid="gift-filter-area"` an activity area (e.g. visitar)
  6. `expect` `data-testid="gift-assessment-list"` shows only people with affinity for that area

```
+------------------------------------------------------------+
| Misionero > Descubrimiento de dones          [+ Nuevo]     |
+------------------------------------------------------------+
| Área: [ B - Visitar v ]   Etapa: [ Todas v ]               |
+------------------------------------------------------------+
| Persona            Top 3        Inicio         Etapa       |
| Ana González       A, B, F      Capacitación   Registrado  |
| Caterine Ramirez   A, B, D      Probar 1 vez   Contactado  |
+------------------------------------------------------------+
```

### Scenario: Coordinador registra la evaluación de dones de una persona

- **URL**: `/misionero/dones`
- **Description**: Un usuario con control total registra el descubrimiento de dones de una Persona.
- **Steps**:
  1. `login` as `CoordinadorMisionero`
  2. `navigate` to `/misionero/dones`
  3. `click` button `data-testid="gift-assessment-new-button"`
  4. `expect` page heading text `Nueva evaluación de dones`
  5. `type` into `data-testid="gift-person-select"` text `Pedro`
  6. `click` autocomplete option for `Pedro Soto`
  7. `check` affinity areas `data-testid="gift-affinity-areas"` (e.g. A, B, H)
  8. `select` top areas `data-testid="gift-top-areas"` (up to 3, e.g. A, B)
  9. `check` start modes `data-testid="gift-startModes"` (multi-selección, e.g. `Capacitación` y `Probar una vez`)
  10. `select` `data-testid="gift-stage-select"` value `Registrado`
  11. `click` button `data-testid="gift-save-button"`
  12. `expect` redirect to `/misionero/dones`
  13. `expect` `data-testid="gift-assessment-list"` contains `Pedro Soto`

```
+------------------------------------------------------------+
| Nueva evaluación de dones                                  |
+------------------------------------------------------------+
| Persona*       [ Pedro Soto              ]                 |
| Áreas afines   [x]A [x]B [ ]C ... [x]H ...                 |
| Top 3          [x]A [x]B [ ]H                              |
| Quiero iniciar [x]Probar una vez [x]Capacitación [ ]...    |
| Etapa          [ Registrado          v  ]                  |
| Responsable    [ (usuario)              ]                  |
| Notas          [                        ]                 |
|                          [ Cancelar ] [ Guardar ]         |
+------------------------------------------------------------+
```

### Scenario: Coordinador valida que el top 3 no exceda 3 áreas

- **URL**: `/misionero/dones`
- **Description**: El formulario impide seleccionar más de 3 áreas como top.
- **Steps**:
  1. `login` as `CoordinadorMisionero`
  2. `navigate` to `/misionero/dones`
  3. `click` button `data-testid="gift-assessment-new-button"`
  4. `type` into `data-testid="gift-person-select"` text `Pedro`
  5. `click` autocomplete option for `Pedro Soto`
  6. `check` 4 areas in `data-testid="gift-top-areas"`
  7. `click` button `data-testid="gift-save-button"`
  8. `expect` validation message about maximum 3 top areas

```
+------------------------------------------------------------+
| Nueva evaluación de dones                                  |
+------------------------------------------------------------+
| Top 3   [x]A [x]B [x]C [x]D                                |
| ! Solo puede seleccionar hasta 3 áreas principales         |
+------------------------------------------------------------+
```
