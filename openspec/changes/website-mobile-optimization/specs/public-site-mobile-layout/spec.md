# public-site-mobile-layout

## Purpose

Definir el comportamiento responsive del sitio público (`website/`) en
mobile (viewport ≤ 720px) para garantizar que las 7 páginas se vean
correctamente, sin scroll horizontal, con grids que colapsan a 1-2
columnas, y con el nav mobile usable (cierre al tocar fuera).

## Requirements

### Requirement: Sin scroll horizontal en mobile

El sitio público SHALL renderizarse sin scroll horizontal en todas sus
páginas cuando el viewport es ≤ 720px. Esto SHALL verificarse con la
condición `document.documentElement.scrollWidth === window.innerWidth`.

#### Scenario: Inicio en mobile
- **WHEN** un usuario navega a `/#inicio` con viewport 390×844
- **THEN** la página no presenta scroll horizontal y `document.documentElement.scrollWidth` es 390

#### Scenario: Nosotros en mobile
- **WHEN** un usuario navega a `/#nosotros` con viewport 390×844
- **THEN** la página no presenta scroll horizontal

#### Scenario: Galería en mobile
- **WHEN** un usuario navega a `/#galeria` con viewport 390×844
- **THEN** la página no presenta scroll horizontal y las imágenes de cada colección se apilan en 1 columna

#### Scenario: Horarios en mobile
- **WHEN** un usuario navega a `/#horarios` con viewport 390×844
- **THEN** la página no presenta scroll horizontal y cada bloque día+items colapsa a 1 columna

#### Scenario: Calendario en mobile
- **WHEN** un usuario navega a `/#calendario` con viewport 390×844
- **THEN** la página no presenta scroll horizontal; la vista Mes muestra un mensaje recomendando cambiar a vista Lista

#### Scenario: Programa en mobile
- **WHEN** un usuario navega a `/#programa` con viewport 390×844
- **THEN** la página no presenta scroll horizontal y la tabla de partes colapsa a 1 columna

#### Scenario: En Vivo en mobile
- **WHEN** un usuario navega a `/#envivo` con viewport 390×844
- **THEN** la página no presenta scroll horizontal y la grilla de predicaciones anteriores colapsa a 1 columna

### Requirement: Footer responsive

El footer del sitio público SHALL colapsar de un grid de 3 columnas a
1 columna cuando el viewport es ≤ 720px. En mobile, los textos SHALL
estar centrados y el gap vertical SHALL ser menor (32px en vez de 48px).

#### Scenario: Footer en desktop
- **WHEN** el viewport es > 720px
- **THEN** el footer mantiene el grid de 3 columnas (logo + dirección, contacto, socials) tal como está diseñado

#### Scenario: Footer en mobile
- **WHEN** el viewport es ≤ 720px
- **THEN** el footer se renderiza en 1 columna apilada, con cada bloque centrado horizontalmente

### Requirement: Grids colapsan a 1 columna en mobile

Los grids fijos de N columnas en las páginas SHALL colapsar a 1
columna en mobile (≤ 720px):

- Inicio · "Nuestros Horarios": de 3 columnas a 1
- Inicio · "Momentos" (moments-grid): de 6/2 columnas a 1
- Nosotros · "Junta directiva": de 3 columnas a 1
- Galería · Colecciones: de 6 columnas con `span 2` a 1 imagen por fila
- Horarios · Bloque día + items: de `200px 1fr` a `1fr`
- Horarios · "Puesta de sol": de 4 columnas a 2 columnas (o 1)

#### Scenario: Junta directiva en mobile
- **WHEN** se renderiza `PageNosotros` con viewport 390×844
- **THEN** los 3 miembros de la junta (Pastor, Tesorero, Secretaria) se apilan verticalmente en 1 columna

#### Scenario: Horarios inicio en mobile
- **WHEN** se renderiza `PageInicio` con viewport 390×844
- **THEN** los 3 horarios destacados (Sábado 09:40, 09:45, 11:00) se apilan en 1 columna, no en 3 columnas

#### Scenario: Puesta de sol en mobile
- **WHEN** se renderiza `PageHorarios` con viewport 390×844
- **THEN** los 4 horarios de puesta de sol se muestran en 2 columnas (2×2) o 1 columna, no en 4 columnas

### Requirement: Calendario MonthView mobile

La vista Mes del calendario SHALL no renderizarse como grid de 7
columnas en mobile. SHALL mostrarse un mensaje recomendando cambiar a
vista Lista, con un botón que ejecuta `view = 'lista'`.

#### Scenario: Cambio a vista Mes en mobile
- **WHEN** un usuario con viewport 390×844 toca el toggle "Mes" del calendario
- **THEN** el sistema muestra un mensaje "Esta vista no está optimizada para mobile" y un botón "Ver como lista" que cambia a vista Lista

#### Scenario: Vista Mes en desktop
- **WHEN** un usuario con viewport > 720px selecciona la vista Mes
- **THEN** el sistema renderiza la grilla de 7×6 celdas como siempre

### Requirement: Calendario ListView editor mobile

El editor inline de la vista Lista del calendario (visible para
usuarios con permiso `edit`) SHALL apilar verticalmente sus campos
en mobile:

- Input fecha
- Input hora
- Input título + input lugar + checkbox destacar
- Botón eliminar

#### Scenario: Editor en mobile
- **WHEN** un editor abre `/#calendario` en viewport 390×844 y un evento se renderiza
- **THEN** los 4 elementos del editor (fecha, hora, título+lugar, eliminar) se apilan verticalmente, no en 4 columnas

### Requirement: Nav mobile cierra al tocar fuera

El menú hamburguesa del nav SHALL cerrarse cuando el usuario hace
`mousedown` o `touchstart` fuera del elemento `.nav`.

#### Scenario: Click fuera del nav
- **WHEN** el menú mobile está abierto y el usuario hace tap en cualquier lugar fuera del nav
- **THEN** el menú se cierra (`menuOpen = false`)

#### Scenario: Click dentro del nav
- **WHEN** el menú mobile está abierto y el usuario hace tap en un botón del menú
- **THEN** el menú se cierra por el flujo normal de selección (el handler `go(id)` ya hace `setMenuOpen(false)`)

### Requirement: Compatibilidad con futuros updates de Claude Artifacts

Los cambios de layout mobile SHALL estar centralizados en `website/styles.css` y en clases CSS reutilizables (no en estilos inline dispersos por cada componente). El footer SHALL usar la clase `.footer-grid` para que un update del diseño solo requiera mantener la regla CSS, no tocar cada página.

#### Scenario: Re-generación del export de Claude Artifacts
- **WHEN** se re-genera `website/ui.jsx` o `website/pages-*.jsx` desde Claude Artifacts
- **THEN** los cambios mobile definidos en `styles.css` siguen aplicándose por clase CSS
- **AND** los parches JSX pequeños están documentados en `INTEGRATION.md` para re-aplicar
