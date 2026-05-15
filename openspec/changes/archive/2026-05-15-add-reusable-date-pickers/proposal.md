## Why

Hoy cada campo de fecha del frontend usa un `<input type="date">` o `type="datetime-local"` nativo, copiado caso por caso (creación de programa, edición inline, filtros, formulario de eventos). Esto produce UX inconsistente, depende del datepicker nativo del navegador (no localizado, distinto en cada SO) y arrastra un riesgo real de zona horaria: las fechas viajan como string `YYYY-MM-DD` pero `new Date('YYYY-MM-DD')` se interpreta como UTC, lo que en Chile (UTC-3/-4) puede mostrar o guardar el día anterior. No hay un punto único que encapsule la serialización fecha↔string.

## What Changes

- Se agrega la dependencia `react-day-picker` y el componente base `ui/calendar.tsx` (estándar shadcn, estilo new-york), apoyado en el `Popover` ya existente.
- Se crean tres componentes reutilizables en `frontend/src/components/ui`, todos con API basada en strings (`value: string` / `onChange(value: string)`) para no romper los contratos con el backend:
  - `DatePicker`: fecha sola, formato `YYYY-MM-DD`.
  - `DateTimePicker`: fecha + hora (Calendar + selector de hora), formato `YYYY-MM-DDTHH:mm`.
  - `DateRangePicker`: un solo popover con `react-day-picker` en `mode="range"`, produce `{ from, to }` como strings `YYYY-MM-DD`.
- Los tres componentes encapsulan el parseo/formateo con `date-fns` y locale `es`, sin exponer nunca un `Date` crudo, eliminando el bug de zona horaria de raíz.
- Se migran los 5 sitios con inputs de fecha nativos a estos componentes:
  - `program-create-page.tsx` (RHF `register` → `Controller` + `DatePicker`)
  - `program-detail-page.tsx` (edición inline no controlada → `DatePicker` controlado, conserva `onChange`→API)
  - `programs-list-page.tsx` (dos inputs `dateFrom`/`dateTo` → un `DateRangePicker`) — **BREAKING** de UX: el filtro pasa de dos campos a un selector de rango único.
  - `event-form.tsx` (dos `datetime-local` → `Controller` + `DateTimePicker`)
- Limpieza menor: se verifica que la carpeta duplicada `frontend/@/components/ui` (código muerto; el alias `@/*` apunta a `src/*`) no interfiera.

## Capabilities

### New Capabilities
- `date-picker-components`: Componentes de UI reutilizables (`DatePicker`, `DateTimePicker`, `DateRangePicker`) para selección de fechas, con API basada en strings, localización en español y manejo correcto de zona horaria. Integrables con react-hook-form vía `Controller`.

### Modified Capabilities
- `worship-program-filters`: el filtro de rango de fechas cambia de dos campos de fecha independientes a un único selector de rango (`DateRangePicker`).

## Impact

- **Frontend solamente.** No afecta backend, API, DTOs ni roles/permisos.
- **Módulo NestJS afectado:** ninguno (cambio exclusivo de UI; los contratos REST se mantienen, las fechas siguen viajando como string).
- Dependencia nueva: `react-day-picker` (`date-fns` ya está instalado).
- Archivos nuevos: `ui/calendar.tsx`, `ui/date-picker.tsx`, `ui/date-time-picker.tsx`, `ui/date-range-picker.tsx`.
- Archivos modificados: `program-create-page.tsx`, `program-detail-page.tsx`, `programs-list-page.tsx`, `event-form.tsx`.
- Cambio de UX en filtros de programas de culto (de dos campos a rango único).

## Fuera del alcance

- No se modifica ningún endpoint, DTO ni entidad del backend.
- No se cambian formatos de almacenamiento ni el contrato de la API (las fechas siguen siendo strings `YYYY-MM-DD` / `YYYY-MM-DDTHH:mm`).
- No se introduce manejo de zonas horarias multi-región ni selección de timezone por usuario; solo se corrige el bug local de parseo UTC.
- No se rediseñan los formularios ni se cambian sus validaciones (solo el control de fecha).
- La eliminación definitiva de la carpeta `frontend/@/components` no es parte de este cambio (solo se verifica que no interfiera).
