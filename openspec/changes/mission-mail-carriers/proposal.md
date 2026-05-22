## Why

El programa de **Cartero Misionero** distribuye material de evangelismo (revistas, cursos bíblicos) puerta a puerta. El Excel registra ~33 carteros en la pestaña "Carteros misioneros" con: nombre, teléfono, talla de chaqueta (para el uniforme del programa) y notas. Además, esa misma pestaña tiene columnas de fechas (25 Abril, 18 Mayo, 19 Mayo) marcadas con sí/no: son la **asistencia a las capacitaciones** del programa.

La pestaña "Capacitación" complementa esto: lista las capacitaciones planificadas (Uso de Registro misionero, Recepción, Pareja Misionera, Grupo pequeño, Instructor bíblico) con su estado, responsable, lugar y fecha.

El coordinador necesita gestionar quiénes son los carteros (con su talla de chaqueta para coordinar uniformes) y llevar el registro de las capacitaciones y quién asistió a cada una. Hoy todo es texto y casillas en una planilla.

Este change crea dos capacidades: **carteros misioneros** (el registro de carteros) y **capacitaciones** (las capacitaciones del módulo misionero con su asistencia). Depende de `mission-people-registry`.

## What Changes

- **Backend** — capacidad de carteros misioneros:
  - Entidad `MailCarrier` que vincula una `Person` con datos del programa: talla de chaqueta, estado activo, notas
  - CRUD de carteros misioneros

- **Backend** — capacidad de capacitaciones:
  - Entidad `Training`: una capacitación del módulo misionero con nombre, estado (sin comenzar / en curso / completada), responsable, lugar, fecha, modalidad y notas
  - Registro de asistencia: qué Personas asistieron a cada capacitación
  - CRUD de capacitaciones y gestión de asistentes
  - Endpoint para ver las capacitaciones a las que asistió una Persona

- **Frontend** — gestión de carteros y capacitaciones:
  - Sub-sección "Carteros misioneros": listado de carteros con talla de chaqueta; formulario
  - Sub-sección "Capacitaciones": listado de capacitaciones con estado; formulario; gestión de asistentes
  - Vista de asistencia de un cartero a las capacitaciones

- **Permisos**: control total para `Admin`/`Pastor`/`Anciano`/`CoordinadorMisionero`; solo lectura para los demás roles.

## Capabilities

### New Capabilities
- `mission-mail-carriers`: Registro de carteros misioneros (programa de distribución de material), con talla de chaqueta y estado activo.
- `mission-trainings`: Gestión de capacitaciones del módulo misionero con su estado y el registro de asistentes.

### Modified Capabilities
- `mission-people`: Se agrega la regla de bloqueo de eliminación de una Persona que sea cartero misionero o tenga asistencia registrada a capacitaciones.

## Impact

- **Backend Module**: módulo `mission` (existente, se amplía)
- **New Entities**: `MailCarrier`, `Training`; tabla de asistencia `training_attendees`
- **Migrations**: crear tablas `mail_carriers`, `trainings` y `training_attendees`
- **API Endpoints**:
  - `GET/POST /api/mission/mail-carriers`, `GET/PATCH/DELETE /api/mission/mail-carriers/:id`
  - `GET/POST /api/mission/trainings`, `GET/PATCH/DELETE /api/mission/trainings/:id`
  - `POST /api/mission/trainings/:id/attendees` (registrar asistencia)
  - `DELETE /api/mission/trainings/:id/attendees/:personId` (quitar asistencia)
- **Frontend**: sub-secciones "Carteros misioneros" y "Capacitaciones"
- **Depende de**: `mission-people-registry`
- **Seeders**: `MailCarrierSeeder` y `TrainingSeeder` (con asistentes) a partir del Excel, registrados en el runner e idempotentes

## Fuera del alcance

- Inventario de material distribuido (revistas, cursos entregados) por cada cartero.
- Asignación de rutas/territorios a los carteros.
- Vínculo de las capacitaciones con el módulo de Calendario (la capacitación puede tener fecha pero no se publica como evento).
- Certificados o constancias de capacitación.
