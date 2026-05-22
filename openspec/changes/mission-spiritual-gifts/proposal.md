## Why

La iglesia aplica un instrumento de **descubrimiento de dones espirituales**: cada miembro indica en qué actividades del ministerio se siente afín (escuchar y orar, visitar, enseñar, música, trabajar con niños, etc.), cuáles son sus 3 principales, y cómo quiere iniciar su servicio (probar una vez, integrarse un mes, capacitación, orientación). La pestaña "Dones" del Excel registra ~60 respuestas con: nombre, contacto, actividades afines, top 3, "quiero iniciar", responsable de inicio, etapa y notas.

El objetivo de este instrumento es **conectar a cada miembro con un ministerio donde sirva** según sus dones. Hoy las respuestas son texto en una planilla; el coordinador no puede filtrar "quién tiene afinidad con visitar" para armar parejas, ni hacer seguimiento de quién ya fue integrado a un ministerio.

Este change crea la capacidad de **descubrimiento de dones**: registra la evaluación de dones de cada Persona y permite hacer seguimiento de su integración al servicio. Depende de `mission-people-registry`.

## What Changes

- **Backend** — capacidad de descubrimiento de dones:
  - Catálogo de **áreas de actividad** del ministerio (las 14 categorías A–N del Excel: Escuchar/orar, Visitar, Recepción, Logística, Enseñar, Música, Audio/proyección, Invitar/seguimiento, Niños, Adolescentes/jóvenes, Vida sana, Familias, Necesidades especiales, Templo)
  - Entidad `GiftAssessment` que vincula una `Person` con sus áreas afines, sus 3 principales, su modo preferido de iniciar el servicio, una etapa de seguimiento, un responsable de inicio y notas
  - CRUD de evaluaciones de dones, filtros por área de actividad y por etapa

- **Frontend** — gestión de descubrimiento de dones:
  - Sub-sección "Descubrimiento de dones" en el módulo misionero
  - Listado de evaluaciones con filtros por área de actividad y por etapa de integración
  - Formulario para registrar/editar la evaluación de dones de una Persona
  - Vista de la evaluación de dones en el detalle de la Persona

- **Permisos**: control total para `Admin`/`Pastor`/`Anciano`/`CoordinadorMisionero`; solo lectura para los demás roles.

## Capabilities

### New Capabilities
- `mission-spiritual-gifts`: Registro del descubrimiento de dones espirituales de cada Persona: áreas de actividad afines, dones principales, modo de iniciar el servicio y seguimiento de la integración a un ministerio.

### Modified Capabilities
- `mission-people`: Se agrega la regla de bloqueo de eliminación de una Persona con una evaluación de dones, y se expone la evaluación en el detalle de la Persona.

## Impact

- **Backend Module**: módulo `mission` (existente, se amplía)
- **New Entities**: `ActivityArea` (catálogo), `GiftAssessment`; tabla de relación `gift_assessment_areas`
- **Migrations**: crear tablas `activity_areas`, `gift_assessments` y `gift_assessment_areas`
- **API Endpoints**:
  - `GET /api/mission/activity-areas` (catálogo)
  - `GET/POST /api/mission/gift-assessments` (filtros `?areaId=`, `?stage=`)
  - `GET/PATCH/DELETE /api/mission/gift-assessments/:id`
- **Frontend**: sub-sección "Descubrimiento de dones"; vista en el detalle de Persona
- **Depende de**: `mission-people-registry`
- **Seeders**: `ActivityAreaSeeder` (catálogo de 14 áreas) y `GiftAssessmentSeeder` (evaluaciones del Excel), registrados en el runner en orden de dependencia e idempotentes

## Fuera del alcance

- El formulario público de auto-evaluación de dones (que la propia persona lo complete): en v1 lo registra un usuario con control total.
- Recomendación automática de ministerios según los dones.
- Vínculo automático entre la evaluación de dones y la asignación a una pareja misionera o grupo pequeño (el coordinador lo hace manualmente en cada capacidad).
- Cuestionario detallado pregunta-por-pregunta: se registra el resultado (áreas afines, top 3), no el cuestionario completo.
