# Tasks · website-mobile-optimization

## 1. Setup & branch

- [x] 1.1 Crear rama `feature/website-mobile-optimization` desde `development`
- [x] 1.2 Confirmar que el sitio público está sirviendo en `localhost:5173` con datos reales

## 2. Footer responsive (CRÍTICO — fix transversal)

- [x] 2.1 En `website/ui.jsx:197`, agregar `className="footer-grid"` al `<div>` que envuelve las 3 columnas del footer
- [x] 2.2 En `website/styles.css`, agregar regla base `.footer-grid { display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 48px; align-items: start; }`
- [x] 2.3 En `website/styles.css`, agregar `@media (max-width: 720px) { .footer-grid { grid-template-columns: 1fr; gap: 32px; text-align: center; } .footer-grid > div { display: flex; flex-direction: column; align-items: center; } }`

## 3. PageInicio — Nuestros Horarios

- [x] 3.1 En `website/pages-1.jsx:421`, cambiar `gridTemplateColumns: 'repeat(3, 1fr)'` → `repeat(auto-fit, minmax(220px, 1fr))`
- [x] 3.2 Quitar el `borderRight` condicional en las celdas (ya no aplica con auto-fit)

## 4. PageNosotros — Junta directiva

- [x] 4.1 En `website/pages-1.jsx:720`, cambiar `gridTemplateColumns: 'repeat(3, 1fr)'` → `repeat(auto-fit, minmax(220px, 1fr))`
- [x] 4.2 En `styles.css` no requiere cambio (auto-fit colapsa solo)

## 5. PageGaleria — Colecciones

- [x] 5.1 En `website/pages-1.jsx:998`, cambiar `gridTemplateColumns: 'repeat(6, 1fr)'` → `repeat(auto-fit, minmax(180px, 1fr))`
- [x] 5.2 Ajustar el `span` de cada slot para que respete el nuevo contexto (ej. `span` deja de tener sentido con auto-fit; usar `grid-column: auto` para que cada slot ocupe 1 celda)

## 6. PageHorarios — Día + items + Puesta de sol

- [x] 6.1 En `website/pages-2.jsx:104`, cambiar `gridTemplateColumns: '200px 1fr'` → `'1fr'` con `@media` que vuelve a `200px 1fr` en `> 720px` (vía clase CSS)
- [x] 6.2 Crear clase `.schedule-day` en `styles.css` con la regla mobile/desktop
- [x] 6.3 En `website/pages-2.jsx:161`, cambiar `gridTemplateColumns: 'repeat(4, 1fr)'` → `repeat(2, 1fr)` con media query → `1fr` en `:480px`

## 7. PageCalendario (MonthView) mobile

- [x] 7.1 En `website/pages-4.jsx:MonthView`, agregar un guard que detecte viewport mobile (window.innerWidth ≤ 720) y renderice un mensaje + botón "Ver como lista" en vez del grid
- [x] 7.2 El botón SHALL ejecutar `setView('lista')` (vía prop o callback)
- [x] 7.3 Si el usuario está en desktop, comportamiento sin cambios

## 8. PageCalendario (ListView editor) mobile

- [x] 8.1 En `website/pages-4.jsx:512-516`, agregar `className="cal-event-editor"` al `<div>` del editor
- [x] 8.2 En `styles.css`, agregar `.cal-event-editor { display: grid; grid-template-columns: 130px 110px 1fr auto; gap: 20px; }` y `@media (max-width: 720px) { .cal-event-editor { grid-template-columns: 1fr; gap: 10px; } }`

## 9. Nav mobile — click-outside

- [x] 9.1 En `website/ui.jsx:99-138` (función `Nav`), agregar `useRef` para el elemento `.nav`
- [x] 9.2 Agregar `useEffect` que registra un `mousedown` listener en `document`
- [x] 9.3 Si `event.target` no está dentro del nav (`!navRef.current.contains(event.target)`), ejecutar `setMenuOpen(false)`
- [x] 9.4 Cleanup: remover el listener en el return del `useEffect`

## 10. Verificación visual con Playwright

- [x] 10.1 Abrir el sitio en `localhost:5173` con viewport 390×844 (iPhone 14)
- [x] 10.2 Para cada una de las 7 páginas, ejecutar `document.documentElement.scrollWidth` y verificar que sea 390 (sin scroll horizontal)
- [x] 10.3 Repetir a 1280×800 (desktop) y verificar que el layout no cambió (grid de 3 cols en footer, junta directiva, horarios; grid de 4 cols en puesta de sol, etc.)
- [x] 10.4 Probar el nav mobile: abrir menú, tocar fuera, verificar que se cierra
- [x] 10.5 Probar el toggle "Mes" del calendario en mobile y verificar que muestra el mensaje + botón

## 11. Documentación

- [x] 11.1 Actualizar `website/INTEGRATION.md` con la sección "Mobile responsive (2026-06)" listando los parches aplicados
- [x] 11.2 Documentar la clase `.footer-grid`, `.schedule-day`, `.cal-event-editor` para que se mantenga en futuros re-exports

## 12. Commit & PR

- [x] 12.1 Commit con mensaje `feat(website): mobile optimization — fix scroll horizontal + responsive grids`
- [x] 12.2 PR a `development` con resumen de cambios + screenshots mobile+desktop
- [x] 12.3 Cerrar la issue de GitHub con la lista de cambios
