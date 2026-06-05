## Context

La sección Horarios del sitio público (`PageHorarios` en `website/pages-2.jsx`) tiene
esta estructura actual (todo hardcodeado):

```
┌──────────────────────────────────────────────────────────┐
│                     HORARIOS                              │
│  Cada semana, un lugar para ti.                           │
│  Todas las visitas son bienvenidas.                       │
│                                                           │
│  ┌──────────┬──────────────────────────────────────────┐  │
│  │ Sábado   │ 09:45  Escuela Sabática                  │  │
│  │ (gold,   │        Estudio bíblico por grupos...     │  │
│  │  italic) │ 11:00  Culto Divino                      │  │
│  │          │        Adoración con cantos...           │  │
│  │          │ 17:00  Culto Joven                       │  │
│  │          │        Espacio de adoración...           │  │
│  ├──────────┼──────────────────────────────────────────┤  │
│  │ Miércoles│ 06:00  Culto de Oración Matutino         │  │
│  │          │        Encuentro de oración...           │  │
│  │          │ 19:30  Culto de Oración                  │  │
│  │          │        Estudio breve y oración...        │  │
│  └──────────┴──────────────────────────────────────────┘  │
│                                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  PUESTA DE SOL (navy bg)                            │ │
│  │  "Acuérdate del día de reposo..." — Éxodo 20:8      │ │
│  │  Viernes 22 may  17:38 | 29 may  17:32 | ...        │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

El array `week` (líneas 8–18 del archivo) define los días y sus ítems como tuplas
`[hora, nombre, descripción]`. Los textos del encabezado son JSX inline. La sección
de Puesta de sol está debajo, con un grid de 4 fechas y horas fijas.

Este change se monta sobre `site-config-foundation`, que ya provee:
- El shell `ConfiguracionesLayout` con navegación por tabs (`/admin/configuraciones/:seccion`).
- El almacén `SiteSetting` clave/valor para los textos del encabezado.
- El namespace `/api/public/*` sin autenticación.
- El puente `website/integration.js` con `window.IASD_API`.
- `website/INTEGRATION.md` para documentar parches.

## Goals / Non-Goals

**Goals:**
- Entidad `ScheduleItem` con CRUD admin completo protegido para `Admin`.
- Endpoint público `GET /api/public/schedule` que devuelva los horarios activos
  ordenados en el shape que `PageHorarios` espera.
- Pestaña "Horarios" en Configuraciones para gestionar la lista de servicios.
- Textos introductorios de la página editables vía `SiteSetting` (`horarios.*`).
- Cablear `PageHorarios` a la API vía `integration.js`.

**Non-Goals:**
- Administrar la sección "Puesta de sol" (sunset times): datos astronómicos que
  pueden calcularse; se deja para un change futuro o se mantiene hardcodeado.
- Sincronización con Calendario.
- Horarios especiales por fecha.
- Vista previa del sitio desde el admin.

## Decisions

### 1. `ScheduleItem` — entidad dedicada para la colección de horarios

**Decisión:** entidad `ScheduleItem` en el módulo `site-config`, con tabla
`schedule_items`. Cada fila representa un servicio en un día específico.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `dayLabel` | varchar | Etiqueta del día: 'Sábado', 'Miércoles', etc. |
| `dayAccent` | boolean | `true` para el día principal (Sábado) — activa el estilo italic/gold en el sitio |
| `time` | varchar | Hora del servicio: '09:45', '11:00', '17:00', etc. |
| `title` | varchar | Nombre del servicio: 'Escuela Sabática', 'Culto Divino' |
| `description` | text nullable | Descripción larga del servicio |
| `sortOrder` | int | Orden: primero por día (todos los ítems del mismo día tienen `sortOrder` contiguo), luego intra-día |
| `isActive` | boolean | `true` por defecto. Solo ítems activos se exponen en el endpoint público |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

**Por qué entidad dedicada y no `SiteSetting`:** los horarios son una colección
estructurada con múltiples campos por ítem y necesitan CRUD, ordenamiento y filtro
activo/inactivo. `SiteSetting` es para valores simples (un texto, una URL). Usar JSON
en `SiteSetting` para una colección sería frágil y difícil de editar desde un formulario.
La entidad dedicada permite una UI rica (lista ordenable, toggle activo/inactivo por ítem).

### 2. Ordenamiento: `sortOrder` con endpoint de reordenamiento masivo

**Decisión:** cada `ScheduleItem` tiene un campo `sortOrder` numérico. El orden se
gestiona con:

- Al crear un ítem: se asigna `sortOrder = max + 1` para ese día.
- Endpoint `PATCH /api/site-config/schedule/reorder`: recibe un array de
  `{ id, sortOrder }` y actualiza todos en una transacción. Esto soporta
  drag-and-drop en el frontend.

**Alternativa considerada:** ordenar por día + hora. Descartada porque hay servicios
sin hora fija o que necesitan un orden manual distinto al cronológico.

### 3. Endpoint público: agregación por día

**Decisión:** `GET /api/public/schedule` devuelve:

```json
{
  "kicker": "Horarios",
  "title": "Cada semana, un lugar para ti.",
  "paragraph": "Todas las visitas son bienvenidas. No es necesario registrarse.",
  "days": [
    {
      "label": "Sábado",
      "accent": true,
      "items": [
        { "id": "...", "time": "09:45", "title": "Escuela Sabática", "description": "..." },
        { "id": "...", "time": "11:00", "title": "Culto Divino", "description": "..." }
      ]
    },
    {
      "label": "Miércoles",
      "accent": false,
      "items": [
        { "id": "...", "time": "06:00", "title": "Culto de Oración Matutino", "description": "..." }
      ]
    }
  ]
}
```

- Los textos de encabezado (`kicker`, `title`, `paragraph`) vienen de `SiteSetting`
  (claves `horarios.page_kicker`, `horarios.page_title`, `horarios.page_paragraph`).
- Solo se incluyen ítems con `isActive = true`.
- Los días se agrupan por `dayLabel` y se ordenan por `sortOrder`.
- Dentro de cada día, los ítems se ordenan por `sortOrder`.

**Shape pensado para consumir desde `PageHorarios`:** el mapeo es directo — `days`
reemplaza al array `week` hardcodeado, y cada item ya viene con `time`, `title`,
`description`.

### 4. Textos introductorios: `SiteSetting` con claves `horarios.*`

**Decisión:** los tres textos del encabezado de la página se almacenan en `SiteSetting`:

| Clave | Default | Uso |
|---|---|---|
| `horarios.page_kicker` | `Horarios` | Kicker superior |
| `horarios.page_title` | `Cada semana, un lugar para ti.` | Título principal de la sección |
| `horarios.page_paragraph` | `Todas las visitas son bienvenidas. No es necesario registrarse.` | Párrafo debajo del título |

El título actual del diseño tiene la palabra "un lugar" en italic gold. En v1 se
entrega el texto plano; el diseño de `PageHorarios` puede aplicar el estilo con una
heurística simple (ej. buscar texto entre `<em>...</em>` o aplicar el estilo a la
última frase). Si se necesita control preciso del formato, se puede evolucionar a
un campo `titleHtml` en un change futuro.

### 5. Pestaña "Horarios" en Configuraciones

**Decisión:** la pestaña se registra en el arreglo de tabs de `ConfiguracionesLayout`
con `{ id: 'horarios', label: 'Horarios', path: 'horarios' }`, ruta
`/admin/configuraciones/horarios`. La página tiene dos secciones verticales:

1. **Textos de la página** (arriba): formulario con tres campos de texto para
   `horarios.page_kicker`, `horarios.page_title`, `horarios.page_paragraph`.
   Botón "Guardar textos".

2. **Lista de horarios** (abajo): tabla con columnas Día, Hora, Servicio, Activo,
   Acciones. Cada fila tiene toggle activo/inactivo, botones editar/eliminar, y
   botones subir/bajar para reordenar. Botón "+ Nuevo horario" abre formulario
   de creación (modal o página).

### 6. Permisos

- **Admin (escritura):** CRUD completo de `ScheduleItem`, edición de `SiteSetting`
  con claves `horarios.*`, endpoint de reordenamiento.
- **Público (anónimo):** solo `GET /api/public/schedule`, devuelve únicamente
  ítems activos.

### 7. Cableado de PageHorarios

**Decisión:** El parche en `pages-2.jsx` es mínimo:

```js
// Antes: array week hardcodeado
// Después: fetch asíncrono
const [schedule, setSchedule] = React.useState(null);
React.useEffect(() => {
  if (window.IASD_API?.fetchSchedule) {
    window.IASD_API.fetchSchedule().then(setSchedule);
  }
}, []);
```

El componente usa `schedule?.days` en vez de `week`, y los textos del encabezado
vienen de `schedule?.kicker`, `schedule?.title`, `schedule?.paragraph`.

En `integration.js` se agrega:

```js
fetchSchedule() {
  return this.apiGet('/public/schedule');
}
```

**Fallback:** si la API no responde, la página muestra el contenido hardcodeado
actual (mantener el array `week` como default).

## Risks / Trade-offs

- **Sección "Puesta de sol" queda hardcodeada:** en `PageHorarios` la sección navy
  de sunset times se mantiene como está. Si la iglesia necesita actualizar esos
  datos, requerirá un change futuro. No bloquea el flujo porque los horarios de
  puesta de sol cambian muy gradualmente.
- **Agrupación por `dayLabel`:** si dos ítems tienen `dayLabel = 'Sábado'` pero
  uno es `dayAccent = true` y otro `false`, el endpoint público agrupa por
  `dayLabel` y usa el `dayAccent` del primer ítem del día. El diseño actual asume
  un solo valor de `accent` por día.
- **Colisión de `sortOrder`:** el reordenamiento masivo sobrescribe todos los
  `sortOrder` en una transacción; si dos usuarios editan simultáneamente, el
  último en guardar prevalece. No se implementa control de concurrencia en v1.

## Migration Plan

1. Crear migración `CreateScheduleItems` con tabla `schedule_items`.
2. Seeder `ScheduleItemSeeder`: inserta los 5 horarios del diseño actual (Sábado:
   Escuela Sabática 09:45, Culto Divino 11:00, Culto Joven 17:00; Miércoles:
   Culto de Oración Matutino 06:00, Culto de Oración 19:30) con `sortOrder` 0–4
   y `isActive = true`. Idempotente, registrado en el runner.
3. Seeder de SiteSettings para las claves `horarios.*` si no existen (idempotente).

## Diseño visual

Cargar la skill `church-ui-design` antes de implementar componentes. Patrones clave:

- **Tab "Horarios":** layout vertical de dos secciones: "Textos de la página"
  arriba (card con 3 campos de texto + botón guardar), "Horarios" abajo (tabla
  con columnas Día, Hora, Servicio, Activo, Acciones). Botón "+ Nuevo horario"
  en la cabecera de la tabla.
- **Tabla de horarios:** patrón mobile/desktop. En mobile, cada fila colapsa a
  una tarjeta con el día y la hora en la cabecera, el nombre del servicio como
  título, y la descripción debajo.
- **Badge de día:** el `dayLabel` se muestra con un badge. Si `dayAccent` es
  `true` (Sábado), el badge usa el color gold de la paleta.
- **Toggle activo/inactivo:** switch shadcn en cada fila, con confirmación al
  desactivar.
- **Formulario de horario (modal):** campos: `dayLabel` (input con sugerencias
  Sábado/Miércoles/Jueves/Viernes/Domingo), `dayAccent` (checkbox o switch),
  `time` (input tipo hora HH:MM), `title` (input texto), `description` (textarea),
  `sortOrder` (oculto, calculado automáticamente).
- **Reordenamiento:** botones subir/bajar en cada fila (más simple y accesible
  que drag-and-drop en v1). Cada click llama al endpoint de reordenamiento.
- Tipografía según la jerarquía de la skill; soporte dark mode.

## UI Scenarios

### Scenario: Admin ve la pestaña Horarios en Configuraciones

- **URL**: `/admin/configuraciones/horarios`
- **Description**: Un administrador ve la configuración de horarios con los textos de la página y la lista de servicios.
- **Steps**:
  1. `login` as `Admin`
  2. `navigate` to `/admin/configuraciones/horarios`
  3. `expect` page heading text `Horarios` visible
  4. `expect` element `data-testid="horarios-page-texts-section"` visible con campos kicker, título, párrafo
  5. `expect` element `data-testid="horarios-list-section"` visible con tabla de horarios
  6. `expect` element `data-testid="horarios-new-button"` visible

```
+---------------------------------------------------+
| Configuraciones                                   |
| [Inicio] [Liderazgo] [Calendario] [Horarios] ...  |
+---------------------------------------------------+
| Textos de la página                     [Guardar] |
|  Kicker:   [ Horarios                    ]        |
|  Título:   [ Cada semana, un lugar...   ]        |
|  Párrafo:  [ Todas las visitas son...   ]        |
+---------------------------------------------------+
| Horarios                           [+ Nuevo]      |
| Día        Hora   Servicio           Activo       |
| Sábado ★   09:45  Escuela Sabática   [on]  [↑][↓]|
| Sábado ★   11:00  Culto Divino       [on]  [↑][↓]|
| Sábado ★   17:00  Culto Joven        [on]  [↑][↓]|
| Miércoles  06:00  Culto Oración Mat. [on]  [↑][↓]|
| Miércoles  19:30  Culto de Oración   [on]  [↑][↓]|
+---------------------------------------------------+
```

### Scenario: Admin crea un nuevo horario

- **URL**: `/admin/configuraciones/horarios`
- **Description**: Un administrador agrega un nuevo servicio a los horarios.
- **Steps**:
  1. `login` as `Admin`
  2. `navigate` to `/admin/configuraciones/horarios`
  3. `click` button `data-testid="horarios-new-button"`
  4. `expect` modal visible `data-testid="horarios-form"`
  5. `type` into `data-testid="horarios-dayLabel-input"` text `Jueves`
  6. `type` into `data-testid="horarios-time-input"` text `20:00`
  7. `type` into `data-testid="horarios-title-input"` text `Estudio Bíblico`
  8. `type` into `data-testid="horarios-description-input"` text `Estudio en grupos pequeños.`
  9. `click` button `data-testid="horarios-save-button"`
  10. `expect` modal closed
  11. `expect` `data-testid="horarios-list"` contains `Estudio Bíblico`

```
+---------------------------------------------------+
| Nuevo horario                              [×]     |
+---------------------------------------------------+
| Día *         [ Jueves              ]             |
| Día principal [  ] (gold/italic)                   |
| Hora *        [ 20:00 ]                            |
| Servicio *    [ Estudio Bíblico     ]              |
| Descripción   [ Estudio en grupos...]              |
|                                          [Guardar] |
+---------------------------------------------------+
```

### Scenario: Admin reordena los horarios

- **URL**: `/admin/configuraciones/horarios`
- **Description**: Un administrador cambia el orden de los servicios.
- **Steps**:
  1. `login` as `Admin`
  2. `navigate` to `/admin/configuraciones/horarios`
  3. `expect` `data-testid="horarios-row-0"` first row is `Escuela Sabática`
  4. `click` button `data-testid="horarios-down-button-0"`
  5. `expect` `data-testid="horarios-row-0"` first row is now `Culto Divino`

```
+---------------------------------------------------+
| Horarios                           [+ Nuevo]      |
| Día        Hora   Servicio           Activo       |
| Sábado ★   11:00  Culto Divino       [on]  [↑][↓]|  ← subió
| Sábado ★   09:45  Escuela Sabática   [on]  [↑][↓]|  ← bajó
| Sábado ★   17:00  Culto Joven        [on]  [↑][↓]|
+---------------------------------------------------+
```

### Scenario: Visitante ve los horarios en el sitio público

- **URL**: `/#horarios`
- **Description**: Un visitante anónimo ve la página de horarios con datos desde la API.
- **Steps**:
  1. `navigate` to `/#horarios`
  2. `expect` page heading `Horarios` visible
  3. `expect` text `Cada semana, un lugar para ti.` visible
  4. `expect` element `data-testid="schedule-day-Sábado"` visible con items de Sábado
  5. `expect` element `data-testid="schedule-day-Miércoles"` visible con items de Miércoles
  6. `expect` item `data-testid="schedule-item-0"` shows `09:45` and `Escuela Sabática`

```
+---------------------------------------------------+
|               HORARIOS                             |
|     Cada semana, un lugar para ti.                 |
|     Todas las visitas son bienvenidas.             |
|                                                    |
|  Sábado                                            |
|    09:45  Escuela Sabática                         |
|           Estudio bíblico por grupos...            |
|    11:00  Culto Divino                             |
|           Adoración con cantos, oración...         |
|    17:00  Culto Joven                              |
|           Espacio de adoración...                  |
|                                                    |
|  Miércoles                                         |
|    06:00  Culto de Oración Matutino                |
|           Encuentro de oración temprano...         |
|    19:30  Culto de Oración                         |
|           Estudio breve y oración...               |
+---------------------------------------------------+
```

### Scenario: Admin desactiva un horario y desaparece del sitio público

- **URL**: `/admin/configuraciones/horarios`
- **Description**: Un administrador desactiva un servicio y este deja de mostrarse en el sitio.
- **Steps**:
  1. `login` as `Admin`
  2. `navigate` to `/admin/configuraciones/horarios`
  3. `click` toggle `data-testid="horarios-toggle-4"` (último ítem: `Culto de Oración`)
  4. `expect` toggle is off
  5. `navigate` to `/#horarios`
  6. `expect` item `Culto de Oración` NOT present in schedule list

```
+---------------------------------------------------+
| Horarios                           [+ Nuevo]      |
| Día        Hora   Servicio           Activo       |
| ...                                               |
| Miércoles  06:00  Culto Oración Mat. [on]  [↑][↓]|
| Miércoles  19:30  Culto de Oración   [off] [↑][↓]| ← desactivado
+---------------------------------------------------+
```
