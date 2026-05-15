## 1. Dependencias y base

- [x] 1.1 Instalar `react-day-picker` en `frontend` con una versión compatible con `date-fns ^4.1.0` (verificar peer deps)
- [x] 1.2 Crear `frontend/src/components/ui/calendar.tsx` con la implementación estándar shadcn (estilo new-york), locale `es` por defecto, sobre el `Popover` existente
- [x] 1.3 Crear helper de fechas TZ-safe (parse/format con `date-fns`, sin `new Date(string)` ni `.toISOString()` para fechas sin hora)
- [x] 1.4 Verificar que la carpeta duplicada `frontend/@/components/ui` no interfiera con la resolución del alias `@/* → src/*`

## 2. Componentes reutilizables

- [x] 2.1 Implementar `ui/date-picker.tsx` (`value: string` `YYYY-MM-DD` / `onChange(string)`, placeholder, cierre al seleccionar, locale es)
- [x] 2.2 Implementar `ui/date-time-picker.tsx` (Calendar + control de hora en el mismo popover, formato `YYYY-MM-DDTHH:mm`, preserva hora al cambiar día)
- [x] 2.3 Implementar `ui/date-range-picker.tsx` (`react-day-picker` `mode="range"`, API `{ from: string; to: string }`, soporta rango parcial y limpiar)
- [x] 2.4 Verificar round-trip TZ-safe de los tres componentes en una zona horaria UTC-4 (sin off-by-one)

## 3. Migración de sitios (orden por riesgo)

- [x] 3.1 `program-create-page.tsx`: migrar `register('date')` a `Controller` + `DatePicker`; confirmar que el form envía el mismo string y la validación sigue operando
- [x] 3.2 `program-detail-page.tsx`: reemplazar input inline por `DatePicker` controlado conservando la semántica `onChange`→llamada al servicio
- [x] 3.3 `programs-list-page.tsx`: reemplazar los dos inputs `dateFrom`/`dateTo` por un `DateRangePicker`, manteniendo el contrato del estado de filtros (`from`/`to` strings, ambos opcionales)
- [x] 3.4 `event-form.tsx`: migrar los dos `datetime-local` (`startDate`/`endDate`) a `Controller` + `DateTimePicker` sin cambiar el schema de validación

## 4. Verificación

- [x] 4.1 `npm run build` (o typecheck) del frontend sin errores
- [ ] 4.2 Smoke test manual de los 4 flujos: crear programa, editar fecha inline, filtrar por rango, crear/editar evento con fecha+hora
- [x] 4.3 Confirmar que ningún call site migrado usa `new Date(string)`/`.toISOString()` para fechas sin hora
- [x] 4.4 `openspec validate add-reusable-date-pickers --strict`
