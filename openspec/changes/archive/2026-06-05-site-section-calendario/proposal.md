## Why

La sección CALENDARIO del sitio público ya consume eventos en vivo del backend
(`window.IASD_API.fetchEvents()` en `website/integration.js` → `GET /api/calendar`).
Los eventos se gestionan en el **módulo de Calendario** del admin (`/admin/calendario`)
y los eventos **publicados** son exactamente los que aparecen en el sitio público
(la API ya filtra a `Published` para usuarios anónimos vía `OptionalJwtAuthGuard`).

Por lo tanto, esta sección **no necesita una tab "editor"**: no hay contenido
propio que administrar aparte de lo que ya hace el módulo de Calendario. Lo que sí
falta es una tab **explicativa/redirección** en Configuraciones que le indique al
administrador **dónde y cómo** se gestionan los eventos del sitio (en el módulo
Calendario) y que aclare que solo los eventos publicados se muestran, con un enlace
directo a ese módulo.

Este change depende de `site-config-foundation` (el shell de tabs y el componente
de tab explicativa).

## What Changes

- **Frontend (admin)** — tab "Calendario" en Configuraciones (tipo explicativa):
  - Pestaña en `/admin/configuraciones/calendario` que **explica**:
    - Que los eventos se crean y editan en el módulo Calendario.
    - Que solo los eventos con estado **Publicado** aparecen en el sitio público.
    - Cómo destacar/ordenar (según las capacidades del módulo Calendario).
  - Botón/enlace "Ir al Calendario" → `/admin/calendario` (usa el componente
    `ConfigRedirectCard` de la base).
  - (Opcional) Editar textos introductorios de la página del sitio (kicker/título)
    vía `SiteSetting` con claves `calendario.*`, si se decide permitirlo.

- **Sitio público (`website/`)** — confirmar el consumo ya existente:
  - `integration.js`: `fetchEvents()` consume `GET /api/calendar` (público,
    `Published`). Se mantiene tal cual (ya funciona).
  - Confirmar el fallback a datos por defecto cuando la API falla.
  - Documentar en `INTEGRATION.md` que el Calendario del sitio se alimenta del
    módulo Calendario y que no tiene administración propia.
  - **Zona horaria**: el sitio formatea fechas en TZ local del navegador con
    `Intl.DateTimeFormat('es-CL')`, consistente con el admin.

- **Permisos**: la tab explicativa es visible para `Admin`; lectura pública anónima
  (solo `Published`) ya provista por el módulo Calendario.

## Capabilities

### New Capabilities
- `site-section-calendario`: Tab explicativa de Calendario en Configuraciones, que
  documenta y enlaza al módulo Calendario como fuente de los eventos del sitio
  público, más el cableado confirmado del sitio (que ya consume el calendario).

## Impact

- **Backend Module**: ninguno nuevo. Se reutiliza el módulo `calendar` existente y
  su endpoint público `GET /api/calendar` (ya filtra `Published` para anónimos).
- **No nuevas entidades. No migraciones. No endpoints nuevos.**
- **Frontend**: nueva tab "Calendario" (explicativa/redirección) en
  `ConfiguracionesLayout`. Opcionalmente, formulario mínimo de textos de página.
- **Sitio**: sin cambios funcionales (ya consume `/api/calendar`); solo
  documentación en `INTEGRATION.md`. `fetchEvents`/`mapEvent`/hook en `useStore`
  ya existen.
- **Depende de**: `site-config-foundation` (shell de tabs + `ConfigRedirectCard`).
- **Reutiliza**: módulo `calendar` (fuente de verdad de los eventos).

## Fuera del alcance

- Filtros/configuración de eventos desde Configuraciones: los eventos (y su estado,
  tipo, destacado) se gestionan en el módulo Calendario, no aquí.
- Endpoint público dedicado con filtros configurables: innecesario; el sitio usa el
  `GET /api/calendar` existente.
- Vista de detalle de evento en el sitio público (modal/shareSlug): change futuro.
- Personalización visual de tarjetas de evento: change futuro.
- Integración con Google Calendar / iCal.
