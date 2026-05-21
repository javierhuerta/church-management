## Overview

Tres áreas de trabajo coordinadas:
1. **Sistema de marca** — tokens CSS con la paleta de Adventistas Central Osorno, tipografía con Google Fonts.
2. **Login rediseñado** — logo PNG original, controles de tema y tamaño de texto visibles antes de entrar.
3. **Dark mode completo** — auditoría y corrección de los ~30 archivos con colores hardcodeados en Calendar, WorshipServices, Mantenedores y Dashboard.

---

## 1. Paleta de marca

Derivada del logo oficial (azul marino + dorado, fondo crema):

### Light mode
| Token | HSL | Hex | Uso |
|-------|-----|-----|-----|
| `--primary` | `hsl(219 59% 25%)` | `#1B3A6B` | Botones principales, links activos |
| `--primary-foreground` | `hsl(0 0% 98%)` | `#FAFAFA` | Texto sobre primary |
| `--accent` | `hsl(40 55% 55%)` | `#C9A84C` | Highlights, separadores decorativos, hover secundario |
| `--accent-foreground` | `hsl(219 59% 15%)` | `#102240` | Texto sobre accent |
| `--background` | `hsl(36 50% 97%)` | `#FAF6F0` | Fondo general (crema cálido) |
| `--card` | `hsl(0 0% 100%)` | `#FFFFFF` | Cards, popovers |
| `--foreground` | `hsl(219 40% 12%)` | `#111827` | Texto principal |
| `--muted` | `hsl(36 20% 93%)` | `#EDE9E3` | Fondos secundarios |
| `--muted-foreground` | `hsl(219 15% 45%)` | `#5A6A85` | Texto secundario |
| `--border` | `hsl(36 20% 85%)` | `#DDD7CE` | Bordes |
| `--destructive` | `hsl(0 72% 51%)` | `#DC2626` | Errores |
| `--ring` | `hsl(219 59% 25%)` | `#1B3A6B` | Focus ring |

### Dark mode
| Token | HSL | Uso |
|-------|-----|-----|
| `--background` | `hsl(222 47% 8%)` | Fondo oscuro azulado (no negro puro) |
| `--card` | `hsl(222 35% 12%)` | Cards |
| `--foreground` | `hsl(36 50% 95%)` | Texto principal (crema en oscuro) |
| `--primary` | `hsl(219 70% 60%)` | Azul más claro, legible sobre oscuro |
| `--primary-foreground` | `hsl(222 47% 8%)` | Texto sobre primary en dark |
| `--accent` | `hsl(40 60% 60%)` | Dorado ligeramente más brillante |
| `--muted` | `hsl(222 30% 16%)` | |
| `--muted-foreground` | `hsl(219 15% 65%)` | |
| `--border` | `hsl(222 25% 22%)` | |

### Paleta extendida — colores de estado

Colores semánticos que amplían la paleta base manteniendo coherencia (undertone frío/azulado o neutro cálido). Todos usan fondo sólido con texto blanco (o navy donde el fondo es claro).

| Nombre | Light bg | Light text | Dark bg | Dark text | Uso |
|--------|----------|------------|---------|-----------|-----|
| `status-published` | `#0F766E` (teal-700) | `#FFFFFF` | `#0D9488` (teal-600) | `#FFFFFF` | Publicado, activo, éxito |
| `status-draft` | `#C9A84C` (dorado de marca) | `#102240` (navy) | `#D4B566` (dorado claro) | `#102240` (navy) | Borrador — usa el dorado de marca, texto navy para contraste |
| `status-pending` | `#B45309` (amber-700) | `#FFFFFF` | `#D97706` (amber-600) | `#FFFFFF` | Pendiente, en espera |
| `status-archived` | `#475569` (slate-600) | `#FFFFFF` | `#64748B` (slate-500) | `#FFFFFF` | Archivado, inactivo |
| `status-cancelled` | `#DC2626` (red-600) | `#FFFFFF` | `#EF4444` (red-500) | `#FFFFFF` | Cancelado, error — mismo que `--destructive` |
| `status-info` | `#1B3A6B` (navy/primary) | `#FFFFFF` | `#6B9FDB` (primary dark) | `#FFFFFF` | Info, neutral, confirmado |

**Reglas de uso:**
- Fondo sólido + texto blanco (excepto borrador: texto navy `#102240`)
- El teal armoniza con el navy (mismo undertone frío-azulado)
- El pending amber complementa el dorado sin repetirlo
- El slate frío es coherente con el navy
- Nunca usar clases Tailwind de color directamente para badges de estado — usar los valores hex de esta tabla

---

## 2. Tipografía

```css
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;500;700&family=Playfair+Display:wght@600;700&display=swap');
```

| Rol | Fuente | Peso | Uso |
|-----|--------|------|-----|
| Body / UI | **Lato** | 400, 500, 700 | Todo el texto corrido, labels, botones |
| Display / Heading | **Playfair Display** | 600, 700 | Títulos de módulo (login, dashboard header), no en tablas ni listas |

`font-family` base en `body`: `'Lato', system-ui, sans-serif`

---

## 3. Logo

El logo oficial (PNG con fondo transparente procesado desde el original) se usa directamente — no se dibuja en SVG.

- **Variante completa** (`logo.png`): Símbolo + texto — para login y sidebar expandido.
- **Variante símbolo** (`logo-mark.png`): Solo el ícono del volcán con la llama — para sidebar colapsado.
- **Dark mode**: aplicar `filter: brightness(0) invert(1)` via CSS inline para convertir el navy a blanco.
- Procesado con Pillow: fondo crema removido, exportado como PNG transparente.

---

## 4. Login rediseñado

**Layout**: pantalla dividida en dos mitades en desktop — izquierda con foto/branding, derecha con el formulario. En móvil solo la derecha con el logo arriba.

**Controles visibles en login** (antes de autenticarse):
- **Toggle de tema**: 3 botones icon-only (Sol / Luna / Monitor) en la esquina superior derecha de la pantalla.
- **Selector de tamaño**: desplegable "A" con tamaños S/M/L en la misma zona.

**Componente**: `LoginControls` — extrae la lógica de tema y tamaño que actualmente está solo en el sidebar, haciéndola reutilizable.

---

## 5. defaultTheme = "light"

En `frontend/src/main.tsx`:
```tsx
<ThemeProvider attribute="class" defaultTheme="light" storageKey="theme">
```

El usuario puede cambiarlo desde el login o el sidebar. "Sistema" sigue disponible como opción pero no es el default.

---

## 6. Auditoría dark mode — archivos afectados

Se identificaron ~30 archivos con colores Tailwind hardcodeados. Estrategia de migración:

### Sustituciones estándar
| Color hardcoded | Token semántico |
|-----------------|-----------------|
| `bg-white` | `bg-card` |
| `bg-neutral-50`, `bg-gray-50` | `bg-muted` |
| `bg-neutral-100`, `bg-gray-100` | `bg-muted` |
| `text-neutral-900`, `text-gray-900` | `text-foreground` |
| `text-neutral-500`, `text-gray-500` | `text-muted-foreground` |
| `text-neutral-400`, `text-gray-400` | `text-muted-foreground` |
| `border-neutral-200`, `border-gray-200` | `border-border` |
| `text-blue-600`, `bg-blue-50` | `text-primary`, `bg-primary/10` |
| `text-blue-700`, `bg-blue-100` | `text-primary`, `bg-primary/15` |
| `text-red-*`, `bg-red-*` (alertas/errores) | `text-destructive`, `bg-destructive/10` |
| badges de estado (`bg-green-*`, `bg-yellow-*`, etc.) | valores hex de paleta extendida |

### Módulos con más trabajo
- **Calendar** (13 componentes): event-card, calendar-grid, event-form, wysiwyg-editor, cover-image-picker, etc.
- **WorshipServices** (5 páginas/componentes): program-detail, template-form, templates-list, program-create, program-change-history.
- **Mantenedores** (4 archivos): departments-list, users-list, department-form, mantenedores-layout.
- **Dashboard** (1 página): dashboard-page.

### Componentes UI adicionales
- Revisar `badge.tsx`, `separator.tsx`, `table.tsx`, `tabs.tsx`, `textarea.tsx`, `label.tsx` si tienen colores hardcodeados.

---

## 7. Estructura de archivos nuevos/modificados

```
frontend/src/
├── assets/images/
│   ├── logo.png          ← PNG original procesado (fondo transparente)
│   └── logo-mark.png     ← PNG símbolo recortado (fondo transparente)
├── index.css             ← Paleta de marca + Google Fonts import
├── main.tsx              ← defaultTheme="light"
├── components/
│   ├── login-controls.tsx  ← NUEVO: tema + tamaño reutilizable
│   └── layout/
│       └── sidebar.tsx   ← usa logo-mark.png
└── features/auth/
    ├── pages/login-page.tsx   ← layout 2 columnas + LoginControls
    └── components/login-form.tsx ← tipografía Playfair en heading
```

---

## Decisiones de diseño clave

- **Paleta fría-cálida**: el azul marino da autoridad/institucionalidad, el dorado da calidez espiritual, el crema de fondo evita la frialdad de un blanco puro.
- **Logo PNG no SVG dibujado**: el logo original procesado es fiel a la identidad visual real — dibujar trazos SVG a mano no reproduce bien las letras ni el símbolo.
- **Dark mode del logo**: `filter: brightness(0) invert(1)` convierte el navy a blanco sin necesidad de una segunda imagen.
- **Badges con fondo sólido**: máximo contraste, sin ambigüedad — evita los fondos `*-50` o `*-100` que se pierden sobre fondo crema.
- **Borrador usa el dorado de marca**: único badge con texto oscuro (navy) porque el dorado `#C9A84C` es demasiado claro para texto blanco.
- **Playfair Display solo en headings de primer nivel** — no en tablas, formularios ni labels para mantener legibilidad en uso operativo.
- **No usar `bg-accent`/`text-accent` de Tailwind para badges** — el dorado solo aparece en el badge de borrador via hex directo.
