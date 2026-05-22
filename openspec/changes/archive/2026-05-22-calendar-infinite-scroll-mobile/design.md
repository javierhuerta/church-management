## Context

El calendario móvil hoy carga todos los eventos del mes activo en una sola query (`useCalendar`), pasando un `startDate` y `endDate` de ±7 días alrededor del mes. La `CalendarList` recibe ese array y lo renderiza agrupado por día. No hay paginación ni carga incremental.

El problema: cuando hay muchos eventos en un mes, el usuario llega al final de la lista y para ver el mes siguiente debe scrollear hasta la cima donde están los controles de navegación (`EventFilters`). En móvil esto es especialmente frustrante.

Este change es frontend-only. No hay cambios en el backend ni en la API — el endpoint ya soporta `startDate`/`endDate` arbitrarios y paginación interna.

## Goals / Non-Goals

**Goals**:
- Al llegar al final del scroll en móvil, cargar automáticamente los eventos del mes siguiente
- Mostrar los meses cargados de forma acumulada en la lista (no reemplazar, sino agregar)
- Botón flotante "Ir al inicio" que aparece al scrollear hacia abajo
- Los filtros (tipo, departamento) aplican sobre todos los meses cargados

**Non-Goals**:
- Scroll hacia atrás (cargar meses anteriores)
- Cambiar el comportamiento desktop (grid por mes sigue igual)
- Virtualización de la lista

## Decisions

### D1: `useInfiniteQuery` de TanStack Query en lugar de queries manuales acumuladas

**Decisión**: Reemplazar `useCalendar` (que usa `useQuery`) por un nuevo hook `useCalendarInfinite` basado en `useInfiniteQuery`.

**Alternativas consideradas**:
- Manejar manualmente un array de meses con `useState` + múltiples `useQuery`: más verboso, más re-renders, no aprovecha el cache de TanStack.
- Un solo `useQuery` con rango extendido: carga todos los meses de golpe, poco escalable y no produce la UX de carga progresiva.

**Por qué `useInfiniteQuery`**: diseñado exactamente para este patrón. Gestiona páginas acumuladas, estado de carga por página, `fetchNextPage`, y `hasNextPage` de forma nativa. El `queryKey` incluye los filtros para que un cambio de filtro reinicie la lista.

**Parámetro de página**: cada "página" es un mes. El `pageParam` es un objeto `{ year, month }`. La primera página es el mes actual al montar el componente.

### D2: Intersection Observer para el trigger de carga (no scroll event)

**Decisión**: Usar `IntersectionObserver` con un elemento centinela al final de la lista para disparar `fetchNextPage`.

**Por qué**: `scroll` events requieren throttling manual y acceso al DOM del scroll container. `IntersectionObserver` es más performante, declarativo, y funciona bien con listas largas. Implementado via `useRef` + `useEffect` en `CalendarList`.

### D3: El botón "Ir al inicio" es un FAB flotante con `window.scrollTo`

**Decisión**: Un `<button>` posicionado `fixed` en `bottom-6 right-6`, visible solo cuando `scrollY > 300px`. Usa `window.scrollTo({ top: 0, behavior: 'smooth' })`.

**Por qué**: Simple, sin dependencias adicionales. El threshold de 300px evita que aparezca con scrolls mínimos. Solo visible en móvil (`md:hidden`).

### D4: `CalendarList` no gestiona el estado de meses — lo recibe todo de la página

**Decisión**: `CalendarList` recibe `events: EventResponseDto[]` (todos los eventos de todos los meses acumulados) más `onLoadMore: () => void` y `hasMore: boolean`. La lógica de qué meses están cargados vive en `CalendarPage`.

**Por qué**: mantiene `CalendarList` como componente presentacional. El estado de paginación (cuántos meses) vive en el hook, no en la lista.

## Risks / Trade-offs

- [Filtros aplicados post-carga] Si el usuario cambia el filtro después de haber cargado 3 meses, `useInfiniteQuery` reinicia desde el mes actual. Esto es el comportamiento correcto pero puede sorprender si el usuario esperaba mantener el scroll. → Aceptado: los filtros son parámetros del queryKey, el reset es consistente.
- [Duplicados en límites de mes] La query actual añade ±7 días al rango. Con meses acumulados hay riesgo de duplicados en eventos que caen cerca del límite. → Mitigation: cada página usa `startOfMonth` / `endOfMonth` exactos, sin el margen de ±7 días que solo aplica en la vista desktop.
- [Memoria] Con muchos meses cargados el DOM puede crecer. Para el volumen esperado (iglesia local, ~20-50 eventos/mes) no es un problema. Si escala, añadir virtualización.

## Migration Plan

1. Crear `useCalendarInfinite` en `use-calendar.ts` sin tocar `useCalendar` (que sigue siendo usado por desktop)
2. Actualizar `CalendarList` para aceptar las nuevas props (`onLoadMore`, `hasMore`) con valores por defecto para no romper usos existentes
3. Actualizar `CalendarPage` para usar el nuevo hook en la rama móvil (`block md:hidden`)
4. No hay cambios de API, BD ni migraciones

## Open Questions

- ¿El mes inicial en móvil debe ser el mes actual o el primero con eventos futuros? → Asumimos mes actual por consistencia con desktop.

---

## UI Scenarios

> Estos escenarios son ejecutados por `/qa-change` con Playwright MCP.
> Requiere frontend en http://localhost:5173 y backend en http://localhost:3000.

### Scenario: Infinite scroll carga el mes siguiente al llegar al final
**URL**: `/calendario`
**Description**: Valida que en móvil, al hacer scroll hasta el final de la lista de eventos del mes actual, se cargan automáticamente los eventos del mes siguiente.

> **Auth required**: Usa credenciales de prueba admin.

**Steps**:
1. Navigate to `http://localhost:5173/calendario`
2. Wait for text `Calendario`
3. Expect element `[data-testid="calendar-list-mobile"]` to exist
4. Expect element `[data-testid="load-more-sentinel"]` to exist
5. Expect element `[data-testid="loading-more-indicator"]` to exist

**ASCII Wireframe** (estado final esperado):
```
┌──────────────────────────┐
│  [evento mes actual]     │
│  [evento mes actual]     │
│  ─── próximo mes ───     │
│  [evento mes siguiente]  │
│  [evento mes siguiente]  │
│                          │
│              ↑ [inicio]  │
└──────────────────────────┘
```

### Scenario: Botón "Ir al inicio" aparece y funciona
**URL**: `/calendario`
**Description**: Valida que el botón flotante de volver al inicio aparece al hacer scroll y lleva al tope de la página.

> **Auth required**: Usa credenciales de prueba admin.

**Steps**:
1. Navigate to `http://localhost:5173/calendario`
2. Wait for text `Calendario`
3. Expect element `[data-testid="scroll-to-top-btn"]` to exist

**ASCII Wireframe** (estado final esperado):
```
┌──────────────────────────┐
│  Calendario              │
│  Eventos de la iglesia   │
│                          │
│  [lista de eventos]      │
│                          │
│              ↑ [inicio]  │ ← botón FAB visible
└──────────────────────────┘
```
