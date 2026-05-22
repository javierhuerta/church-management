## Context

El módulo misionero apoya el trabajo del Coordinador Misionero, que hoy depende de una planilla Excel ("Registro misionero") con 11 pestañas. El análisis del Excel muestra que **la misma persona aparece en múltiples pestañas** con distintos roles: un interesado puede convertirse en estudiante, luego en miembro bautizado, y eventualmente en instructor bíblico o integrante de una pareja misionera.

Para evitar duplicación, el módulo se construye sobre una entidad `Person` central. Todas las capacidades posteriores (estudios bíblicos, parejas misioneras, grupos pequeños, visitación, carteros, dones) referencian `Person`.

**Estado actual del sistema:**
- Existe `User` (login, email/password, rol, departamentos). Los roles `CoordinadorMisionero` y `MaestroClase` ya están definidos en `UserRole`.
- No existe ninguna entidad para personas sin login.
- Existe `BaseEntity` común (id UUID, created_at, updated_at).
- Existe el patrón de mantenedores (`/mantenedores/*`) como referencia de UI.

**Restricciones:**
- Backend NestJS + TypeORM + PostgreSQL, API REST con OpenAPI.
- Frontend React + Vite + shadcn/ui, clientes generados desde OpenAPI.
- No se crean roles nuevos: el módulo reutiliza `UserRole` existente.

## Goals / Non-Goals

**Goals:**
- Entidad `Person` reutilizable como base del módulo misionero.
- CRUD de Personas con búsqueda por nombre.
- Vínculo opcional `User → Person`.
- Estructura de navegación y permisos del módulo misionero.

**Non-Goals:**
- Importación masiva desde Excel.
- Capacidades misioneras específicas (cada una es un change aparte).
- Permisos finos de edición por rol no-controlador.
- Avatar/fotografía de Persona.

## Decisions

### 1. `Person` separada de `User`

**Decisión:** Crear la entidad `Person` independiente de `User`. La mayoría de las personas del módulo (interesados, miembros a rescatar, contactos) nunca tendrán login. Cuando una Persona necesita acceso al sistema (un instructor, un maestro de clase), se crea un `User` vinculado.

**Vínculo:** `User` recibe una columna nullable `person_id` (FK a `people`). Una Persona tiene como máximo un User. Los datos personales (teléfono, dirección, fecha de nacimiento) viven siempre en `Person`, no en `User`.

**Alternativas consideradas:**
- Toda persona es un `User` con flag "tiene acceso": ensucia la tabla de autenticación con cientos de registros sin credenciales.
- Sin FK, vincular por nombre: imposible saber qué usuario corresponde a qué persona.

**Rationale:** Mantiene la tabla `users` limitada a quienes realmente usan el sistema, y centraliza datos personales en un solo lugar.

### 2. Campos de `Person`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | de `BaseEntity` |
| `firstName` | string | nombre |
| `lastName` | string nullable | apellido (en el Excel muchos nombres vienen incompletos) |
| `phone` | string nullable | teléfono de contacto |
| `address` | string nullable | domicilio |
| `birthDate` | date nullable | fecha de nacimiento |
| `isBaptizedMember` | boolean | `false` por defecto; `true` para miembros bautizados |
| `notes` | text nullable | observaciones generales |
| `createdAt` / `updatedAt` | timestamp | de `BaseEntity` |

`firstName` es el único obligatorio: el Excel contiene muchos registros con solo nombre o apodo ("Miriam", "Kendal", "amiga Angela").

**`isBaptizedMember`** captura la transición interesado → miembro bautizado mencionada en el contexto. El detalle del estado misionero (A/B/C/D) NO vive en `Person`; pertenece a la capacidad de estudios bíblicos (change posterior).

### 3. Búsqueda de Personas

**Decisión:** `GET /api/mission/people` soporta `?search=` (coincidencia parcial sobre nombre y apellido, insensible a mayúsculas) y paginación (`?page=`, `?pageSize=`). Este endpoint sirve tanto al listado del mantenedor como a los selectores de autocompletar de los changes posteriores.

### 4. Eliminación de Personas

**Decisión:** En este change no existen aún entidades dependientes, así que `DELETE` elimina directamente. Los changes posteriores que referencien `Person` deben agregar la regla "bloquear eliminación si la Persona está referenciada" en su propio spec. Se documenta aquí como contrato a respetar.

### 5. Permisos del módulo

**Decisión:** Cuatro roles tienen **control total** del módulo misionero: `Admin`, `Pastor`, `Anciano`, `CoordinadorMisionero`. Se define la constante `MISSION_FULL_ACCESS_ROLES` en el módulo `mission` (análoga a `editor-roles` del calendario).

Los demás roles (`DirectorDepartamento`, `Secretaria`, `MaestroClase`) tienen **solo lectura** del módulo en v1. Los permisos finos de edición sobre lo propio (ej. un maestro de clase edita su grupo) se definen en los changes de cada capacidad.

El mantenedor de Personas de este change requiere control total para crear/editar/eliminar; el listado y detalle son visibles también para roles de solo lectura.

### 6. Ubicación en la navegación

**Decisión:** Nueva sección "Misionero" en el sidebar, con sub-navegación propia (`/misionero/*`). El mantenedor de Personas vive en `/misionero/personas`. Las capacidades posteriores agregan sus propias entradas bajo la misma sección.

### 7. Convención de seeders del módulo misionero

**Decisión:** **toda entidad nueva del módulo misionero tiene su propio seeder.** Cada change que agrega entidades debe entregar un seeder por entidad principal, ubicado en `src/seeds/mission/`, y registrarlo en el runner de seeders del proyecto.

Reglas que aplican a todos los seeders del módulo (ver también `AGENTS.md`):

- **Un seeder por entidad principal**, nombrado `<Entidad>Seeder` (ej. `PersonSeeder`, `BibleCourseSeeder`).
- **Idempotente:** el seeder no duplica registros si ya existen (verificar por una clave natural antes de insertar).
- **Sin cascade implícito:** cada entidad hija se crea con su propio repositorio pasando el FK manualmente; no confiar en `cascade` de TypeORM salvo que la entidad lo declare.
- **Orden de dependencia:** los seeders se registran en el runner respetando las dependencias entre entidades (`PersonSeeder` antes que cualquier seeder que referencie Personas; catálogos antes que entidades que los usan).
- **Fuente de datos:** los datos semilla provienen del Excel "Registro misionero" cuando aplique; los catálogos (cursos bíblicos, áreas de actividad) son datos de configuración inicial obligatorios.

`PersonSeeder` es la base: se registra primero y todos los demás seeders del módulo dependen de él.

## Risks / Trade-offs

- **Nombres ambiguos:** el Excel tiene registros poco identificables ("Miriam", "Cristian"). Riesgo de duplicar Personas al cargar datos. Mitigación: el formulario de creación muestra coincidencias por nombre antes de guardar (mejora opcional; en v1 basta con la búsqueda en el listado).
- **`person_id` en `users`:** agregar una columna a una tabla central es de bajo riesgo (nullable, sin default). La migración no toca datos existentes.

## Migration Plan

1. Migración: crear tabla `people`.
2. Migración: agregar columna nullable `person_id` a `users` con FK a `people` (ON DELETE SET NULL).
3. Sin backfill de datos: los usuarios existentes quedan con `person_id = NULL`.

## Diseño visual

Cargar la skill `church-ui-design` antes de implementar componentes.

- **Listado de Personas:** patrón de mantenedor existente (`/mantenedores/usuarios` como referencia). Tabla en desktop, tarjetas apiladas en mobile (patrón mobile/desktop obligatorio).
- **Badge de miembro:** las Personas con `isBaptizedMember = true` muestran un badge usando el estilo de status badges del sistema (variante neutra/positiva).
- **Formulario de Persona:** campos en una sola columna, agrupados (datos de contacto / datos personales / notas). Componentes shadcn (`Input`, `Textarea`, `Switch` para `isBaptizedMember`, date picker reutilizable para `birthDate`).
- **Tipografía:** título de página, subtítulos de sección y texto de cuerpo según la jerarquía tipográfica de la skill, sin tags HTML semánticos.
- **Colores:** usar clases semánticas de Tailwind; paleta de marca (NAVY/GOLD) solo donde la skill lo indique.
- Soporte dark mode en todas las pantallas nuevas.

## UI Scenarios

### Scenario: Coordinador abre el módulo misionero y ve el listado de personas

- **URL**: `/misionero/personas`
- **Description**: Un usuario con control total entra al módulo misionero desde el sidebar y ve el mantenedor de Personas con búsqueda.
- **Steps**:
  1. `login` as `CoordinadorMisionero`
  2. `click` sidebar item `data-testid="nav-misionero"`
  3. `click` sub-item `data-testid="nav-misionero-personas"`
  4. `expect` page heading text `Personas`
  5. `expect` element `data-testid="people-search-input"` visible
  6. `expect` element `data-testid="people-list"` visible
  7. `type` into `data-testid="people-search-input"` text `Ruth`
  8. `expect` `data-testid="people-list"` filtered results contain `Ruth`

```
+--------------------------------------------------+
| Misionero  >  Personas              [+ Nueva]    |
+--------------------------------------------------+
| [ Buscar persona...            (Ruth)         ]  |
+--------------------------------------------------+
| Nombre              Teléfono     Miembro        |
| Ruth García         9 ...        [ Bautizado ]  |
| ...                                              |
+--------------------------------------------------+
```

### Scenario: Coordinador crea una nueva persona

- **URL**: `/misionero/personas`
- **Description**: Un usuario con control total crea una Persona con datos básicos.
- **Steps**:
  1. `login` as `CoordinadorMisionero`
  2. `navigate` to `/misionero/personas`
  3. `click` button `data-testid="people-new-button"`
  4. `expect` page heading text `Nueva persona`
  5. `type` into `data-testid="person-firstName-input"` text `Pedro`
  6. `type` into `data-testid="person-lastName-input"` text `Soto`
  7. `type` into `data-testid="person-phone-input"` text `9 1234 5678`
  8. `click` button `data-testid="person-save-button"`
  9. `expect` redirect to `/misionero/personas`
  10. `expect` `data-testid="people-list"` contains `Pedro Soto`

```
+--------------------------------------------------+
| Nueva persona                                    |
+--------------------------------------------------+
| Nombre*       [ Pedro          ]                 |
| Apellido      [ Soto           ]                 |
| Teléfono      [ 9 1234 5678    ]                 |
| Domicilio     [                ]                 |
| Nacimiento    [  __/__/____    ]                 |
| Miembro bautizado            [ off ]             |
| Notas         [                ]                 |
|                       [ Cancelar ] [ Guardar ]   |
+--------------------------------------------------+
```

### Scenario: Rol de solo lectura ve personas pero no puede crear

- **URL**: `/misionero/personas`
- **Description**: Un usuario sin control total puede ver el listado de Personas pero no ve acciones de creación/edición.
- **Steps**:
  1. `login` as `Secretaria`
  2. `navigate` to `/misionero/personas`
  3. `expect` element `data-testid="people-list"` visible
  4. `expect` element `data-testid="people-new-button"` not visible

```
+--------------------------------------------------+
| Misionero  >  Personas                           |
+--------------------------------------------------+
| [ Buscar persona...                           ]  |
+--------------------------------------------------+
| Nombre              Teléfono     Miembro        |
| Ruth García         9 ...        [ Bautizado ]  |
| ... (solo lectura, sin botones de acción)        |
+--------------------------------------------------+
```
