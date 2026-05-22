## Why

En móvil, el calendario muestra los eventos del mes activo en una lista vertical. Cuando el usuario llega al final de la lista y quiere ver eventos del mes siguiente, debe desplazarse todo el camino hasta arriba para usar los controles de navegación de mes (anterior/siguiente). Esto es una fricción significativa en pantallas pequeñas donde el scroll ya es largo por la cantidad de eventos.

## What Changes

- La vista móvil de lista (`CalendarList`) pasa a soportar carga incremental por mes: al llegar al final del scroll se cargan automáticamente los eventos del mes siguiente
- Se elimina la dependencia de `currentMonth` como único mes visible en móvil — en móvil la lista puede mostrar múltiples meses acumulados
- Se agrega un botón flotante "Volver al inicio" que aparece cuando el usuario ha hecho scroll hacia abajo, para retornar al tope sin scrollear manualmente
- Los filtros de tipo de evento y departamento se mantienen activos y aplican sobre todos los meses cargados

## Capabilities

### New Capabilities
- `calendar-mobile-infinite-scroll`: Carga incremental de eventos por mes en la vista lista móvil, con botón flotante para volver al inicio

### Modified Capabilities
- `calendar-event-listing`: La lógica de fetching del hook `useCalendar` se extiende para soportar múltiples páginas/meses acumulados en paralelo

## Impact

- `frontend/src/features/calendar/hooks/use-calendar.ts` — nuevo hook `useCalendarInfinite` con lógica de carga por meses acumulados
- `frontend/src/features/calendar/components/calendar-list.tsx` — soporte para recibir múltiples meses y trigger de carga al final
- `frontend/src/features/calendar/pages/calendar-page.tsx` — en móvil usa el nuevo hook y la lista con infinite scroll; en desktop el comportamiento actual no cambia
- No hay cambios en backend ni en la API

## Fuera del alcance

- Infinite scroll en la vista grid (desktop) — esa vista ya funciona bien con navegación por mes
- Precarga hacia atrás (meses anteriores) al hacer scroll hacia arriba
- Virtualización de la lista (no necesaria para el volumen esperado de eventos)
- Cambios en los filtros de la barra superior — siguen funcionando igual
