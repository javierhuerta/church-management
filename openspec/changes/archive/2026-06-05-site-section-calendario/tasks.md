## 1. Sitio público - Consumo del calendario (ya existente)

- [x] 1.1 `fetchEvents()` en `website/integration.js` consume `GET /api/calendar`
- [x] 1.2 `mapEvent()` mapea EventResponseDto → `{ id, date, start, title, loc, featured }`
- [x] 1.3 Hook en `website/auth.jsx` (`useStore`) reemplaza eventos demo por los de la API
- [x] 1.4 Confirmar el fallback a contenido por defecto cuando la API falla
- [x] 1.5 Documentar en `INTEGRATION.md` que el Calendario del sitio se alimenta del módulo Calendario (solo `Published`) y la nota de zona horaria

## 2. Frontend (admin) - Tab explicativa "Calendario"

- [x] 2.1 Cargar skills `church-ui-design` y `shadcn` antes de implementar
- [x] 2.2 Crear la tab "Calendario" en `ConfiguracionesLayout` usando `ConfigRedirectCard`
- [x] 2.3 Texto explicativo: los eventos se gestionan en el módulo Calendario; solo los publicados aparecen en el sitio
- [x] 2.4 Botón "Ir al Calendario" → `/admin/calendario`
- [ ] 2.5 (Opcional) Formulario mínimo de textos de página (`calendario.kicker`, `calendario.titulo`) vía `SiteSetting`

## 3. Verificación

- [x] 3.1 El sitio muestra los eventos publicados reales del módulo Calendario
- [x] 3.2 Crear/publicar un evento en `/admin/calendario` se refleja en el sitio
- [x] 3.3 La tab "Calendario" en Configuraciones explica y redirige correctamente
