## Context

El frontend (React + Vite + shadcn/ui + Tailwind) tiene 5 campos de fecha repartidos en 4 archivos, todos usando inputs nativos:

| Sitio | Tipo | Binding actual | Formato |
|---|---|---|---|
| `program-create-page.tsx:220` | `date` | RHF `register('date')` | `YYYY-MM-DD` |
| `program-detail-page.tsx:200` | `date` | no controlado, `onChange`→API | `YYYY-MM-DD` |
| `programs-list-page.tsx:124-135` | `date` ×2 | `useState` filtros (`dateFrom`/`dateTo`) | `YYYY-MM-DD` |
| `event-form.tsx:193-205` | `datetime-local` ×2 | RHF `register` | `YYYY-MM-DDTHH:mm` |

Constraints:
- shadcn ya configurado (`components.json`, estilo new-york, alias `@/* → src/*`). `Popover` existe en `src/components/ui/popover.tsx`. `date-fns ^4.1.0` instalado. `react-day-picker` NO instalado, `calendar.tsx` NO existe.
- Los formularios usan react-hook-form. Existe precedente de integración vía `Controller` (ej. `WysiwygEditor` y `Select` en `event-form.tsx`).
- El backend espera strings; no cambia ningún contrato REST.
- Existe carpeta muerta `frontend/@/components/ui` (el alias resuelve a `src/`).

## Goals / Non-Goals

**Goals:**
- Un único punto de serialización fecha↔string que elimine el bug de zona horaria.
- Tres componentes reutilizables con API homogénea basada en strings.
- Migración de los 5 sitios sin cambiar contratos de API ni validaciones.
- Localización en español consistente con el uso existente de `date-fns/locale/es`.

**Non-Goals:**
- Soporte multi-timezone o selección de zona horaria por usuario.
- Rediseño de formularios o cambio de reglas de validación.
- Eliminar la carpeta `frontend/@/components` (solo verificar que no interfiera).

## Decisions

### D1: API basada en strings, no en `Date`

Los componentes exponen `value: string` y `onChange(value: string)`. El `Date` solo existe internamente entre el `<Calendar>` y la frontera de (de)serialización. Razón: todos los consumidores (RHF, filtros, API) ya trabajan con strings; exponer `Date` obligaría a convertir en cada call site y reintroduciría el bug de TZ disperso.

- `DatePicker` / `DateRangePicker`: `YYYY-MM-DD`.
- `DateTimePicker`: `YYYY-MM-DDTHH:mm`.

Alternativa descartada: API basada en `Date` (más "idiomática" para react-day-picker) — rechazada porque traslada la complejidad de TZ a cada consumidor.

### D2: Serialización TZ-safe con date-fns, sin `new Date(string)`

Parseo: `parse(value, 'yyyy-MM-dd', new Date())` (o `parseISO` para datetime). Formateo de salida: `format(date, 'yyyy-MM-dd')`. **Nunca** `new Date('2026-05-15')` ni `.toISOString()` para fechas sin hora, porque interpretan/emiten en UTC y desplazan el día en UTC-3/-4. Toda fecha se trata como fecha "local de pared". Un helper compartido (`lib/date.ts` o interno a los componentes) centraliza estas conversiones.

### D3: Integración con react-hook-form vía `Controller`

Un DatePicker shadcn es controlado y no emite evento DOM nativo, por lo que `register()` deja de funcionar. Cada formulario migra a `<Controller control={control} name=... render={({field}) => <DatePicker value={field.value} onChange={field.onChange} />} />`. Sigue el patrón ya usado para `WysiwygEditor`/`Select` en `event-form.tsx`. No se tocan los schemas de validación (los valores siguen siendo strings con el mismo formato).

### D4: `DateTimePicker` = Calendar + input de hora separado

react-day-picker es solo fecha. El `DateTimePicker` compone el `<Calendar>` con un control de hora (input `time` o selects HH/mm) dentro del mismo popover. Al cambiar fecha u hora se recompone el string `YYYY-MM-DDTHH:mm`. Alternativa descartada: librería de datetime de terceros — innecesaria, agrega peso y rompe consistencia visual con shadcn.

### D5: `DateRangePicker` con `mode="range"`

Un solo popover usando `react-day-picker` `mode="range"`, que entrega `{ from?: Date; to?: Date }`. El componente lo serializa a `{ from: string; to: string }`. En `programs-list-page.tsx` reemplaza los dos inputs por un control; el estado de filtros (`dateFrom`/`dateTo`) se mantiene igual a nivel de hook/API. Cambio de UX deliberado (decidido en explore).

### D6: Componente base `calendar.tsx` estándar shadcn

Se añade `react-day-picker` y se crea `ui/calendar.tsx` con la implementación oficial de shadcn (estilo new-york, locale `es` por defecto), sobre el `Popover` existente. Los tres pickers lo consumen; no se reimplementa el calendario.

## Risks / Trade-offs

- **Bug de zona horaria reintroducido por descuido** → D2 centraliza toda conversión en un helper; revisión específica de que no quede ningún `new Date(string)`/`toISOString()` en los call sites migrados.
- **Migrar `register`→`Controller` rompe la validación o el estado del form** → No se cambian schemas; se verifica que cada form siga enviando el mismo string. Migrar y probar form por form.
- **Cambio de UX en filtros (dos campos → rango)** → Aceptado y decidido en explore; documentado como BREAKING de UX en la propuesta.
- **`react-day-picker` exige versión de `date-fns` compatible** → Verificar peer deps al instalar; `date-fns ^4` es reciente, confirmar que la versión de react-day-picker elegida lo soporte (o fijar versión compatible).
- **Edición inline en `program-detail-page` dispara API en cada cambio** → Conservar exactamente la semántica actual (`onChange`→llamada al servicio); solo cambia el control, no el flujo.
- **Carpeta `@/components` duplicada confunde imports** → Verificar resolución de alias; no eliminarla en este cambio, solo confirmar que los nuevos componentes viven en `src/components/ui`.

## Migration Plan

1. Instalar `react-day-picker` (versión compatible con `date-fns ^4`).
2. Crear `ui/calendar.tsx` + helper de fechas.
3. Crear `DatePicker`, `DateTimePicker`, `DateRangePicker` con tests/uso manual.
4. Migrar sitio por sitio (orden de menor a mayor riesgo): `program-create` → `program-detail` → `programs-list` → `event-form`. Verificar cada uno (TZ, validación, envío a API) antes del siguiente.
5. Build + smoke test de los 4 flujos.

Rollback: cada migración de sitio es un cambio aislado y reversible al input nativo previo; los componentes nuevos son aditivos y no rompen nada si no se usan.

## Open Questions

- Versión exacta de `react-day-picker` compatible con `date-fns ^4.1.0` (resolver al instalar).
- Para `DateTimePicker`: ¿granularidad de minutos libre o en pasos (ej. 5/15 min)? Por defecto: libre, salvo indicación.
