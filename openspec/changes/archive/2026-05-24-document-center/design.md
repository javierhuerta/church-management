## Context

Cada año de gestión eclesiástica tiene un período con contexto específico: quién ofició como pastor y qué grupos de ancianos rotan en turnos. Esto permite dar trazabilidad a los documentos y saber quién estaba en liderazgo en cada período.

La iglesia tiene ancianos con distintos roles (Anciano, Admin, Coordinador Misionero) que se organizan en **grupos de rotación**. Los grupos pueden ser de 1 persona (turno individual) o más (turno en equipo). La frecuencia de turno es configurable: semanal, quincenal, mensual o trimestral.

## Goals / Non-Goals

**Goals:**
- Agrupar documentos por año/período
- Mostrar automáticamente quién fue pastor y qué ancianos están de turno para cada período
- Permitir filtrar documentos por año y ver contexto de liderazgo
- Programación automática de rotación de ancianos por grupos
- Soportar ancianos con roles: Anciano, Admin, Coordinador Misionero

**Non-Goals:**
- Edición manual de turnos individuales (la rotación se regenera completamente)
- Períodos mensuales (el período es anual)
- Permisos diferenciados por período
- Cambios retroactivos de rotación una vez creada (solo regenerar)

## Decisions

### 1. Modelo de datos: Period (anual)

**Decisión**: Crear entidad `Period` con:
- `id`: UUID
- `year`: número (único, un período por año)
- `startDate`: date (1 de enero del año)
- `endDate`: date (31 de diciembre del año)
- `pastorId`: relación a User (el pastor del año)
- `rotationMode`: enum `AUTOMATIC` | `MANUAL`
- `shiftWeeks`: número (duración del turno en semanas: 1=semanal, 2=quincenal, 4=mensual, 13=trimestral)
- `rotationGroups`: JSON array de arrays de user IDs (cada sub-array es un grupo de ancianos)
- `notes`: string opcional

**Racional**: El período es anual, no mensual. Un año tiene un solo período con un pastor y una configuración de rotación. Los `rotationGroups` permiten organizar ancianos en equipos (ej: grupo de 2 ancianos que sirven juntos en un turno).

### 2. Modelo de datos: ElderShift

**Decisión**: Crear entidad `ElderShift`:
- `id`: UUID
- `periodId`: relación a Period
- `elderId`: relación a User (anciano/admin/coordinador misionero)
- `weekStart`: date (inicio del turno)
- `weekEnd`: date (fin del turno)

**Racional**: Cada turno individual de anciano se almacena como un ElderShift. Cuando un grupo de 2 ancianos tiene turno, se crean 2 ElderShifts con las mismas fechas. Esto permite saber exactamente quién estuvo de turno en cada semana del año.

### 3. Rotación automática por grupos

**Decisión**: Algoritmo de rotación:
1. Configurar: `rotationGroups` (lista de grupos, cada grupo es una lista de user IDs), `shiftWeeks` (duración del turno)
2. Calcular cuántos turnos caben en el año (52 semanas / shiftWeeks)
3. Asignar grupos en orden Round-Robin, avanzando un grupo por turno
4. Cada miembro del grupo recibe un ElderShift con las mismas fechas

**Ejemplo con 5 grupos de 2 ancianos, turnos de 2 semanas**:
- Grupo 1: [Anciano1, Anciano2] → semanas 1-2
- Grupo 2: [Anciano3, Admin1] → semanas 3-4
- Grupo 3: [Coordinador1, Anciano4] → semanas 5-6
- ... y así sucesivamente en round-robin

**Racional**: Los grupos permiten que ancianos con distintos roles sirvan juntos. La rotación es automática y solo se puede regenerar completamente (no editar turnos individuales).

### 4. Roles de ancianos en rotación

**Decisión**: Los usuarios con roles `Anciano`, `Admin` y `CoordinadorMisionero` pueden participar en la rotación de turnos. Al crear un período, el administrador selecciona qué usuarios forman parte de cada grupo de rotación.

**Racional**: En la práctica, no solo los ancianos tradicionales cubren turnos — los administradores y coordinadores misioneros también participan en el liderazgo rotativo.

### 5. Relación Period ↔ Documents

**Decisión**: `ChurchDocument` tiene `periodId` opcional (FK a Period). Los documentos se asocian a un año y mes, y opcionalmente a un período.

- Los documentos nuevos SE ASOCIAN a un período
- Documentos legacy pueden no tener período (NULL)
- El título del documento se auto-genera como `{CATEGORÍA}_{AÑO}_{MES}` (ej: `ACTA_2026_05.pdf`)

**Racional**: backwards compatibility - documentos existentes no requieren período. El título auto-generado evita inconsistencias.

### 6. Filtrado en frontend

**Decisión**: Interfaz permite:
1. Selector de año (dropdown con años disponibles)
2. Al seleccionar un año, se muestra el período con contexto de liderazgo
3. Card de contexto: "Período 2026 | Pastor: Juan Pérez | Ancianos de turno: [lista]"
4. Documentos agrupados por mes dentro del año seleccionado

**Racional**: El usuario ve los documentos con el contexto de quién estaba liderando, filtrados por año.

## Risks / Trade-offs

- **[Risk] Cambio de roster a mitad de año**: Si se agrega/retira un anciano, la rotación puede desfasarse.
  → **Mitigation**: El botón "Regenerar rotación" permite recalcular con el nuevo roster. Los turnos ya pasados no se modifican.

- **[Risk] Períodos sin pastor asignado**: Si no hay pastor configurado, mostrar "Por asignar"
  → **Mitigation**: En UI mostrar placeholder, no romper visualización.

- **[Risk] React Query con undefined**: Si la API retorna 404 (sin período), el hook `usePeriodByYear` puede retornar `undefined` en vez de `null`, violando el invariant de React Query.
  → **Mitigation**: Asegurar que el hook siempre retorne `null` cuando no hay período, nunca `undefined`.

## UI Scenarios

### Scenario 1: Ver centro de documentos con selector de año
**URL**: `/documentos`
**Description**: Validar que la página muestra el selector de año y la card de contexto de liderazgo

**Steps**:
1. Navigate to `/documentos`
2. Expect text `Centro de Documentos` to be visible
3. Expect year selector to be visible
4. Select year `2026`
5. If a period exists for 2026, expect `LeadershipContextCard` showing pastor and elder info
6. If no period exists, expect empty state message
7. Expect document list filtered by selected year, grouped by month
8. Take screenshot

**ASCII Wireframe** (expected final state):
```
┌──────────────────────────────────────┐
│  Centro de Documentos                │
│  ┌─────────────┐                     │
│  │ Año: 2026 ▼│                     │
│  └─────────────┘                     │
│  ┌──────────────────────────────┐    │
│  │ Período: 2026                │    │
│  │ Pastor: Juan Pérez           │    │
│  │ Ancianos de turno:           │    │
│  │  Ene 1-14: Pedro, Pablo     │    │
│  │  Ene 15-28: Andrés, Mateo    │    │
│  └──────────────────────────────┘    │
│  ┌──────────────────────────────┐    │
│  │ Mayo 2026                    │    │
│  │  ACTA_2026_05.pdf            │    │
│  │ Abril 2026                   │    │
│  │  ACTA_2026_04.pdf            │    │
│  └──────────────────────────────┘    │
└──────────────────────────────────────┘
```

### Scenario 2: Crear nuevo período anual con rotación de ancianos
**URL**: `/documentos`
**Description**: Validar que un usuario editor puede crear un período anual y configurar la rotación de ancianos

**Steps**:
1. Navigate to `/documentos`
2. Click button to create new period ("Crear Período")
3. Expect dialog titled "Crear Período Anual"
4. Fill year field with `2026`
5. Select pastor from dropdown
6. Configure rotation groups (select elders per group)
7. Set shift duration (e.g., 2 weeks)
8. Click submit button
9. Expect success confirmation and LeadershipContextCard to appear
10. Take screenshot

**ASCII Wireframe** (expected final state):
```
┌──────────────────────────────────────┐
│  Crear Período Anual                  │
│  ┌──────────────────────────────┐     │
│  │ Año: [2026]                  │     │
│  │ Pastor: [Pastor Juan ▼]     │     │
│  │ Duración turno: [2 semanas] │     │
│  │                              │     │
│  │ Grupos de Rotación:          │     │
│  │  Grupo 1: [Pedro, Pablo]     │     │
│  │  Grupo 2: [Andrés, Mateo]    │     │
│  │  Grupo 3: [Roberto]          │     │
│  │  [+ Agregar grupo]           │     │
│  │                              │     │
│  │ [Crear Período]              │     │
│  └──────────────────────────────┘     │
└──────────────────────────────────────┘
```

### Scenario 3: Subir documento asociado a período
**URL**: `/documentos`
**Description**: Validar que al subir un documento se puede seleccionar la categoría y el período asociado

**Steps**:
1. Navigate to `/documentos`
2. Click upload document button
3. Select document category (e.g., "Acta de Junta")
4. Select period from dropdown (year)
5. Upload a file
6. Click submit
7. Expect document to appear in the list with auto-generated title (e.g., `ACTA_2026_05.pdf`)
8. Take screenshot

**ASCII Wireframe** (expected final state):
```
┌──────────────────────────────────────┐
│  Subir Documento                      │
│  ┌──────────────────────────────┐     │
│  │ Categoría: [Acta de Junta ▼] │     │
│  │ Período: [2026 ▼]           │     │
│  │ Archivo: [acta.pdf]          │     │
│  │                              │     │
│  │ [Subir]                      │     │
│  └──────────────────────────────┘     │
└──────────────────────────────────────┘
```

### Scenario 4: Ver y regenerar rotación de ancianos
**URL**: `/documentos`
**Description**: Validar que un editor puede ver la rotación de ancianos y regenerarla si es necesario

**Steps**:
1. Navigate to `/documentos`
2. Select a year with an existing period
3. Click manage elder shifts button ("Rotación")
4. Expect dialog showing all elder shift assignments for the year (26 biweekly turns)
5. Verify "Regenerar rotación" button exists
6. Verify no add/remove individual shift functionality (read-only with regenerate option)
7. Take screenshot

## Migration Plan

1. ✅ Crear entidades `Period` y `ElderShift` con migraciones
2. ✅ Agregar `periodId` como columna opcional en `ChurchDocument`
3. ✅ Crear endpoint POST `/periods` para crear período anual con rotación automática
4. ✅ Crear endpoint GET `/periods/:id` con pastor y ancianos de turno
5. ✅ Actualizar upload de documento para asociar a período
6. ✅ Actualizar frontend para mostrar selector de año y cards de contexto
7. 🔧 Fix: `usePeriodByYear` hook debe retornar `null` en vez de `undefined` cuando no hay período