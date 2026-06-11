## Context

El sitio público vive en `website/` y es un **export de Claude Artifacts**
(React 18 UMD + Babel-en-navegador + CSS plano con variables, sin build
step). Se sirve tal cual desde un contenedor Nginx (puerto 5173 en dev,
producción detrás de Cloudflare).

**Estado actual de media queries en `website/styles.css`:**
- `@media (max-width: 720px)` → `.prog-row` colapsa
- `@media (max-width: 880px)` → `nav-toggle` aparece; `.hero-grid`,
  `.next-service-card`, `.moments-grid`, `.past-sermons-grid` colapsan

**Estado actual por página (medido con Playwright a 390×844):**

| Página | Componente | Línea | Grid actual | ¿Media query? |
|---|---|---|---|---|
| Inicio | Nuestros Horarios | `pages-1.jsx:421` | `repeat(3, 1fr)` | ❌ No |
| Inicio | Hero grid | `pages-1.jsx:171-176` | `1fr 1.05fr` | ✅ (880px) |
| Inicio | Next service card | `pages-1.jsx:319-322` | `1fr 0.9fr` | ✅ (880px) |
| Inicio | Moments grid | `pages-1.jsx:465` | `repeat(6, 1fr)` | ✅ (880px → 2col) |
| Nosotros | Junta directiva | `pages-1.jsx:720` | `repeat(3, 1fr)` | ❌ No |
| Nosotros | Ministerios | `pages-1.jsx:807` | `auto-fill, minmax(260px, 1fr)` | ✅ (auto-fill) |
| Galería | Colecciones | `pages-1.jsx:998` | `repeat(6, 1fr)` | ❌ No |
| Horarios | Día + lista | `pages-2.jsx:104` | `200px 1fr` | ❌ No |
| Horarios | Puesta de sol | `pages-2.jsx:161` | `repeat(4, 1fr)` | ❌ No |
| Calendario | MonthView | `pages-4.jsx:691-693` | `repeat(7, minmax(0,1fr))` | ❌ No |
| Calendario | ListView editor | `pages-4.jsx:513` | `130px 110px 1fr auto` | ❌ No |
| En Vivo | Past sermons | `pages-3.jsx:220` | `repeat(3, 1fr)` | ✅ (880px) |
| Programa | Tabla | `pages-4.jsx:147,159` | `200px 1fr 1.6fr` | ✅ (720px) |
| **TODAS** | **Footer** | `ui.jsx:197` | `1.2fr 1fr 1fr` | ❌ **No** |
| **TODAS** | **Nav mobile** | `ui.jsx:99-138` | — | ❌ Click-outside |

**Causa del scroll horizontal global** (medido: docW=526, viewport=390): el
footer en grid 3-col con gap 48 desborda; los handles sociales
(`@iasdcentralosorno` etc.) y el email ocupan ~150-200px y fuerzan ancho
mayor al viewport.

## Goals / Non-Goals

**Goals:**
- Eliminar el scroll horizontal en las 7 páginas del sitio público a
  ≤ 720px.
- Mantener el aspecto editorial desktop intacto (sin sacrificar tipografía,
  grids grandes, ni el feel del diseño).
- Cambios mínimos y localizados en `website/`, sin tocar el backend, el
  frontend admin, ni los seeders.
- Patrón mobile-first para grids: `auto-fit, minmax(N, 1fr)` donde sea
  posible (menos media queries explícitas).
- El nav mobile debe ser usable: cerrar al tocar fuera.

**Non-Goals:**
- No refactorizar el sitio a React + Vite + shadcn.
- No cambiar la API pública ni los endpoints.
- No tocar la lógica de integración (`integration.js`).
- No agregar PWA / offline / service worker.
- No reescribir media queries existentes — solo agregar las que faltan.
- No optimizar imágenes (lazy load, srcset, etc.).
- No cambiar los assets (logo, fotos, etc.).

## Decisions

### 1. Patrón `auto-fit` + `minmax` en vez de media queries explícitas

**Decisión:** Para grids nuevos o modificables, usar
`grid-template-columns: repeat(auto-fit, minmax(N, 1fr))` con `N`
elegido para colapsar naturalmente a 1 columna en mobile (390px ⇒ N≥200).

**Por qué:** Reduce la cantidad de media queries explícitas. Solo se
agregan media queries para casos donde el grid tiene un número exacto
de hijos que debe mantener simetría (ej. 3 horarios deben verse como
3 columnas o stack vertical, no como "lo que entre").

**Alternativa considerada:** Agregar media query explícita para cada
grid. Descartada porque genera más código CSS y más puntos de falla.

### 2. Footer: clase CSS en vez de estilos inline

**Decisión:** Agregar una clase `.footer-grid` al `<div>` del footer
(`ui.jsx:197`) que tiene el grid inline, y definir el grid en CSS
`@media (max-width: 720px) { .footer-grid { grid-template-columns: 1fr;
gap: 32px; text-align: center; } }`.

**Por qué:** El footer es global y aparece en TODAS las páginas.
Centralizar la regla en CSS evita repetir 7 parches inline.

**Alternativa considerada:** Dejar inline y agregar clase por cada
página. Descartada: si llega un update de Claude Artifacts y se
re-genera el `ui.jsx`, se rompe el cambio.

### 3. Calendario (MonthView) en mobile: forzar vista lista

**Decisión:** En mobile (≤ 720px), si el usuario entra a la vista
"Mes" del calendario, mostrar un mensaje "Esta vista no está
optimizada para mobile. Cambia a vista Lista" con un botón que
cambia `view = 'lista'`. El grid de 7 columnas se mantiene desktop-only.

**Por qué:** Un mes de 7×6 celdas en un viewport de 390px da celdas de
~50px de ancho, lo que hace los números y eventos ilegibles. Una
"vista mes" en mobile real requiere repensar la UX (cards verticales
por día, swipe horizontal, etc.) y eso está fuera del scope.

**Alternativa considerada:** Reescribir MonthView en mobile con cards
verticales. Descartada: scope creep. La vista Lista es la canónica
para el sitio público de todos modos (los usuarios consultan "qué hay
esta semana" más que "qué hay el día 15 de octubre").

### 4. Nav: click-outside via `useEffect` con `mousedown` listener

**Decisión:** En `Nav()` (`ui.jsx:99-138`), agregar un `useEffect` que
registra un `mousedown` listener en `document`. Si el target NO está
dentro del `.nav` (chequeado con `closest('.nav')`), se hace
`setMenuOpen(false)`.

**Por qué:** Patrón estándar de menú mobile. `mousedown` se prefiere
sobre `click` para que se cierre antes de que el click active otra
cosa.

**Alternativa considerada:** Overlay oscuro detrás del menú que cierra
al hacer click. Descartada: agrega un componente nuevo y CSS
adicional; el click-outside es suficiente.

### 5. ListView editor (4 cols) → stack vertical en mobile

**Decisión:** En `pages-4.jsx:512-516`, cambiar el grid a
`grid-template-columns: 1fr` con `gap: 10` en `:720px`. Los inputs de
fecha/hora/título/checkbox/eliminar se apilan verticalmente.

**Por qué:** 130 + 110 + flex + auto = ~390px en desktop, pero con
paddings y gaps ya no entra en mobile. Es edición admin (no público),
pero el editor puede usarla desde el celular.

**Alternativa considerada:** Ocultar el editor en mobile. Descartada:
rompe el flujo de edición para usuarios que solo tienen celular.

## Risks / Trade-offs

- **[Riesgo] El footer ahora tiene texto centrado en mobile, que puede
  romper la jerarquía visual desktop.** Mitigación: solo se aplica
  `text-align: center` en `:720px`; en desktop el texto mantiene
  `align-items: start` original.

- **[Riesgo] Si llega un update del diseño de Claude Artifacts, se
  re-genera `website/ui.jsx` y `pages-*.jsx`, perdiendo los parches
  inline.** Mitigación: el footer usa una clase CSS centralizada;
  los demás cambios son CSS (`styles.css`) o ajustes pequeños que
  están documentados en `INTEGRATION.md`. Documentar los parches en
  `INTEGRATION.md` para que se puedan re-aplicar.

- **[Riesgo] Forzar `view = 'lista'` en calendario mobile puede
  sorprender al usuario que tocó el toggle "Mes" en su celular.**
  Mitigación: mostrar un mensaje claro + botón para cambiar, en vez
  de un redirect silencioso.

- **[Trade-off] El sitio sigue siendo un export estático. Cualquier
  ajuste grande (ej. cambiar el patrón mobile a "cards verticales"
  en el calendario) requeriría re-exportar de Claude Artifacts, lo
  cual no podemos hacer desde el código. Este change solo agrega CSS
  + parches JSX pequeños.**

## Migration Plan

1. Implementar cambios en rama `feature/website-mobile-optimization`
   desde `development`.
2. Validar visualmente con Playwright a 390×844 que las 7 páginas
   tienen `document.documentElement.scrollWidth === 390` (sin scroll
   horizontal).
3. Validar visualmente con Playwright a 1280×800 que el layout
   desktop no cambió.
4. Hacer commit, abrir PR a `development`.
5. CI despliega a staging; validar manualmente con un celular real
   (iPhone SE y un Android).
6. Cerrar la issue de GitHub con la lista de cambios.

**Rollback:** Revertir el merge commit en `development` y redeploy.
No hay migraciones de DB ni cambios de API.
