## Context

El sistema ya usa `@react-pdf/renderer` para generar PDFs de programas de culto. El PDF del calendario mensual debe seguir el mismo patrón, reutilizando la infraestructura existente.

**Estado actual:**
- `useProgramPdf` hook en frontend
- `ProgramPdfDocument` componente en `worship-services/components`
- `CalendarGrid` en frontend muestra grid mensual con multi-day events

**Restricciones:**
- Client-side generation (no backend)
- Solo mes completo
- Aplicar filtros de la pantalla actual

## Goals / Non-Goals

**Goals:**
- Generar PDF del calendario mensual con grid visual
- Mostrar multi-day events como bandas horizontales
- Aplicar filtros activos (department, eventType, includeDrafts)
- Incluir página adicional con listado completo si hay overflow
- Reutilizar logo SVG de ProgramPdfDocument

**Non-Goals:**
- Backend PDF generation
- Custom date ranges
- Programación de envío automático

## Decisions

### 1. Estructura del PDF

**Decisión:** 1-2 páginas:
- Página 1: Grid mensual con eventos
- Página 2 (opcional): Listado completo si hay overflow

**Alternativas:**
- Solo grid: lose detail cuando hay muchos eventos
- Grid + listado siempre: más páginas pero más útil

### 2. Multi-day Events

**Decisión:** Banda horizontal que cruza columnas (igual que CalendarGrid)

**Alternativas:**
- Solo día inicio: pierdo información
- Banda horizontal: mismo comportamiento que web

### 3. Overflow handling

**Decisión:** Truncar a 2-3 eventos por día en grid + página 2 con todos los eventos

### 4. Logo

**Decisión:** Reutilizar `ChurchLogoPlaceholder` SVG de `ProgramPdfDocument`

### 5. Filtros del calendario

Los filtros actuales son:
- `department?: Department`
- `eventType?: EventType`
- `includeDrafts?: boolean`

Se pasan al hook `useCalendarPdf(currentMonth, events, filters)` y se incluyen en el PDF como metadata.

## Component Structure

```
frontend/src/features/calendar/
├── hooks/
│   └── use-calendar-pdf.ts       # Nuevo: hook para generar PDF
├── components/
│   └── calendar-pdf-document.tsx # Nuevo: documento PDF (reutiliza ChurchLogoPlaceholder)
```

## PDF Layout

```
┌─────────────────────────────────────────────────────────────┐
│                        HEADER                                │
│  [LOGO]  Iglesia Adventista del Séptimo Día                 │
│          Osorno Central                                     │
│          Mayo 2026                                          │
│  Filtros: Dept. Jóvenes | Tipo: Todos | Incluir borradores  │
├─────────────────────────────────────────────────────────────┤
│  Dom  Lun  Mar  Mié  Jue  Vie  Sáb                          │
│  ┌───┬───┬───┬───┬───┬───┬───┐                            │
│  │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │  ...celdas con eventos      │
│  ├───┼───┼───┼───┼───┼───┼───┤                            │
│  │   │EV └───────────────│   │  ← multi-day band           │
│  └───┴───┴───┴───┴───┴───┴───┘                            │
└─────────────────────────────────────────────────────────────┘
```

## API / Datos

No hay cambios en backend. El frontend ya tiene los datos de eventos.

```typescript
// hook signature
async function downloadCalendarPdf(
  currentMonth: Date,
  events: EventResponseDto[],
  filters: { department?: Department; eventType?: EventType; includeDrafts?: boolean }
)
```