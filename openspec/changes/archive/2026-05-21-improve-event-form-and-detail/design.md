## Context

El módulo `calendar` ya existe y maneja eventos con un modelo de adjuntos donde uno puede ser marcado `isCover=true`. La portada hoy:
- Se elige indirectamente desde la pestaña de adjuntos (no aparece en el cuerpo principal del formulario).
- Si no hay adjunto-portada, el backend devuelve una imagen genérica de Unsplash hard-codeada por `EventType` (`defaultCoverForType`).

El `EventOrganizer` actual tiene PK compuesta `(event_id, user_id)` con `user_id NOT NULL`, lo que impide organizadores que no sean usuarios. El formulario está concentrado en `event-form.tsx` (~350 LOC) — el usuario explícitamente pidió no centralizar más código allí.

`DateTimePicker` ya existe (`@/components/ui/date-time-picker`) y se reutiliza en otros features (existe `feedback_typeorm_entities`-style guideline: la app ya tiene este componente, no inventar uno nuevo).

Stakeholders: editores (Pastor, Secretaria, Admin) que crean ~varios eventos/mes y necesitan rapidez; lectores anónimos que ven el detalle compartido por link.

## Goals / Non-Goals

**Goals:**
- Subir/elegir/sugerir imagen de portada **desde el formulario principal**, no escondido bajo adjuntos.
- Imagen resultante con dimensiones y peso adecuados para la UI (1600×900, < 400 KB típico).
- Validación de rango de fechas en el control mismo (UX) además de `zod` (guardrail).
- Modelar organizadores como una mezcla de usuarios y texto libre sin romper el listado actual.
- Hacer la selección de departamento navegable por teclado y rápida cuando crezca la lista.
- Cada nueva pieza queda como componente React aislado, testeable y reutilizable.

**Non-Goals:**
- Convertir organizadores-texto en usuarios automáticamente cuando se den de alta.
- Edición avanzada de imagen (filtros, texto, marca de agua).
- Soportar varios proveedores de imagen además de Unsplash. La interfaz queda abierta a extender, pero v1 sólo trae uno.
- Reescribir el sistema de attachments. La portada sigue siendo, conceptualmente, un attachment marcado.

## Decisions

### D1. La portada sigue siendo un attachment con `isCover=true`, no una columna nueva en `events`
**Alternativas:**
- (A) Agregar columna `cover_image_url` o `cover_attachment_id` a `events`.
- (B) Mantener el modelo actual y exponer un nuevo endpoint dedicado de portada.

**Decisión: (B).**
**Por qué:** El modelo actual ya funciona — `toResponse()` ya emite `coverImageUrl` derivado del attachment marcado. Reaprovecha `safeUnlink` y la lógica de cascada. Agregar columnas duplicaría estado y arriesga inconsistencia. El nuevo endpoint `POST /calendar/:id/cover` simplemente: (1) borra cualquier attachment previo con `isCover=true` y `mimeType` empezando por `image/uploaded-cover-`, (2) guarda el archivo nuevo como attachment, (3) marca `isCover=true`.

Nota: para distinguir "portadas subidas por la UI nueva" de "imagen adjuntada que el usuario marcó como portada", usamos `originalName` con prefijo convención `cover-<timestamp>.<ext>` y `isCover=true`. Si en el futuro queremos separar, agregamos un enum `attachment_role` — fuera de scope hoy.

### D2. Sugerencias de imagen vía Unsplash API proxied por el backend
**Alternativas:**
- (A) Llamada directa Unsplash desde el frontend con `Access Key` público.
- (B) Proxy desde NestJS guardando el `Access Key` en backend.
- (C) Pexels en vez de Unsplash.

**Decisión: (B).**
**Por qué:** Unsplash exige que la `Access Key` no se exponga en clientes públicos. El proxy también permite cachear resultados, filtrar respuestas, y centralizar el "fallback a sin imagen" si el servicio cae. Pexels queda como follow-up (su API es similar; la abstracción interna `CoverImageProvider` permite agregarlo después).

Endpoint: `GET /calendar/cover-suggestions?query=string&page=1` → `{ results: Array<{ id, thumbUrl, fullUrl, downloadUrl, author, authorUrl, color }>, total }`.

**Flujo de selección:**
1. Usuario abre pestaña "Buscar" en `CoverImagePicker`.
2. Query inicial = `event.title + " " + departmentName` (sanitizada).
3. Click en una sugerencia → frontend hace `fetch(fullUrl)` → blob → carga en cropper.
4. Tras cropear → `POST /calendar/:id/cover` con el blob (multipart). Para eventos *nuevos*, el blob se guarda en memoria del form y se sube tras el `POST /calendar` inicial.

**Tracking attribution:** Unsplash exige reportar download trigger. El backend reenvía `GET /photos/:id/download` tras servir un blob. Guardamos `author` y `authorUrl` como columnas opcionales en el attachment (`source_author`, `source_url`) para acreditar en el detalle si la imagen vino del proveedor.

### D3. Recorte y compresión en el cliente, con resize defensivo en server
**Alternativas:**
- (A) Crop + resize 100% en cliente (canvas + `react-easy-crop`).
- (B) Crop en cliente, resize/optimize en servidor con `sharp`.
- (C) Sólo servidor (subir original, el servidor recorta).

**Decisión: (A) + (B) defensivo.**
**Por qué:** Crop interactivo (drag, zoom, ratio fijo 16:9) sólo se hace bien en el cliente. La compresión cliente reduce tiempo de upload. Para protegerse de blobs gigantes o malformados, `sharp` re-optimiza server-side a max 1600×900, calidad 80, WebP con fallback JPEG; si el resultado es más chico que el original, se usa el procesado. Esto también centraliza la política sin confiar en el cliente.

**Librerías:**
- Frontend: `react-easy-crop` (recorte/zoom con ratio fijo) + `canvas.toBlob` para exportar. Sin `browser-image-compression`; `toBlob('image/jpeg', 0.85)` es suficiente.
- Backend: `sharp` (ya popular en NestJS, sin dependencias nativas problemáticas en Docker base).

### D4. Modelo de organizadores: PK compuesta vuelve a ser una sola columna `id`
**Alternativas:**
- (A) Mantener PK `(event_id, user_id)` y agregar `display_name`, dejando `user_id` nullable → varias filas con mismo `event_id` y `user_id NULL` colisionarían en PK.
- (B) Cambiar PK a `id uuid` autogenerado y dejar `(event_id, user_id)` como índice único parcial cuando `user_id IS NOT NULL`.
- (C) Generar `user_id` falso para texto (UUIDs únicos) — frágil.

**Decisión: (B).**
**Por qué:** Es la opción ortodoxa con TypeORM y mantiene la invariante "un usuario no puede aparecer dos veces como organizador del mismo evento". Permite N entradas de texto libre por evento, cada una con su propio `display_name`. La migración:
1. Agregar columna `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` (drop PK compuesta antes).
2. Hacer `user_id` nullable.
3. Agregar `display_name text NULL`.
4. Crear índice único parcial `(event_id, user_id) WHERE user_id IS NOT NULL`.
5. Validar en service: `userId XOR displayName` (exactamente uno).

### D5. DTOs de organizadores con shape `{ userId?, displayName? }`
**Alternativas:**
- (A) Mantener `organizerIds: string[]` y aceptar texto como string con prefijo `text:NombreX`. Frágil, no tipado.
- (B) `organizers: Array<{ userId?: string; displayName?: string }>`. Tipado fuerte, OpenAPI lo expone bien.
- (C) Dos arrays separados: `organizerUserIds`, `organizerNames`. Duplica orden.

**Decisión: (B).**
**Por qué:** Tipado claro, fácil de validar (`@ValidateNested` + `@OneOf`), preserva orden, y el frontend lo serializa directo desde el estado del componente.

Response (`OrganizerResponseDto`):
```ts
{
  id: string             // PK del registro EventOrganizer
  kind: 'user' | 'text'
  userId: string | null
  name: string           // user.name si user, displayName si text
  email: string | null
  role: string | null
}
```

### D6. Combobox de departamento usando shadcn `Command`
**Alternativas:**
- (A) Mantener `Select` y agregar input filter encima (hack, baja accesibilidad).
- (B) Usar `Command` + `Popover` de shadcn (combobox estándar).
- (C) Librería externa tipo `react-select`.

**Decisión: (B).** Ya tenemos shadcn instalado. El patrón está documentado en shadcn. Mantiene consistencia visual y A11y por defecto.

Componente nuevo: `<DepartmentCombobox value onChange departments />` reutilizable. Para v1 sólo se usa en `event-form`; en el futuro podría reemplazar el `Select` del módulo de cultos.

### D7. Validación de fechas en `DateTimePicker`
- Prop nueva `minDate?: string` en el wrapper. El picker pasa el min al input nativo y filtra opciones del time.
- En `event-form.tsx`: efecto que observa `startDate`. Si `endDate < startDate`, se setea `endDate = startDate`. Tema visual: cuando `start === end` y duración era >0, mostramos un hint "ajustamos la fecha de fin".
- `zod refine` se mantiene.

### D8. Componentización
Nuevos componentes (sin reescribir lo existente):
```
features/calendar/components/
├── cover-image-picker/
│   ├── index.tsx                     # contenedor con tabs
│   ├── cover-upload-tab.tsx          # input file
│   ├── cover-search-tab.tsx          # búsqueda Unsplash
│   ├── cover-cropper.tsx             # react-easy-crop wrapper
│   └── use-cover-image.ts            # hook: estado actual + acciones
├── department-combobox.tsx
└── organizer-chip.tsx                # render diferenciado user/text
features/calendar/hooks/
└── use-cover-suggestions.ts          # react-query wrapper sobre el endpoint
features/calendar/utils/
└── event-date.ts                     # formatEventDateRange()
```
Cada componente con < 200 LOC. `event-form.tsx` orquesta, no implementa lógica de imagen ni de búsqueda.

### D9. Visualización de fechas en el detalle
Helper `formatEventDateRange(startIso, endIso)`:
- Mismo día: `"viernes, 12 de junio de 2026, 09:00 – 12:00"`.
- Multi-día: `"vie 12 jun – sáb 13 jun 2026, 09:00 – 18:00"` (separado en línea o icono según render).
El detalle usa dos íconos como hoy (Calendar + Clock); el helper devuelve `{ dateLabel, timeLabel, isMultiDay }`.

## Risks / Trade-offs

- **Unsplash API rate limit (50 req/h en demo).** → Mitigación: cache LRU en memoria por query (5 min), fallback gracioso a "Sin sugerencias disponibles" en 429/503. Documentar pasar a producción (5000 req/h).
- **Falta de token Unsplash en dev.** → Mitigación: endpoint devuelve 503 cuando `UNSPLASH_ACCESS_KEY` no está; UI muestra "Búsqueda no disponible" + sigue funcionando el upload local.
- **Migración de organizadores rompe API actual.** → Mitigación: el contrato pasa de `organizerIds: string[]` a `organizers: { userId?, displayName? }[]`. Como el único consumidor es el frontend propio, se actualiza en el mismo PR. Documentar en `proposal.md` como BREAKING (ya hecho).
- **Costo de `sharp` en bundle backend.** → ~10MB extra pero el contenedor backend ya es pesado, no es bloqueante. Alternativa `jimp` (puro JS) si surge problema en Alpine.
- **`react-easy-crop` peso bundle frontend.** → ~30KB gz; aceptable. Lazy-load la pestaña con `React.lazy()` para no impactar la primera carga del form.
- **Inconsistencia: portadas viejas siguen siendo URLs externas de Unsplash hardcodeadas.** → Mitigación: `defaultCoverForType` se mantiene como fallback cuando no hay attachment-portada. Eventos creados con el flujo nuevo guardan su propia portada local.
- **Backend storage crece.** → No-op por ahora (mismo `uploads/`); revisar política de retención si crece >1GB.

## Migration Plan

1. Migración TypeORM (`<timestamp>-EventOrganizerSupportTextAndCover.ts`):
   - Drop PK actual de `event_organizers`.
   - `ALTER TABLE event_organizers ADD COLUMN id uuid DEFAULT gen_random_uuid() PRIMARY KEY` (rellenar antes de aplicar PK).
   - `ALTER COLUMN user_id DROP NOT NULL`.
   - `ADD COLUMN display_name text NULL`.
   - Constraint: `CHECK ((user_id IS NOT NULL AND display_name IS NULL) OR (user_id IS NULL AND display_name IS NOT NULL))`.
   - Unique parcial: `CREATE UNIQUE INDEX event_organizers_event_user_uq ON event_organizers (event_id, user_id) WHERE user_id IS NOT NULL`.
   - `ALTER TABLE event_attachments ADD COLUMN source_author text NULL`.
   - `ALTER TABLE event_attachments ADD COLUMN source_url text NULL`.
2. Backend: agregar `sharp`, `UNSPLASH_ACCESS_KEY` a `.env.example`, implementar endpoints, regenerar OpenAPI.
3. Frontend: regenerar clientes API, implementar componentes, cablear en `event-form` y `event-detail-page`.
4. Smoke test manual: crear evento con upload, crear con búsqueda, editar uno existente cambiando portada, crear con organizador texto, listar.
5. Deploy. No requiere downtime (migración aditiva). Rollback: revertir migración eliminando columnas; frontend anterior sigue funcionando si se vuelve a `organizerIds`. Hacer el revert en el mismo PR-revert si rota.

## Open Questions

- ¿Qué hacemos con eventos existentes que ya tienen una imagen de Unsplash hardcodeada como `coverImageUrl` (no es attachment)? Propuesta: nada — el editor que entre a editar puede reemplazarla con el nuevo picker; mientras tanto el fallback `defaultCoverForType` sigue sirviendo.
- ¿Mostramos el crédito al autor de Unsplash en el detalle? Cumple ToS si lo hacemos; propuesta: sí, pequeño "Foto: <author> en Unsplash" debajo de la imagen cuando `attachment.sourceAuthor` esté presente.
- ¿Límite de organizadores por evento? Hoy no hay; propuesta: 25 como guardrail razonable (config).
