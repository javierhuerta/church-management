## Contexto

El módulo `calendar` (backend) ya expone endpoints públicos vía `OptionalJwtAuthGuard`:
`GET /api/calendar` devuelve a usuarios anónimos solo eventos `Published`, ordenados
por `startDate ASC`. El sitio público (`website/integration.js`) ya consume esto con
`fetchEvents()` y mapea al shape del diseño `{ id, date, start, title, loc, featured }`.

Los eventos se administran exclusivamente en el módulo Calendario del admin
(`/admin/calendario`). No hay contenido adicional que administrar para la sección del
sitio. Por eso esta sección usa una tab **explicativa/redirección**, no un editor.

## Decisiones

### 1. Tab explicativa, no editor

La tab "Calendario" en Configuraciones usa el componente `ConfigRedirectCard`
(provisto por `site-config-foundation`) para:
- Explicar que los eventos se gestionan en el módulo Calendario.
- Aclarar que solo los eventos **Publicados** aparecen en el sitio.
- Enlazar a `/admin/calendario`.

No se administran filtros ni configuración de eventos aquí (sería duplicar la
responsabilidad del módulo Calendario).

### 2. El sitio sigue consumiendo `/api/calendar`

No se crea un endpoint público nuevo. `fetchEvents()` ya usa `GET /api/calendar`
(que filtra `Published` para anónimos). Se mantiene el fallback a contenido por
defecto si la API falla.

### 3. Textos de página (opcional)

Si se desea, el kicker/título de la página del sitio puede editarse vía `SiteSetting`
(`calendario.kicker`, `calendario.titulo`). Es opcional y de bajo valor; puede
omitirse en una primera versión. No afecta la naturaleza explicativa de la tab.

### 4. Zona horaria

El sitio formatea fechas/horas en la TZ local del navegador (`Intl.DateTimeFormat('es-CL')`
y `getHours/getMinutes`), consistente con cómo el admin muestra los eventos. Backend
almacena en UTC. Documentarlo en `INTEGRATION.md`.

## Permisos

- Tab visible para `Admin`.
- Lectura pública anónima (solo `Published`) ya provista por el módulo Calendario.

## Estado actual (head-start ya en el repo)

- `website/integration.js`: `fetchEvents()` y `mapEvent()` ya implementados.
- `website/auth.jsx` (`useStore`): hook que reemplaza eventos demo por los de la API
  ya implementado.
- Falta: la tab explicativa en Configuraciones y la documentación en `INTEGRATION.md`.
