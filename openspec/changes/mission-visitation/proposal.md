## Why

Una parte central del trabajo misionero es **visitar personas**: interesados que hay que conocer, miembros que dejaron de asistir y deben ser rescatados, y contactos en seguimiento. El Excel cubre esto en dos pestañas:

- **"Miembros rescate"**: ~50 miembros bautizados que dejaron de asistir, con su etapa de rescate (a rescatar, visitado, asiste a iglesia, asiste esporádica, decisión requerida), años desde el bautismo, responsable de la visita y notas.
- **"Visitación"**: ~20 registros de visitas a realizar, con dirección, estado (sin comenzar / completado), responsable, fecha y notas.

Hoy esto es texto suelto: no hay historial de quién visitó a quién ni cuándo, y los miembros a rescatar son una lista plana sin trazabilidad. El coordinador necesita poder asignar visitas, registrar lo que ocurrió en cada una, y ver toda la trayectoria de seguimiento de una persona.

Este change crea dos capacidades relacionadas: **miembros a rescatar** (el estado de seguimiento de un miembro inactivo) y **historial de visitas** (cada visita es un registro con fecha, responsable y resultado). Depende de `mission-people-registry`.

## What Changes

- **Backend** — capacidad de miembros a rescatar:
  - Entidad `RescueMember` que vincula una `Person` con una etapa de rescate, años desde el bautismo, un responsable de seguimiento y notas
  - Etapas de rescate como enum: `PorRescatar`, `Visitado`, `AsisteEsporadica`, `AsisteIglesia`, `DecisionRequerida`
  - CRUD y filtros por etapa

- **Backend** — capacidad de visitas:
  - Entidad `Visit`: una visita realizada o planificada a una `Person`, con fecha, estado (planificada / completada), responsable(s), resultado/notas
  - El responsable de una visita puede ser un usuario, una Persona o una pareja misionera
  - Cada Persona acumula un **historial de visitas**
  - CRUD de visitas, filtros por estado y por persona
  - Endpoint para ver el historial de visitas de una Persona

- **Frontend** — gestión de visitación y rescate:
  - Sub-sección "Visitación" en el módulo misionero: listado de visitas con estado y responsable
  - Sub-sección "Miembros a rescatar": listado con etapa y responsable
  - Formularios para registrar una visita y para registrar/actualizar un miembro a rescatar
  - Historial de visitas en el detalle de cada Persona

- **Permisos**: control total para `Admin`/`Pastor`/`Anciano`/`CoordinadorMisionero`; solo lectura para los demás roles.

## Capabilities

### New Capabilities
- `mission-rescue-members`: Seguimiento de miembros bautizados inactivos que deben ser rescatados, con etapa de rescate y responsable.
- `mission-visits`: Historial de visitas a personas: cada visita es un registro con fecha, responsable, estado y resultado. Permite ver toda la trayectoria de seguimiento de una persona.

### Modified Capabilities
- `mission-people`: Se agrega la regla de bloqueo de eliminación de una Persona que tenga visitas registradas o un registro de rescate, y se expone el historial de visitas en el detalle de la Persona.

## Impact

- **Backend Module**: módulo `mission` (existente, se amplía)
- **New Entities**: `RescueMember`, `Visit`
- **Migrations**: crear tablas `rescue_members` y `visits`
- **API Endpoints**:
  - `GET/POST /api/mission/rescue-members`, `GET/PATCH/DELETE /api/mission/rescue-members/:id`
  - `GET/POST /api/mission/visits` (filtros `?status=`, `?personId=`)
  - `GET/PATCH/DELETE /api/mission/visits/:id`
  - `GET /api/mission/people/:id/visits` (historial de visitas de una persona)
- **Frontend**: sub-secciones "Visitación" y "Miembros a rescatar"; historial de visitas en el detalle de Persona
- **Depende de**: `mission-people-registry`; opcionalmente `mission-missionary-pairs` (para responsable pareja)
- **Seeders**: `RescueMemberSeeder` y `VisitSeeder` con los datos del Excel, registrados en el runner e idempotentes

## Fuera del alcance

- Recordatorios automáticos o notificaciones de visitas pendientes.
- Geolocalización / mapa de visitas.
- Cambio automático de etapa de rescate al completar una visita: la etapa se actualiza manualmente.
- Vínculo con el calendario para agendar la visita como evento.
