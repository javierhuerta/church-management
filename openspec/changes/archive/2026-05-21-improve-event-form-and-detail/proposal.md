## Why

El formulario de creación/edición de eventos del calendario tiene varias fricciones de uso que afectan a editores (Pastor, Secretaria, Admin) en su flujo diario:

- La **imagen de portada** no se puede modificar desde el formulario de edición. Hoy depende exclusivamente de marcar un adjunto como portada y, para eventos nuevos, se usa una imagen genérica por tipo. No hay forma de subir o sugerir una imagen representativa del tema del evento.
- El formulario **no valida visualmente** que la fecha de fin sea posterior a la de inicio antes de enviar (sólo existe la regla en `zod` pero no hay min en el control de fin).
- El **detalle del evento sólo muestra la fecha de inicio**. Para eventos multi-día (campamentos, retiros, semana de oración) el lector pierde información clave.
- Los **organizadores** sólo pueden ser usuarios del sistema. Muchos organizadores reales (invitados externos, líderes de otras iglesias, voluntarios) no tienen cuenta y hoy no pueden listarse.
- El **selector de departamento** es un Select simple sin búsqueda, lo que vuelve lenta la selección a medida que crecen los departamentos.

## What Changes

- **Editor de portada en el formulario** (crear y editar): permite (a) subir una imagen propia desde el equipo, (b) buscar/sugerir imágenes desde un servicio gratuito (Unsplash) basado en título y departamento del evento, (c) recortar la imagen al ratio 16:9 que usa la UI y optimizarla (resize a 1600×900 max, WebP/JPEG con compresión) antes de guardarla como portada del evento.
- **Validación de fecha fin** en el formulario: el `DateTimePicker` de fin no permite seleccionar fechas anteriores a la de inicio; si la de inicio se mueve a un valor posterior al fin, el fin se ajusta automáticamente. El error de `zod` sigue como guardrail final.
- **Detalle del evento muestra rango completo de fechas**: si el evento es del mismo día, muestra fecha + rango horario (como hoy); si abarca varios días, muestra "fecha inicio – fecha fin" con horas.
- **Organizadores de texto libre**: el `OrganizersSelect` permite agregar un nombre escrito a mano cuando la búsqueda no encuentra usuario. Los chips diferencian visualmente entre organizador-usuario y organizador-texto. Los usuarios aparecen primero en la lista (prioridad). En backend se persisten como `EventOrganizer` con `userId` opcional + `displayName`.
- **Combobox de departamento con búsqueda**: reemplazo del `Select` por un `Combobox` (shadcn/ui Command) con buscador, manteniendo la opción "Sin departamento".
- **Arquitectura React modular**: el `event-form.tsx` no debe seguir creciendo. Cada novedad se construye como componente reutilizable bajo `features/calendar/components/` (`cover-image-picker/`, `department-combobox.tsx`, etc.).

**Fuera del alcance**
- Búsqueda de imágenes en Pexels u otros proveedores (sólo Unsplash en v1, abierto a extender).
- Galería de plantillas/diseños prearmados (sólo búsqueda libre + upload).
- Edición avanzada de imagen (filtros, texto sobre imagen, rotación). Sólo crop + resize.
- Sincronización de organizadores-texto a usuarios reales cuando éstos se den de alta luego.
- Migración masiva de eventos existentes para asignarles portadas nuevas.

## Capabilities

### New Capabilities
- `event-cover-image`: Gestión de la imagen de portada del evento (upload local, sugerencias desde proveedor externo, recorte/optimización al ratio de la UI).

### Modified Capabilities
- `calendar`: Cambia el requisito de validación de fechas (debe validarse en UI antes de submit), se aclara que el detalle muestra el rango completo cuando el evento abarca varios días, se relaja el modelo de organizadores (dejan de ser estrictamente usuarios) y el selector de departamento dentro del formulario de evento debe soportar búsqueda.

## Impact

- **Backend (NestJS)**
  - Módulo `calendar`: nuevo endpoint `POST /calendar/:id/cover` (multipart) que recibe un archivo de imagen ya recortado por el cliente y lo guarda como attachment con `isCover=true`, reemplazando el actual.
  - Módulo `calendar`: nuevo endpoint `GET /calendar/cover-suggestions?query=...` que proxea búsqueda a Unsplash API (token vía env var `UNSPLASH_ACCESS_KEY`) y devuelve `{ id, thumbUrl, fullUrl, author, authorUrl }[]`. Nunca exponer el token al frontend.
  - Entidad `EventOrganizer`: agregar columnas `display_name` (text, nullable) y permitir `user_id` nullable. Cuando `userId` esté presente, `displayName` se omite (el nombre vive en el usuario).
  - DTOs `CreateEventDto` / `UpdateEventDto`: el campo `organizerIds: string[]` pasa a ser `organizers: Array<{ userId?: string; displayName?: string }>` (BREAKING para clientes que lleguen a usarlo, pero hoy sólo lo consume el frontend propio).
  - DTO `OrganizerResponseDto`: agregar `userId: string | null` y `kind: 'user' | 'text'`.
  - Migración TypeORM: añadir columna `display_name` a `event_organizers`, hacer `user_id` nullable, ajustar PK (compuesta hoy con `event_id + user_id`) — pasa a `id` autogenerado o `event_id + slug` para soportar varios texto-organizers; decisión final en `design.md`.
  - `package.json` backend: agregar dependencia `sharp` para validación server-side opcional (resize defensivo si el cliente manda algo grande).

- **Frontend (React)**
  - `features/calendar/components/cover-image-picker/`: nuevo subcomponente con tres pestañas — *Subir*, *Buscar* (Unsplash), *URL/actual*. Incluye `cropper` (`react-easy-crop`) y export a JPEG/WebP a 1600×900.
  - `features/calendar/components/department-combobox.tsx`: nuevo, basado en `@/components/ui/command` (shadcn).
  - `features/calendar/components/organizers-select.tsx`: extender para emitir entradas tipo `{ kind: 'user', user } | { kind: 'text', displayName }`. Agregar acción "Agregar como texto" cuando la query no matchea.
  - `features/calendar/components/event-form.tsx`: cablear el nuevo picker, combobox, y nuevo shape de organizers; ajustar `DateTimePicker` con prop `min` y autoajuste del fin.
  - `features/calendar/pages/event-detail-page.tsx`: ajustar render del bloque fecha/hora; usar helper `formatEventDateRange()` (nuevo, en `utils/event-date.ts`).
  - `lib/api`: regenerar clientes a partir del schema OpenAPI actualizado (script existente).
  - `package.json` frontend: agregar `react-easy-crop` y `browser-image-compression` (o equivalente liviano de canvas).

- **Permisos/roles**: el upload y la búsqueda de portadas siguen reservados a editores (mismo guard `assertEditor` actual). Sin cambios en autorización.

- **Configuración / env**: nueva variable `UNSPLASH_ACCESS_KEY` en backend (`.env.example` actualizado, `docker-compose` documentado). Si falta, el endpoint de sugerencias devuelve `503` y la pestaña *Buscar* se muestra deshabilitada con mensaje claro.

- **Datos existentes**: la migración debe rellenar `display_name = null` para registros existentes y mantener integridad. No requiere backfill destructivo.
