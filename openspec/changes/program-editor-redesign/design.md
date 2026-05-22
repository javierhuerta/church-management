## Context

La pantalla `program-detail-page.tsx` tiene 930 líneas y mezcla lógica de layout, drag-and-drop, formularios inline y sidebar de historial en un solo componente. Visualmente usa clases semánticas de Tailwind mezcladas con colores hardcodeados que no siguen el design system, y el componente de historial `ProgramChangeHistory` no respeta el dark mode correctamente ni tiene agrupación visual.

La integración con el calendario es un gap operacional: publicar un programa y crear el evento son dos acciones manuales separadas que los usuarios realizan en flujos distintos.

**Stakeholders principales**: secretaria de iglesia, pastores, ancianos (usuarios que preparan el programa del culto).

## Goals / Non-Goals

**Goals**:
- Aplicar el design system completo (paleta, tipografía, dark mode) a la pantalla de edición
- Implementar componentes mobile/desktop separados para `ProgramGroupCard` y `ProgramSectionRow`
- Rediseñar `ProgramChangeHistory` con agrupación por fecha y filtro por tipo de acción
- Agregar flujo "publicar + crear evento" como opción al publicar

**Non-Goals**:
- No se refactoriza la lógica de drag-and-drop (`@dnd-kit`)
- No se cambian los formularios inline de edición de sección/grupo
- No se implementa sincronización bidireccional programa↔evento (si el evento cambia, el programa no se actualiza)
- No se modifica el schema de la entidad `ServiceProgram` (sin migraciones de datos)

## Decisions

### D1: Endpoint `publish-with-event` vs lógica 100% en frontend

**Elegido**: Nuevo endpoint `POST /worship-services/programs/:id/publish-with-event` en el backend.

**Alternativa descartada**: Ejecutar dos llamadas desde el frontend (`publish` + `POST /calendar`).

**Rationale**: Si la creación del evento falla después de publicar, con dos llamadas el programa quedaría publicado sin evento y sin forma de reintentar atómicamente. Con un endpoint único, se puede usar una transacción TypeORM que hace rollback de ambas operaciones si algo falla. Además, el historial de auditoría puede registrar la acción completa en una sola entrada.

### D2: Evento creado con estado DRAFT

El evento creado automáticamente se crea en estado `DRAFT` (no `PUBLISHED`). Esto da al usuario la oportunidad de agregar imagen, descripción extendida, y organizers antes de publicarlo en el calendario público. El usuario es dirigido al evento creado con un link opcional en el toast de confirmación.

### D3: Importación de CalendarService desde worship-services

**Elegido**: Importar `CalendarModule` en `WorshipServicesModule` y usar `CalendarService` directamente.

**Alternativa descartada**: Crear un shared service en `common/`.

**Rationale**: La dependencia es unidireccional (worship-services → calendar) y es una relación puntual. No justifica crear una capa de abstracción adicional en `common/`. Si en el futuro hay más integraciones, se puede extraer.

### D4: Separación de componentes mobile/desktop

Siguiendo el patrón del design system (`EventCard`):
- `ProgramGroupCard` exporta un switcher con `<div className="md:hidden">` y `<div className="hidden md:block">`
- Funciones internas `MobileProgramGroupCard` y `DesktopProgramGroupCard`
- Lo mismo para `ProgramSectionRow` → `MobileProgramSectionRow` / `DesktopProgramSectionRow`
- Mobile: secciones en cards apiladas con nombre en tipografía prominente, hora y responsable en metadata
- Desktop: filas compactas con drag handle, hora, responsable, y acciones al hover

### D5: Rediseño del historial sin cambiar el modelo de datos

No se agrega ninguna columna al schema. El agrupamiento por fecha se hace en el frontend (sort + reduce de los logs existentes). El filtro por tipo de acción usa el campo `action` (texto libre) con matching parcial por palabras clave (`creó`, `editó`, `publicó`, `eliminó`, `archivó`).

## UI Scenarios

### Escenario 1 — Vista desktop del editor de programa

**Ruta**: `/cultos/programas/:id`

**Pasos**:
1. Navegar a un programa en estado BORRADOR
2. Verificar header con badge de estado, fecha y botones de acción alineados correctamente
3. Verificar que los grupos muestran el card desktop con drag handle, horario y botón "Editar" en hover
4. Verificar que las secciones muestran la fila desktop con hora, nombre, responsable y acciones
5. Verificar sidebar de historial con agrupación por fecha y badge de acción coloreado

**Resultado esperado**: Layout de dos columnas (editor 2/3 + historial 1/3). Cards con `rounded-xl border-border bg-card`. Badge de estado con colores de `STATUS_COLORS`. Sidebar historial con separadores de fecha usando el patrón de `calendar-list`.

### Escenario 2 — Vista mobile del editor

**Ruta**: `/cultos/programas/:id` (viewport < 768px)

**Pasos**:
1. Abrir el programa en mobile
2. Verificar que los grupos se muestran como cards apiladas (no filas)
3. Verificar que el historial está oculto detrás de un botón/tab en mobile
4. Verificar que los botones de acción (Publicar, PDF, Eliminar) están accesibles

**Resultado esperado**: Layout de columna única. Cards de grupo con nombre en `text-lg font-semibold`. Historial en drawer o tab colapsable. Botones de acción en sticky bottom bar o en header simplificado.

### Escenario 3 — Publicar programa con evento de calendario

**Ruta**: `/cultos/programas/:id` → clic en "Publicar"

**Pasos**:
1. Clic en botón "Publicar"
2. Se abre dialog de confirmación con checkbox "Crear evento en el calendario"
3. Marcar el checkbox
4. Confirmar publicación
5. Verificar toast de éxito con link al evento creado
6. Navegar al evento → verificar que está en DRAFT con título y fecha del programa

**Resultado esperado**: Dialog con dos opciones claras. Checkbox habilitado por defecto. Toast con mensaje "Programa publicado. [Ver evento →]" que navega a `/calendario/:slug/editar`. El evento tiene `title` = nombre del template, `startDate`/`endDate` del primer grupo del programa.

### Escenario 4 — Historial filtrado por acción

**Ruta**: `/cultos/programas/:id`, sidebar historial

**Pasos**:
1. Con varios registros de historial, usar el selector de filtro por tipo
2. Seleccionar "Ediciones"
3. Verificar que solo aparecen entradas con acción que contiene "editó"
4. Seleccionar "Todo"
5. Verificar que reaparecen todos los registros agrupados por fecha

**Resultado esperado**: Selector de tipo con opciones: Todo / Creación / Ediciones / Publicaciones / Eliminaciones. Agrupación temporal visible con separadores de fecha estilo `calendar-list`.

## Risks / Trade-offs

- **[Riesgo] Transacción cross-module puede violar encapsulación** → Mitigación: usar una transacción TypeORM explícita pasando el `EntityManager` al método de `CalendarService`, o crear el evento con manejo de errores que hace rollback del publish si falla.
- **[Riesgo] Refactor de 930 líneas puede introducir regresiones en DnD** → Mitigación: no tocar la lógica de `useSensor`/`DndContext`. Solo reestructurar los elementos visuales que rodean el DnD tree.
- **[Trade-off] Evento creado en DRAFT puede quedar huérfano** → Aceptado. El usuario es responsable de completar y publicar el evento. El link en el toast lo facilita.

## Migration Plan

1. No hay migraciones de base de datos
2. El endpoint `publish` existente no cambia — `publish-with-event` es adicional
3. Despliegue: backend primero (nuevo endpoint), luego frontend (nuevo modal y UI). Sin coordinación crítica.
4. Rollback: si el frontend falla, el endpoint anterior sigue disponible. Si el nuevo endpoint falla, el frontend puede volver a usar el endpoint `publish` original.

## Open Questions

- ¿El drawer del historial en mobile debe ser persistente (tab) o un botón flotante tipo FAB? → Propuesto: tab en la parte inferior de la pantalla.
- ¿Se debe registrar en el audit log del programa que "se creó un evento de calendario" al publicar con evento? → Propuesto: sí, agregar una entrada al log del programa con `action = "creó evento de calendario"`.
