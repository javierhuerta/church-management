## 1. Backend — Endpoint publish-with-event

- [x] 1.1 Crear `PublishWithEventDto` en `backend/src/modules/worship-services/dto/program.dto.ts` con campo `createCalendarEvent: boolean`
- [x] 1.2 Agregar método `publishWithEvent(id, userId, dto)` en `ProgramService` usando transacción TypeORM explícita
- [x] 1.3 En el método, llamar a `CalendarService.create()` si `createCalendarEvent === true`, mapeando fecha y horario del primer grupo del programa
- [x] 1.4 Registrar entrada en audit log del programa con `action = "creó evento de calendario"` cuando se crea el evento
- [x] 1.5 Agregar endpoint `POST /worship-services/programs/:id/publish-with-event` en `ProgramController` con decoradores OpenAPI completos
- [x] 1.6 Importar `CalendarModule` en `WorshipServicesModule` para poder inyectar `CalendarService`
- [x] 1.7 Verificar que el guard de roles aplica igual que en el endpoint `publish` existente

## 2. API Client — Regenerar cliente OpenAPI

- [x] 2.1 Confirmar que el backend está corriendo (`lsof -ti:3000`)
- [x] 2.2 Ejecutar `npm run generate:api` desde `frontend/`
- [x] 2.3 Restaurar `src/lib/api/core/request.ts` si quedó vacío tras la regeneración (`git checkout src/lib/api/core/request.ts`)

## 3. Frontend — Componentes ProgramGroupCard y ProgramSectionRow

- [x] 3.1 Crear `frontend/src/features/worship-services/components/program-group-card.tsx` con variantes `MobileProgramGroupCard` y `DesktopProgramGroupCard` siguiendo el patrón mobile/desktop del design system
- [x] 3.2 `DesktopProgramGroupCard`: fila con drag handle, nombre en `text-lg font-semibold`, horario en `text-muted-foreground`, botones Editar y + Sección al hover, icono eliminar destructivo
- [x] 3.3 `MobileProgramGroupCard`: card con `rounded-xl border-border bg-card`, nombre prominente, horario en metadata, botones siempre visibles (no solo en hover)
- [x] 3.4 Crear `frontend/src/features/worship-services/components/program-section-row.tsx` con variantes `MobileProgramSectionRow` y `DesktopProgramSectionRow`
- [x] 3.5 `DesktopProgramSectionRow`: fila compacta con drag handle, nombre en uppercase `text-sm font-semibold`, hora a la izquierda, responsable como `text-muted-foreground`, acciones al hover
- [x] 3.6 `MobileProgramSectionRow`: card interna con nombre, hora y responsable visibles, botones de acción siempre visibles
- [x] 3.7 Aplicar colores del design system: `bg-card`, `border-border`, `text-foreground`, `text-muted-foreground` — sin colores hardcodeados

## 4. Frontend — Rediseño de program-detail-page

- [x] 4.1 Refactorizar el header de `program-detail-page.tsx`: badge de estado usando `STATUS_COLORS` pattern, fecha con tipografía Playfair Display inline, botones de acción aplicando los patrones de botón del design system
- [x] 4.2 Reemplazar el renderizado de grupos por el nuevo `ProgramGroupCard` manteniendo la lógica `@dnd-kit` intacta
- [x] 4.3 Reemplazar el renderizado de secciones por el nuevo `ProgramSectionRow` manteniendo la lógica `@dnd-kit` intacta
- [x] 4.4 Implementar layout desktop de dos columnas: editor ocupa 2/3 del ancho (`col-span-8`), historial ocupa 1/3 (`col-span-4`) con `sticky top-4`
- [x] 4.5 Implementar layout mobile: columna única, historial oculto detrás de tabs en la parte inferior (`md:hidden`)
- [x] 4.6 Agregar tabs mobile: "Programa" y "Historial" con patrón de tab navigation del design system
- [x] 4.7 Sustituir el `ConfirmDialog` de publicación por un nuevo dialog que incluye el checkbox "Crear evento en el calendario"

- [x] 5.1 Crear `frontend/src/features/worship-services/components/publish-with-event-dialog.tsx` con Checkbox de shadcn/ui y descripción del evento que se va a crear
- [x] 5.2 El checkbox muestra un preview del evento: "Se creará: [nombre template] · [fecha] · [hora inicio – hora fin]"
- [x] 5.3 Al confirmar, llamar al nuevo endpoint `publishWithEvent` del cliente generado con `createCalendarEvent: boolean`
- [x] 5.4 Mostrar toast de éxito: si se creó evento, incluir link "Ver evento →" con `navigate(/calendario/:slug/editar)`; si no, toast estándar
- [x] 5.5 Agregar hook `usePublishWithEvent` en `use-worship-services.ts` usando TanStack Query mutation

- [x] 6.1 Agregar agrupación por fecha en `program-change-history.tsx`: `reduce` sobre los logs para agrupar entradas del mismo día, separadores visuales con el patrón de `calendar-list` (línea horizontal + texto de fecha centrado)
- [x] 6.2 Agregar selector de filtro por tipo de acción: dropdown o conjunto de pills con opciones "Todo / Creación / Ediciones / Publicaciones / Eliminaciones"
- [x] 6.3 Implementar filtrado cliente: función que filtra los logs según la categoría seleccionada usando matching parcial en el campo `action`
- [x] 6.4 Reemplazar badges de acción por el patrón `STATUS_COLORS` del design system: creación→teal, eliminación→destructive, publicación/archivado→primary, edición→muted
- [x] 6.5 Corregir dark mode: asegurar que todos los colores usan `isDark` + `useTheme()` con `resolvedTheme`, eliminar colores hardcodeados que no respetan el tema
- [x] 6.6 Eliminar el campo de búsqueda de texto libre (reemplazado por el filtro por tipo)

## 7. Verificación y QA

- [x] 7.1 Verificar que el drag-and-drop de grupos y secciones sigue funcionando tras el refactor visual
- [x] 7.2 Verificar el flujo completo de publicación con evento: programa DRAFT → publicar con checkbox → toast con link → evento DRAFT en `/calendario/:slug/editar`
- [x] 7.3 Verificar el flujo de publicación sin evento: comportamiento idéntico al anterior
- [x] 7.4 Verificar historial en desktop: agrupación por fecha, filtros, dark mode correcto
- [x] 7.5 Verificar historial en mobile: accesible desde tab "Historial", sin sidebar visible
- [x] 7.6 Verificar que el build de TypeScript no tiene errores (`npm run build` desde `frontend/`)
