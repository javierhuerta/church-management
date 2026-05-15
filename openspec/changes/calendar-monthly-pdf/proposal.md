## Why

Los usuarios necesitan una forma de descargar el calendario mensual en formato PDF para tener una copia impresa o compartirlo. El sistema ya tiene infraestructura de PDF con `@react-pdf/renderer` (usado para programas de culto), pero no existe esta funcionalidad para el calendario.

## What Changes

- **Nuevo documento PDF**: Grid de calendario mensual con la misma apariencia visual de la página web
- **Boton de descarga** en la página de calendario
- **Filtros aplicados**: Department, event type, include drafts según los filtros activos en pantalla
- **Multi-day events**: Mostrados como bandas horizontales (igual que la vista web)
- **Overflow**: Si hay muchos eventos por día, truncar a 2-3 y agregar página adicional con listado completo

## Capabilities

### New Capabilities

- `calendar-monthly-pdf`: Generación de PDF del calendario mensual con filtros aplicados

### Modified Capabilities

- `calendar`: No cambia requisitos, se agrega capacidad de exportar a PDF
- `worship-program-pdf`: No cambia, pero reutiliza patrones de implementación

## Impact

- **Frontend**: Nuevo componente `CalendarPdfDocument` + hook `useCalendarPdf`, botón en `CalendarPage`
- **Backend**: Ninguno (client-side generation)
- **Dependencias**: Reutiliza `@react-pdf/renderer` existente

## Out of Scope

- Backend PDF generation
- Rango de fechas custom (mes completo únicamente)
- Envío de PDF por email
- Programación de generación automática