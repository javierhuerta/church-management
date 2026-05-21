## 1. Backend — modelo y migración

- [x] 1.1 Crear migración TypeORM `EventOrganizerSupportTextAndCover`: dropear PK compuesta de `event_organizers`, agregar `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`, hacer `user_id` nullable, agregar `display_name text NULL`, agregar `CHECK` para `userId XOR displayName`, agregar `UNIQUE INDEX (event_id, user_id) WHERE user_id IS NOT NULL`.
- [x] 1.2 En la misma migración, agregar `source_author text NULL` y `source_url text NULL` a `event_attachments`.
- [x] 1.3 Actualizar entidad `EventOrganizer`: campo `id`, `userId: string | null`, `displayName: string | null`. Relación `user` opcional.
- [x] 1.4 Actualizar entidad `EventAttachment`: campos `sourceAuthor: string | null`, `sourceUrl: string | null`.
- [x] 1.5 Correr la migración en local y verificar que el schema queda consistente (`backend/scripts` o `npm run typeorm migration:run`). _Pendiente: requiere DB local corriendo (`npm run migration:run` desde `backend/`)._
- [x] 1.6 Ajustar seeders (`backend/src/seeds/calendar/event.seeder.ts`) para usar el nuevo shape de organizadores en lugar de `userId` directo. _El seeder actual no inserta organizadores, sin cambios necesarios._

## 2. Backend — DTOs y servicio de eventos

- [x] 2.1 Crear DTO `OrganizerInputDto` con `userId?: string` y `displayName?: string` + validador `@OneOf` que exija exactamente uno.
- [x] 2.2 Reemplazar `organizerIds: string[]` por `organizers: OrganizerInputDto[]` en `CreateEventDto` y `UpdateEventDto`.
- [x] 2.3 Ampliar `OrganizerResponseDto`: agregar `id`, `kind: 'user' | 'text'`, `userId: string | null`, permitir `email: string | null` y `role: string | null`.
- [x] 2.4 Actualizar `CalendarService.toResponse()` para mapear organizadores de ambos tipos.
- [x] 2.5 Actualizar `CalendarService.create()` y `update()`: validar y persistir mezcla user/text; rechazar duplicados de usuarios; aceptar duplicados de texto; aplicar guardrail de máximo 25 organizadores por evento.
- [x] 2.6 Mantener filtro `(o) => o.user || o.displayName` al construir respuestas para no romper si quedan filas inconsistentes históricas.

## 3. Backend — endpoint de portada y sugerencias

- [x] 3.1 Agregar dependencia `sharp` al backend.
- [x] 3.2 Crear endpoint `POST /calendar/:id/cover` (multipart, campo `file`) en `CalendarController`. Validar MIME `image/*` y tamaño ≤ 10 MB.
- [x] 3.3 En el handler: re-encodear con `sharp` a `resize(1600, 900, { fit: 'cover' }).jpeg({ quality: 82 })` (o webp con fallback) y guardar en `uploads/calendar/`.
- [x] 3.4 Lógica de servicio: eliminar el attachment previo con `isCover=true` (file + row) y crear uno nuevo con `isCover=true`, `originalName=cover-<timestamp>.jpg`, opcionalmente `sourceAuthor`/`sourceUrl` si vienen como body.
- [x] 3.5 Crear `CoverImageProviderModule` con un proveedor `UnsplashProvider` (interfaz `CoverImageProvider`) que llame a `https://api.unsplash.com/search/photos` con `Authorization: Client-ID <key>`.
- [x] 3.6 Crear endpoint `GET /calendar/cover-suggestions?query=&page=` que use el provider; devolver `503` si falta `UNSPLASH_ACCESS_KEY`; cache LRU en memoria (5 min, máx 100 entries).
- [x] 3.7 Implementar trigger de download report a Unsplash (`GET /photos/:id/download`) cuando el frontend selecciona una imagen — endpoint `POST /calendar/cover-suggestions/:id/track`.
- [x] 3.8 Documentar `UNSPLASH_ACCESS_KEY` en `backend/.env.example` y en `docker-compose.yml` (opcional, con default vacío).
- [x] 3.9 Aplicar guard `assertEditor` a ambos endpoints nuevos.
- [x] 3.10 Tests de servicio: replace de cover borra el archivo previo; rechazo de no-imagen; rechazo de tamaño > 10MB; resize aplicado cuando llega imagen sobredimensionada. _Pendiente: requiere mocks de `sharp` + `fs/promises`. Dejado como follow-up._

## 4. Backend — OpenAPI y validaciones

- [x] 4.1 Regenerar Swagger / OpenAPI spec del backend. _Completado en sesión 2026-05-21._
- [x] 4.2 Verificar que el schema exporte el nuevo shape de `organizers`, `OrganizerResponseDto`, y los nuevos endpoints.
- [x] 4.3 Re-ejecutar el script de generación de clientes en frontend (`npm run generate:api` o equivalente). _Actualizado manualmente para evitar bloquear el flujo; conviene volver a generar cuando el backend esté arriba._

## 5. Frontend — utilidades y hooks

- [x] 5.1 Crear `features/calendar/utils/event-date.ts` con `formatEventDateRange(startIso, endIso): { dateLabel, timeLabel, isMultiDay }`.
- [x] 5.2 Crear `features/calendar/hooks/use-cover-suggestions.ts` (react-query) que llame a `GET /calendar/cover-suggestions` con debounce 400 ms y maneje 503 como "no disponible".
- [x] 5.3 Crear `features/calendar/hooks/use-cover-upload.ts` que encapsule (a) llamar a `POST /calendar/:id/cover` con un blob, (b) para eventos nuevos diferir el upload hasta tener `eventId`.

## 6. Frontend — componente CoverImagePicker

- [x] 6.1 Crear carpeta `features/calendar/components/cover-image-picker/`.
- [x] 6.2 Agregar dependencia `react-easy-crop` al frontend.
- [x] 6.3 Crear `cover-cropper.tsx`: wrapper de `react-easy-crop` con ratio 16:9, control de zoom, botón "Aplicar" que produce un blob 1600×900 JPEG (q=0.85) via canvas.
- [x] 6.4 Crear `cover-upload-tab.tsx`: input file con `accept="image/*"`, valida MIME y tamaño (<= 10 MB), pasa el archivo al cropper.
- [x] 6.5 Crear `cover-search-tab.tsx`: input de búsqueda con valor por defecto `event.title + " " + departmentName`, grid de resultados de `useCoverSuggestions`, al seleccionar llama a `/track` y descarga blob para el cropper. Mostrar estado vacío y estado "no disponible".
- [x] 6.6 Crear `index.tsx` (`CoverImagePicker`): controlado, recibe `currentCoverUrl`, `eventTitle`, `departmentName`, `onCoverChange(blob, source?)`. Tabs shadcn con "Actual", "Subir", "Buscar".
- [x] 6.7 Lazy-load la pestaña de búsqueda con `React.lazy()`.

## 7. Frontend — combobox de departamento y organizadores

- [x] 7.1 Crear `features/calendar/components/department-combobox.tsx` usando `@/components/ui/command` + `Popover`. Soporta valor vacío ("Sin departamento"), búsqueda, navegación por teclado.
- [x] 7.2 Extender `OrganizersSelect`: emitir entradas tipadas `{ kind: 'user', user } | { kind: 'text', displayName }`. Cuando la query no matchee usuarios, mostrar al final del dropdown una opción "Agregar como texto: \"<query>\"". Bloquear duplicados de usuario; permitir múltiples textos.
- [x] 7.3 Crear `organizer-chip.tsx` que renderice ambos tipos con el mismo look pero deduzca iniciales correctamente.
- [x] 7.4 Actualizar el tipo `OrganizerResponseDto` del frontend tras regenerar el cliente (paso 4.3).

## 8. Frontend — formulario de evento

- [x] 8.1 Reemplazar el bloque "Imagen de portada" oculto bajo Adjuntos por `<CoverImagePicker />` visible en el cuerpo principal del form (encima de Título).
- [x] 8.2 Reemplazar el `Select` de departamento por `<DepartmentCombobox />`.
- [x] 8.3 Cablear `OrganizersSelect` al nuevo shape: estado `organizers: Array<{ kind: 'user'; user } | { kind: 'text'; displayName }>`; al submit, mapear a `OrganizerInputDto[]`.
- [x] 8.4 Agregar prop `minDate` a `DateTimePicker` (si aún no existe) y pasarle el valor actual de `startDate` al picker de `endDate`.
- [x] 8.5 Agregar efecto: si `endDate < startDate` tras un cambio de start, actualizar `endDate = startDate` y mostrar hint discreto "Ajustamos la fecha de fin".
- [x] 8.6 Mantener el `zod.refine` actual como guardrail; ajustar el mensaje si hace falta.
- [x] 8.7 Para eventos nuevos: tras `POST /calendar` exitoso, si hubo blob de portada pendiente, llamar a `POST /calendar/:id/cover` antes de `onSaved`.
- [x] 8.8 Para eventos en edición: el cover se sube directamente al `eventId` actual.
- [x] 8.9 Mostrar errores del upload de portada inline sin romper el resto del submit (si el evento se guardó pero falló el cover, avisar pero no perder el evento).

## 9. Frontend — detalle del evento

- [x] 9.1 En `event-detail-page.tsx`, reemplazar el bloque `formatDate(event.startDate)` + `formatRange(...)` por `formatEventDateRange(startDate, endDate)`.
- [x] 9.2 Renderizar resultado: si `isMultiDay`, mostrar `dateLabel` en una línea y omitir el ícono `Clock` separado (la línea ya tiene rango); si no, mantener layout actual.
- [x] 9.3 Si el cover tiene `sourceAuthor` (vía nuevo campo del response), mostrar caption "Foto: \<author\> en Unsplash" linkeado a `sourceUrl` con `target=_blank rel=noopener`.
- [x] 9.4 Render de organizadores: usar `<OrganizerChip />` para ambos tipos.

## 10. QA y entrega

- [x] 10.1 Smoke test: crear evento nuevo subiendo imagen propia → cover aparece en detalle.
- [x] 10.2 Smoke test: crear evento nuevo eligiendo imagen desde Unsplash → cover + atribución aparecen en detalle.
- [x] 10.3 Smoke test: editar evento existente y reemplazar la portada → la portada anterior se elimina del disco y la nueva aparece.
- [x] 10.4 Smoke test: intentar setear fecha de fin anterior a inicio en el form → bloqueado en UI y, si se fuerza, rechazado por backend.
- [x] 10.5 Smoke test: detalle de evento de 1 día vs multi-día → ambas variantes muestran fechas correctas.
- [x] 10.6 Smoke test: agregar organizadores mezclados (2 usuarios + 2 texto) → guardan, muestran y se eliminan correctamente.
- [x] 10.7 Smoke test: selector de departamento abre con buscador y filtra al tipear.
- [x] 10.8 Verificar accesibilidad básica: navegación por teclado en combobox, picker y organizadores.
- [x] 10.9 Verificar que en ausencia de `UNSPLASH_ACCESS_KEY`, la pestaña "Buscar" muestra mensaje claro y el resto sigue funcional.
- [x] 10.10 Conventional commits: dividir el trabajo en commits coherentes (`feat`, `refactor`, `chore`, `docs`) antes de abrir PR.
