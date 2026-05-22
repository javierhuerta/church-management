## Tasks

### Backend
_(no hay cambios en backend para este change)_

### Frontend

- [x] Crear hook `useCalendarInfinite` en `use-calendar.ts` usando `useInfiniteQuery` de TanStack Query
  - El `pageParam` es `{ year: number, month: number }` — primera página es el mes actual
  - El `queryKey` incluye `filters` (eventType, departmentId) para que un cambio de filtro reinicie
  - Cada página usa `startOfMonth` / `endOfMonth` exactos (sin margen de ±7 días)
  - `getNextPageParam` retorna el mes siguiente al último mes cargado
  - `hasNextPage` siempre es `true` (no hay fin de calendario)

- [x] Actualizar `CalendarList` para soportar infinite scroll
  - Agregar props `onLoadMore?: () => void` y `hasMore?: boolean` (opcionales para no romper uso desktop)
  - Agregar un elemento sentinela `<div data-testid="load-more-sentinel">` al final de la lista
  - Usar `IntersectionObserver` via `useRef` + `useEffect` para llamar a `onLoadMore` cuando el sentinela entra al viewport
  - Agregar separador de mes entre grupos de días de distintos meses
  - Agregar `data-testid="calendar-list-mobile"` al contenedor raíz
  - Mostrar `<div data-testid="loading-more-indicator">` con spinner cuando `hasMore && isLoadingMore`

- [x] Agregar botón flotante "Ir al inicio" en `CalendarList`
  - Solo visible en móvil (`md:hidden`)
  - Aparece cuando `window.scrollY > 300` — usar `useEffect` + listener de scroll con cleanup
  - Al hacer click: `window.scrollTo({ top: 0, behavior: 'smooth' })`
  - Posición: `fixed bottom-6 right-6`
  - `data-testid="scroll-to-top-btn"`
  - Icono `ArrowUp` de lucide-react

- [x] Actualizar `CalendarPage` para usar el nuevo hook en rama móvil
  - En el bloque `block md:hidden`, usar `useCalendarInfinite` en lugar de `useCalendar`
  - Pasar `onLoadMore={fetchNextPage}`, `hasMore={hasNextPage}`, `isLoadingMore={isFetchingNextPage}` a `CalendarList`
  - El bloque `hidden md:block` (desktop) sigue usando `useCalendar` sin cambios

- [x] Verificar que los filtros existentes (eventType, departmentId) siguen funcionando en móvil después del cambio
