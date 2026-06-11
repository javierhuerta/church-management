## Why

El sitio público (React UMD exportado desde Claude Artifacts, servido desde
`website/`) presenta **scroll horizontal en las 7 páginas** cuando se ve en
viewport mobile (≤ 720px): el `document.documentElement.scrollWidth` mide 526px
en un viewport de 390px (iPhone 14). La causa raíz es doble:

1. El **footer** tiene un grid `1.2fr 1fr 1fr` con `gap: 48px` que **nunca
   colapsa** a mobile, desbordando textos como "contacto@iasdcentralosorno.cl"
   y los social handles.
2. Varios **grids fijos de N columnas** dentro de las páginas (junta directiva,
   horarios, puesta de sol, galería, calendario mes, etc.) tampoco tienen
   media query.

Adicionalmente, el menú hamburguesa mobile del nav no se cierra al tocar fuera
del menú. El sitio ya tiene media queries para `nav-toggle` (≤880px) y para
`prog-row` (≤720px), pero el resto del layout quedó en desktop-first.

Esto impacta directamente a la congregación que visita el sitio desde el
celular, que es el caso de uso principal para revisar horarios, ver el
programa del sábado, consultar el calendario y mirar la galería.

## What Changes

- **Footer responsive**: el grid de 3 columnas del footer colapsa a 1 columna
  en mobile (≤ 720px), con texto centrado y gap reducido.
- **PageInicio · Nuestros Horarios**: el grid de 3 columnas de los horarios
  colapsa a 1 columna en mobile.
- **PageNosotros · Junta directiva**: el grid de 3 columnas de la junta
  directiva colapsa a 1 columna en mobile.
- **PageGaleria**: los grids de 6 columnas de las colecciones se adaptan con
  `auto-fit` para mostrar 1 imagen por fila en mobile.
- **PageHorarios**: el grid día + lista colapsa a 1 columna, y la grilla de
  "Puesta de sol" (4 viernes) colapsa a 2 columnas en mobile.
- **PageCalendario (MonthView)**: en mobile, la vista mes deja de ser práctica
  (celdas de ~55px) y se fuerza/aconseja la vista lista.
- **PageCalendario (ListView editor)**: el grid de 4 columnas del editor
  (fecha/hora/título/acciones) colapsa a stack vertical en mobile.
- **Nav mobile**: el menú hamburguesa se cierra al tocar fuera del `.nav`.

Sin cambios al backend ni al frontend admin. No hay cambios funcionales ni
breaking — solo ajustes de CSS y estilos inline.

## Capabilities

### New Capabilities
- `public-site-mobile-layout`: layout responsive del sitio público para
  mobile (≤ 720px). Define los breakpoints, patrones de colapso de grids y
  comportamiento del nav en mobile.

### Modified Capabilities
- `public-site-content`: se modifica el comportamiento del layout del sitio
  público en mobile. Los endpoints públicos (`/api/public/*`) no cambian;
  solo el renderizado responsive del frontend export.

## Impact

- **Sitio público** (`website/`):
  - `website/styles.css` — agregar media queries para footer, junta
    directiva, horarios, puesta de sol, galería, calendario.
  - `website/ui.jsx` — agregar `className` al grid del footer; agregar
    `useEffect` de click-outside al nav.
  - `website/pages-1.jsx` — cambiar `gridTemplateColumns` en Inicio (horarios),
    Nosotros (junta), Galería.
  - `website/pages-2.jsx` — cambiar `gridTemplateColumns` en Horarios (día +
    items) y Puesta de sol.
  - `website/pages-4.jsx` — ajustar MonthView y ListView editor para mobile.

- **Backend / admin / API pública**: **sin cambios**.
- **Datos seeders**: sin cambios.
- **Build**: el sitio es un export de Claude Artifacts servido como estático,
  no pasa por `npm run build` del frontend. La verificación es visual con
  Playwright.

## Fuera del alcance

- Refactor del sitio a React + Vite + shadcn (el `website/` es un export de
  Claude Artifacts y se conserva tal cual hasta que llegue una actualización
  del diseño).
- Mejoras de performance mobile (lazy load, image optimization).
- PWA / offline support.
- Reescritura de los media queries existentes — solo se agregan los que
  faltan.
