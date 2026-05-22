## Why

El Coordinador Misionero gestiona hoy en una planilla Excel ("Registro misionero") a decenas de personas: interesados en estudiar la Biblia, estudiantes activos, miembros a rescatar, parejas misioneras, carteros misioneros e integrantes de grupos pequeños. La misma persona aparece duplicada en varias pestañas (un interesado puede luego ser estudiante, miembro bautizado e instructor), lo que genera datos inconsistentes y trabajo manual.

El sistema necesita una **entidad Persona** central y reutilizable. Toda capacidad futura del módulo misionero (estudios bíblicos, parejas misioneras, grupos pequeños, visitación, carteros, dones) referenciará Personas en lugar de duplicar nombres y teléfonos. Una Persona NO requiere acceso al sistema; los usuarios con login (`User`) son un subconjunto que se vincula opcionalmente a una Persona.

Este change es la base del módulo misionero: entrega el mantenedor de Personas y la estructura de navegación/permisos del módulo. El resto de capacidades se construye encima en changes posteriores.

## What Changes

- **Backend**: Nuevo módulo NestJS `mission` con la capacidad de Personas:
  - Entidad `Person` con datos básicos (nombre, teléfono, dirección, fecha de nacimiento, notas, etc.)
  - Campo `isBaptizedMember` para distinguir miembros bautizados de no miembros
  - CRUD completo de Personas con búsqueda por nombre
  - Vínculo opcional `User → Person` (FK opcional `personId` en `users`): un usuario puede representar a una Persona registrada, una Persona tiene como máximo un User
  - Endpoint de búsqueda de Personas para selectores reutilizables (autocompletar)

- **Frontend**: Mantenedor de Personas dentro del nuevo módulo Misionero:
  - Entrada "Misionero" en el sidebar con sub-navegación
  - Página de listado de Personas con búsqueda y paginación
  - Formulario de creación/edición de Persona
  - Eliminación con confirmación (bloqueada si la Persona está referenciada por otras entidades del módulo)

- **Permisos del módulo**: Admin, Pastor, Anciano y Coordinador Misionero tienen control total del módulo misionero. Los demás roles tienen acceso de solo lectura general (los permisos finos de edición sobre lo propio se definen en los changes de cada capacidad).

## Capabilities

### New Capabilities
- `mission-people`: Mantenedor central de Personas del módulo misionero. Datos básicos reutilizables por todas las capacidades misioneras, con vínculo opcional a `User` para personas que tienen acceso al sistema.
- `mission-module-access`: Estructura de navegación y modelo de permisos del módulo misionero. Define qué roles tienen control total y cuáles solo lectura.

### Modified Capabilities
- `auth`: La entidad `User` incorpora una FK opcional `personId` para vincular un usuario con su Persona registrada.

## Impact

- **Backend Module**: nuevo módulo `mission`
- **New Entities**: `Person`
- **Modified Entities**: `User` (nueva columna `person_id` nullable)
- **Migrations**: crear tabla `people`; agregar columna `person_id` a `users`
- **API Endpoints**:
  - `GET /api/mission/people` (control total; soporta búsqueda `?search=` y paginación)
  - `GET /api/mission/people/:id`
  - `POST /api/mission/people`
  - `PATCH /api/mission/people/:id`
  - `DELETE /api/mission/people/:id`
- **Frontend**:
  - Nueva sección "Misionero" en el sidebar
  - Páginas: listado de Personas, formulario de Persona
- **Roles afectados**: el módulo misionero usa los roles existentes (`Admin`, `Pastor`, `Anciano`, `CoordinadorMisionero`, `DirectorDepartamento`, `Secretaria`, `MaestroClase`). No se crean roles nuevos.
- **Seeders**: `PersonSeeder` con Personas de ejemplo a partir de los datos del Excel, registrado en el runner de seeders e idempotente.

## Fuera del alcance

- Estudios bíblicos, cursos, instructores, parejas misioneras, grupos pequeños, visitación, carteros y dones: cada uno es un change posterior que depende de este.
- Importación masiva desde el Excel "Registro misionero" (puede abordarse luego como utilidad de migración).
- Fotografía/avatar de la Persona.
- Permisos finos de edición por rol no-controlador (se definen en cada capacidad específica).
- Self-service: las Personas siempre las crea un usuario con control total del módulo.
