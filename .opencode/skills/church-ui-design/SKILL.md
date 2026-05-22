---
name: church-ui-design
description: Design system and visual guidelines for Iglesia Adventista Central Osorno. Load this skill whenever building, modifying, or reviewing any frontend component or page. Covers how colors are actually applied (semantic classes vs inline style), typography without semantic HTML tags, the mandatory mobile/desktop split pattern, dark mode support, Tailwind v4 setup, shadcn/ui config, event cards, status badges, and brand palette. Triggers on: "crear componente", "nuevo componente", "diseñar pantalla", "card", "badge", "tarjeta", "formulario", "sidebar", "layout", "mobile", "responsive", "colores", "tipografía", "dark mode", "rediseñar", "reestructurar".
---

# Church UI Design System — Iglesia Adventista Central Osorno

Referencia visual canónica: `frontend/src/features/theme-preview/theme-preview-page.tsx`
CSS base: `frontend/src/index.css`
shadcn config: `frontend/components.json`

---

## 1. Stack de estilos

| Capa | Detalle |
|---|---|
| CSS framework | **Tailwind CSS v4** — sin `tailwind.config.js`, configurado vía `@theme inline` en `index.css` |
| Componentes base | **shadcn/ui** estilo `new-york`, `cssVariables: true`, `tsx: true` |
| Iconos | **lucide-react** |
| Fuentes | Google Fonts: **Lato** (UI/body) + **Playfair Display** (headings de display) |
| Tema | Light / Dark / System — `ThemeProvider` + clase `.dark` en `<html>` |
| Scroll | `#root` y `body` tienen `overflow: hidden`. Cada página/feature maneja su propio scroll con `overflow-y-auto` |

---

## 2. Cómo se aplican colores — regla fundamental

**Este proyecto usa dos sistemas de color en paralelo. Confundirlos es el error más común.**

### Sistema A: clases semánticas de Tailwind (para estructura y layout)

Usar cuando el color debe cambiar automáticamente entre light y dark mode:

```tsx
// Fondos
className="bg-background"      // crema (light) / navy oscuro (dark)
className="bg-card"            // blanco (light) / navy medio (dark)
className="bg-muted"           // crema suave (light) / navy más oscuro (dark)
className="bg-primary/10"      // navy con 10% opacidad — para iconos activos, pills

// Texto
className="text-foreground"         // navy oscuro (light) / crema (dark)
className="text-muted-foreground"   // gris-azulado (light) / gris claro (dark)
className="text-primary"            // navy (light) / azul claro (dark)

// Bordes
className="border-border"      // crema oscuro (light) / navy con luz (dark)
className="border-primary"     // navy (light) / azul claro (dark)

// Estados interactivos
className="hover:bg-muted"
className="hover:border-primary/40"
className="hover:shadow-md"
```

### Sistema B: `style={{}}` inline con valores exactos (para colores de marca y estado)

Usar cuando el color es un valor de la paleta de marca que NO está en las CSS variables del tema, o cuando necesita un valor preciso para light Y dark mode separadamente:

```tsx
// Constantes de marca — definirlas al tope del archivo
const NAVY = '#1B3A6B'
const GOLD = '#C9A84C'

// Colores de estado — siempre con variante light/dark explícita
const isDark = resolvedTheme === 'dark'
const bg = isDark ? STATUS_COLORS[variant].dark : STATUS_COLORS[variant].light

// Ejemplos de uso correcto
<div style={{ background: isDark ? 'hsl(219,70%,60%)' : NAVY, color: '#fff' }}>
<span style={{ background: GOLD, color: '#102240' }}>
<div style={{ background: isDark ? '#0D9488' : '#0F766E' }}>
```

### Regla de decisión

```
¿El color ya existe como variable CSS del tema? → clase semántica Tailwind
¿Es un color de marca (navy, gold) o de estado (teal, amber, slate)?  → style inline con isDark
¿Es un color dinámico (departamento, tipo de evento)? → style inline calculado en runtime
```

---

## 3. Paleta de marca completa

### Colores fijos de identidad (no cambian con el tema)
```
NAVY  = #1B3A6B   — color primario de la institución, fondos de branding
GOLD  = #C9A84C   — dorado de acento, headings display, decoración, separadores
```

### CSS variables del tema (fuente: `frontend/src/index.css`)

**Light mode `:root`**
```
--background:      hsl(36 50% 97%)    → bg-background   (crema #FAF6F0)
--foreground:      hsl(219 40% 12%)   → text-foreground  (navy oscuro #0F1D35)
--card:            hsl(0 0% 100%)     → bg-card          (blanco)
--primary:         hsl(219 59% 25%)   → text-primary     (navy #1B3A6B)
--secondary:       hsl(36 20% 93%)    → bg-secondary     (crema)
--muted:           hsl(36 20% 93%)    → bg-muted         (crema suave)
--muted-foreground:hsl(219 15% 45%)   → text-muted-foreground (#5A6A85)
--accent:          hsl(40 55% 55%)    → bg-accent / text-accent (dorado)
--destructive:     hsl(0 72% 51%)     → text-destructive (#DC2626)
--border:          hsl(36 20% 85%)    → border-border    (#DDD7CE)
--input:           hsl(36 20% 85%)
--ring:            hsl(219 59% 25%)
--radius:          0.5rem
```

**Dark mode `.dark`**
```
--background:      hsl(222 47% 8%)    (navy muy oscuro)
--foreground:      hsl(36 50% 95%)    (crema claro)
--card:            hsl(222 35% 12%)
--primary:         hsl(219 70% 60%)   (#6B9FDB azul claro)
--secondary:       hsl(222 30% 16%)
--muted:           hsl(222 30% 16%)
--muted-foreground:hsl(219 15% 65%)
--accent:          hsl(40 60% 60%)    (dorado claro #D4B060)
--border:          hsl(222 25% 22%)
--ring:            hsl(219 70% 60%)
```

### Paleta de estado (style inline, siempre con variante light/dark)
```typescript
const STATUS_COLORS = {
  published: { light: '#0F766E', dark: '#0D9488' },  // teal
  draft:     { light: '#C9A84C', dark: '#D4B566' },  // dorado de marca — texto #102240 (no #fff)
  pending:   { light: '#B45309', dark: '#D97706' },  // amber
  archived:  { light: '#475569', dark: '#64748B' },  // slate frío
  cancelled: { light: '#DC2626', dark: '#EF4444' },  // rojo
  info:      { light: '#1B3A6B', dark: '#6B9FDB' },  // navy/primary
}
// Para draft: color de texto = '#102240' (navy oscuro). Para el resto: '#fff'
```

### Colores de tipo de evento (style inline, constante en `labels.ts`)
```typescript
// Fuente: frontend/src/features/calendar/utils/labels.ts → EVENT_TYPE_STYLE
local:     { backgroundColor: '#1B3A6B22', color: '#1B3A6B', dotColor: '#1B3A6B' }  // navy
asach:     { backgroundColor: '#7C3AED22', color: '#5B21B6', dotColor: '#7C3AED' }  // violeta
distrital: { backgroundColor: '#0F766E22', color: '#0F766E', dotColor: '#0F766E' }  // teal
```

### Colores de departamento (calculados en runtime, `getDepartmentStyle` en `labels.ts`)
- Si el departamento tiene `color` hex en BD → se usa directamente
- Si no → hash del nombre sobre hues `[200, 160, 280, 30, 340, 60, 240, 100, 15, 190, 310, 140]`
- Resultado: `dotColor = hsl(hue 65% 40%)`, `bg = hsl(hue 65% 40% / 0.12)`, `text = hsl(hue 65% 35%)`
- Siempre importar y usar `getDepartmentStyle` — no reimplementar la lógica

---

## 4. Tipografía — cómo se aplica en el código

**Importante:** este proyecto NO usa elementos HTML semánticos `<h1>`, `<h2>`, `<h3>` para la jerarquía visual. Se usan `<p>`, `<span>` y `<div>` con clases Tailwind o estilos inline. El peso visual viene de las clases, no del tag HTML.

### Jerarquía y cómo escribirla en JSX

**Display / H1** — Playfair Display, color dorado. Solo para branding y encabezados principales de pantalla.
```tsx
// NO: <h1 className="...">
<p style={{
  fontFamily: '"Playfair Display", Georgia, "Times New Roman", serif',
  fontSize: 38,        // o 16/20/25 según textSize selector
  fontWeight: 700,
  color: GOLD,         // #C9A84C — siempre inline, no clase Tailwind
  lineHeight: 1.15,
  letterSpacing: '-0.01em',
}}>
  Adventistas Central
</p>
```

**Section header / H2** — Playfair Display, color navy (light) o azul claro (dark).
```tsx
<p style={{
  fontFamily: '"Playfair Display", Georgia, serif',
  fontSize: 26,
  fontWeight: 600,
  color: isDark ? '#A8C4F0' : NAVY,
  lineHeight: 1.25,
}}>
  Bienvenido al Sistema
</p>
```

**Module title / H3** — Lato bold, color foreground. Primer nivel con clases Tailwind.
```tsx
<p className="text-2xl font-bold text-foreground">
  Programas de Culto
</p>
```

**Subheading / H4** — Lato semibold, foreground, opcionalmente con acento dorado.
```tsx
<p className="text-lg font-semibold text-foreground">Culto Sabático</p>
// Con separador dorado:
<div className="flex items-baseline gap-2">
  <p className="text-lg font-semibold text-foreground">Culto Sabático</p>
  <span style={{ width: 32, height: 2, background: GOLD, display: 'inline-block', marginBottom: 2 }} />
</div>
```

**Body principal** — Lato, text-foreground.
```tsx
<p className="text-base font-medium text-foreground">Responsable: Pastor Juan González</p>
<p className="text-base text-foreground">El culto divino incluye alabanza...</p>
```

**Texto secundario** — text-muted-foreground.
```tsx
<p className="text-sm text-muted-foreground">Última modificación: hace 2 horas</p>
```

**Metadata / timestamps** — text-xs, text-muted-foreground.
```tsx
<p className="text-xs text-muted-foreground">ID: PRG-2024-0524 · Estado: Publicado</p>
```

**Label de formulario** — uppercase, tracking, Lato 600.
```tsx
// Branded (login, secciones de marca):
<label style={{ fontSize: 11, fontWeight: 600, color: muted, display: 'block', marginBottom: 5, letterSpacing: '0.03em' }}>
  CORREO ELECTRÓNICO
</label>
// Estándar con shadcn:
<label className="text-sm font-medium text-foreground">Nombre del evento</label>
```

### Selector de tamaño de texto (`useTextSize`)
El contexto `TextSizeContext` agrega clase al `<html>`: `text-sm` (small), `text-base` (medium), `text-lg` (large).
Para elementos que escalan con este selector, usar fontSize variable:
```tsx
const sizeMap = { small: 16, medium: 20, large: 25 }
style={{ fontSize: sizeMap[textSize] }}
```

---

## 5. Patrón mobile / desktop — OBLIGATORIO para componentes de datos

Cualquier componente que muestra contenido estructurado (cards, listas, tablas, calendarios) **debe tener una versión mobile y una desktop** si el layout o la información mostrada difiere significativamente.

### Por qué es obligatorio
- Mobile: espacio reducido, touch, scroll vertical. Prioriza la imagen/cover como entrada visual, muestra información completa en nombre de departamento.
- Desktop: más espacio, hover disponible, contexto del grid. Usa popovers para detalle sin navegar, muestra siglas en lugar de nombres completos.

### Patrón de implementación
```tsx
// El componente público exporta un switcher responsive
export function EventCard({ event, compact = false }: EventCardProps) {
  return (
    <>
      <div className="md:hidden">
        <MobileEventCard event={event} compact={compact} />
      </div>
      <div className="hidden md:block">
        <DesktopEventCard event={event} compact={compact} />
      </div>
    </>
  )
}

// Cada variante se define como función interna separada
function MobileEventCard({ event, compact }: EventCardProps) { ... }
function DesktopEventCard({ event, compact }: EventCardProps) { ... }
```

### Qué cambia entre variantes

| Elemento | Mobile | Desktop |
|---|---|---|
| Cover image | Header h-32, siempre visible | Solo en popover (aspect-video) |
| Nombre departamento | Nombre completo bajo el título | Sigla como badge |
| Interacción detalle | Tap → navega a detalle | Hover → Popover (sin navegar) |
| Info visible | Todo en la card | Mínimo en card, todo en popover |
| Organizers | Listados en card | En popover |

### Popover on hover (patrón desktop)
```tsx
const [open, setOpen] = useState(false)
const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

function handleMouseEnter() {
  if (closeTimer.current) clearTimeout(closeTimer.current)
  setOpen(true)
}
function handleMouseLeave() {
  closeTimer.current = setTimeout(() => setOpen(false), 150) // delay para mover el mouse al popover
}

<Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger asChild>
    <Link to={...} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <CardContent />
    </Link>
  </PopoverTrigger>
  <PopoverContent
    side="right" align="start" sideOffset={8}
    className="p-0 overflow-hidden w-72"
    onOpenAutoFocus={(e) => e.preventDefault()}
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
  >
    <PopoverDetail />
  </PopoverContent>
</Popover>
```

---

## 6. Componentes — patrones de estructura

### Tarjeta base (sección, módulo, contenedor)
```tsx
// Sección principal
<div className="rounded-xl border border-border bg-card p-6 space-y-4">
// Card interna con hover
<div className="rounded-lg border border-border bg-card hover:shadow-md transition-shadow p-4">
```

### Event card — border por estado
```tsx
// El border cambia según el estado del evento (no solo el badge)
const borderClass = isDraft
  ? 'border-dashed border-accent/60 opacity-80'
  : isArchived
  ? 'border-border/50 opacity-60'
  : 'border-border hover:border-primary/40'

<div className={`rounded-xl border bg-card overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-px ${borderClass}`}>
```

### Dot de color (tipo o departamento)
```tsx
// Indicador visual pequeño — siempre con color inline
<span
  className="mt-1 h-2 w-2 rounded-full flex-shrink-0"
  style={{ backgroundColor: deptStyle ? deptStyle.dotColor : typeStyle.dotColor }}
/>
```

### Badge de tipo / departamento
```tsx
// Clase base — siempre esta estructura, colores siempre inline
<span
  className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
  style={{ backgroundColor: typeStyle.backgroundColor, color: typeStyle.color }}
>
  {label}
</span>
```

### Badge de estado (status badge genérico)
```tsx
// Fondo sólido, texto #fff (excepto draft que usa #102240)
<span style={{
  background: isDark ? STATUS_COLORS[variant].dark : STATUS_COLORS[variant].light,
  color: variant === 'draft' ? '#102240' : '#fff',
  borderRadius: 9999,
  padding: '2px 10px',
  fontSize: 12,
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
}}>
  {label}
</span>
```

### Status badge en event-card (con ícono y texto)
```tsx
// Solo se muestra si status !== 'published' (publicado es el estado "normal")
{statusCfg && status !== 'published' && (
  <span
    className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto"
    style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
  >
    {statusCfg.icon}  {/* ícono Clock (published), Archive (archived), nada (draft) */}
    {statusCfg.label}
  </span>
)}
// Acento al fondo de la card solo para publicados:
{status === 'published' && <div className="h-0.5 bg-primary/30" />}
```

### Tab navigation
```tsx
<div className="flex flex-wrap gap-1 bg-muted rounded-lg p-1 w-fit">
  <button
    onClick={() => setActiveTab(key)}
    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
      activeTab === key
        ? 'bg-background text-foreground shadow-sm'
        : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    {label}
  </button>
</div>
```

### Toggle (tema / tamaño de texto)
```tsx
<div className="flex items-center gap-1 bg-muted rounded-lg p-1">
  <button className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
    active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
  }`}>
    <Icon className="h-3.5 w-3.5" />
    <span className="hidden sm:inline">{label}</span>
  </button>
</div>
```

### Sidebar nav item
```tsx
<div className={`flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
  active
    ? 'bg-primary/10 text-primary font-semibold border-r-2 border-primary'
    : 'text-muted-foreground hover:bg-muted'
}`}>
  <Icon className="h-4 w-4" />
  {label}
</div>
```

### Botones con paleta de marca
```tsx
// Primary (navy/primary)
<button style={{
  background: isDark ? 'hsl(219,70%,60%)' : NAVY,
  color: isDark ? 'hsl(222,47%,8%)' : '#FAFAFA',
  border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 600,
}}>

// Outline
<button style={{
  background: 'transparent',
  color: isDark ? 'hsl(219,70%,60%)' : NAVY,
  border: `1.5px solid ${isDark ? 'hsl(219,70%,60%)' : NAVY}`,
  borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 500,
}}>

// Secondary / ghost
<button style={{
  background: isDark ? 'hsl(222,30%,16%)' : 'hsl(36,20%,93%)',
  color: isDark ? 'hsl(36,50%,95%)' : 'hsl(219,40%,12%)',
  border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14,
}}>

// Destructive
<button style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px' }}>
```

### Alerta / feedback
```tsx
// Usa STATUS_COLORS: success→published, error→cancelled, info→info
<div style={{ background: bg, borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
  <Icon style={{ color: '#fff', width: 16, height: 16, marginTop: 2, flexShrink: 0 }} />
  <div>
    <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>{title}</p>
    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, margin: '2px 0 0' }}>{body}</p>
  </div>
</div>
```

### Cover image con fallback
```tsx
import defaultCover from '@/assets/images/default-cover.jpg'

// Mobile: h-32 fija
<div
  className="w-full h-32 overflow-hidden relative bg-muted"
  style={{ backgroundColor: (deptStyle?.dotColor ?? typeStyle.dotColor) + '33' }}
>
  <img src={event.coverImageUrl ?? defaultCover} alt="" aria-hidden className="w-full h-full object-cover" />
</div>

// Desktop popover: aspect-video
<div className="w-full aspect-video overflow-hidden relative bg-muted"
  style={{ backgroundColor: (deptStyle?.dotColor ?? typeStyle.dotColor) + '33' }}>
  <img src={event.coverImageUrl ?? defaultCover} alt="" aria-hidden className="w-full h-full object-cover" />
</div>
```

### Separadores de sección en listas
```tsx
// Separador de mes (en calendar-list)
<div className="flex items-center gap-3">
  <div className="h-px flex-1 bg-border" />
  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Mayo 2026</span>
  <div className="h-px flex-1 bg-border" />
</div>
```

---

## 7. Dark mode — detección y uso

```tsx
import { useTheme } from '@/components/theme-provider'

const { theme, resolvedTheme } = useTheme()
const isDark = resolvedTheme === 'dark'
// resolvedTheme resuelve 'system' → 'light' | 'dark'
// Usar siempre resolvedTheme para isDark, no theme directamente
```

Todo componente que use colores de marca (NAVY, GOLD, STATUS_COLORS, EVENT_TYPE_STYLE) debe recibir o calcular `isDark` y aplicar la variante correcta.

---

## 8. Logo

```tsx
import logoFullPng  from '@/assets/images/logo.png'       // logotipo completo
import logoMarkPng  from '@/assets/images/logo-mark.png'  // símbolo solo

// Light: sin filtro. Dark: invert a blanco
<img
  src={logoFullPng}
  alt="Iglesia Adventista Central Osorno"
  className="w-full h-full object-contain"
  style={isDark ? { filter: 'brightness(0) invert(1)' } : undefined}
/>
```

Tamaños de referencia: LogoFull ≈ 100×110px, LogoMark ≈ 60×68px, sidebar ≈ 28×32px.

---

## 9. Configuración técnica

### Tailwind v4
- No existe `tailwind.config.js` — todo en `index.css` con `@theme inline { --color-* }`
- `bg-primary/10` funciona con slash opacity sobre CSS variables
- Fuentes se importan desde Google Fonts en `index.css`, no via Tailwind

### shadcn/ui
```json
{ "style": "new-york", "rsc": false, "tsx": true,
  "tailwind": { "config": "", "css": "src/index.css", "baseColor": "neutral", "cssVariables": true },
  "iconLibrary": "lucide",
  "aliases": { "components": "@/components", "utils": "@/lib/utils", "ui": "@/components/ui" } }
```
Agregar componentes: `npx shadcn@latest add <component>` desde `frontend/`.

### Scroll de páginas
`#root` y `body` tienen `overflow: hidden`. Cada página maneja su scroll:
- Dentro de `AppLayout`: el scroll ya lo provee el div con `overflow-y-auto` del layout
- Fuera de `AppLayout` (ej. `/theme-preview`, `/login`): el componente raíz necesita `h-screen overflow-y-auto`

---

## 10. Reglas de diseño

- **Bordes redondeados**: `rounded-lg` (8px) para cards internas y elementos, `rounded-xl` (12px) para secciones y contenedores
- **Sombras**: solo `shadow-sm` (base) y `hover:shadow-md transition-shadow` (hover) — nunca sombras grandes
- **Transiciones**: `transition-all`, `transition-colors`, `transition-shadow` — siempre especificar qué transiciona
- **Spacing**: escala Tailwind estándar `gap-1/2/3/4/6` — no valores arbitrarios salvo excepción
- **GOLD es decorativo**: nunca usarlo como fondo de botón interactivo principal — solo para separadores, headings display, branding
- **No CSS plano**: toda clase va en `className` o en `style={{}}` inline — nunca archivos `.css` adicionales
- **Opacidad de Tailwind**: preferir `text-foreground/70` o `bg-primary/10` sobre `opacity-70` en el elemento completo
- **line-clamp**: usar `line-clamp-2` para títulos en cards — nunca dejar títulos sin truncamiento en contenedores de ancho fijo
