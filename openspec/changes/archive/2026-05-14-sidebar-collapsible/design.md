## Context

El sidebar actual (`sidebar.tsx`) tiene un ancho fijo `w-64` (256px) con navegación expandida y un dropdown de perfil integrado en la parte inferior. No existe ningún mecanismo de collapse para pantallas pequeñas.

El layout principal (`app-layout.tsx`) renderiza el Sidebar junto con el contenido via `<Outlet />`.

## Goals / Non-Goals

**Goals:**
- Collapse automático del sidebar cuando el viewport es menor a 1024px
- Transición visual suave de 300ms
- Interfaz de icono rail (64px) cuando está colapsado
- Logo "IA" clickeable para expandir manualmente
- Profile dropdown funcional usando shadcn/DropdownMenu cuando está colapsado

**Non-Goals:**
- Persistencia de preferencia de collapse en localStorage
- Implementar como drawer/overlay en mobile
- Modificar `app-layout.tsx`
- Breakpoints custom — se usa el breakpoint lg de Tailwind (1024px)

## Decisions

### 1. Detección de breakpoint con `window.matchMedia`

Se usa `window.matchMedia('(max-width: 1023px)')` en lugar de media queries de CSS o hooks como `useMediaQuery`.

**Alternativas consideradas:**
- `useMediaQuery` hook de Next.js — no disponible en React standalone
- CSS `@media (max-width: 1023px)` con `hidden`/`block` — no permite transición animada suave de width
- `ResizeObserver` — overkill para este caso

**Decisión:** `window.matchMedia` con un listener en `useEffect` para actualizar el estado `isCollapsed`.

### 2. Profile dropdown con shadcn/DropdownMenu de Radix

En modo expandido, el profile se muestra como un área clickeable con dropdown manual (actual implementación). En modo colapsado, se reemplaza por el componente `DropdownMenu` de shadcn (que usa Radix UI).

**Alternativas consideradas:**
- Mantener el dropdown manual también en modo colapsado — requiere reposicionar el dropdown, complejidad innecesaria
- Crear un modal para el profile — overkill, el DropdownMenu es suficiente

**Decisión:** DropdownMenu de shadcn en modo colapsado, dropdown manual actual en modo expandido.

### 3. Animación de transición

Se usa clases de Tailwind CSS para la transición:
```
transition-all duration-300 ease-in-out
```

El sidebar cambia entre `w-64` (256px) y `w-16` (64px).

**Alternativas consideradas:**
- Framer Motion — introduce nueva dependencia, el caso de uso es simple
- CSS keyframes custom — más código, menos mantenible

**Decisión:** Tailwind transitions + width change.

### 4. Arquitectura de renderizado

El Sidebar mantiene todo su contenido pero oculta los labels cuando está colapsado:
- Modo expandido: `w-64` + labels visibles
- Modo colapsado: `w-16` + labels ocultos + iconos solos

**Alternativas consideradas:**
- Dos componentes separados (SidebarExpanded / SidebarCollapsed) — duplicación de código
- CSS `overflow-hidden` con `text-overflow: ellipsis` — no permite click en iconos cuando están ocultos

**Decisión:** Estado `isCollapsed` que controla clases condicionales y visibilidad de labels.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| El icono IA clickeable en modo colapsado puede no ser obvio para el usuario | El cursor cambia a `pointer` y se añade hover effect (bg change) |
| El DropdownMenu puede quedar cortado si el sidebar está al borde de la pantalla | Se usa `absolute left-full bottom-0 ml-3` — funciona porque el `<aside>` no tiene `overflow-hidden`; no requiere portal |
| Transición puede ser choppy en dispositivos lentos | 300ms es suficiente para percepción visual sin ser lento |

## Technical Approach

### Estado en Sidebar

```typescript
const [isCollapsed, setIsCollapsed] = useState(false)

useEffect(() => {
  const mediaQuery = window.matchMedia('(max-width: 1023px)')
  const handleChange = (e: MediaQueryListEvent) => {
    setIsCollapsed(e.matches)
  }
  setIsCollapsed(mediaQuery.matches)
  mediaQuery.addEventListener('change', handleChange)
  return () => mediaQuery.removeEventListener('change', handleChange)
}, [])
```

### Estructura condicional del render

```
Sidebar
├── Header (logo)
│   ├── Modo expandido: Logo completo "IA" + "Iglesia Adventista"
│   └── Modo colapsado: Solo "IA" clickeable
├── NavItems
│   ├── Modo expandido: Icon + Label
│   └── Modo colapsado: Solo Icon (tooltip opcional en hover)
└── Profile Section
    ├── Modo expandido: Avatar + nombre + dropdown manual
    └── Modo colapsado: Avatar soloclickeable → DropdownMenu de Radix
```

### Dependencias

No se necesitan nuevas dependencias. El proyecto ya tiene:
- `@radix-ui/react-dropdown-menu` (via shadcn/ui)
- `lucide-react` para iconos

## Post-implementation Amendments

### A. Estado `isSmallScreen` adicional

Durante la implementación se detectó que el usuario podía quedar atrapado en modo expandido en pantalla pequeña: al hacer click en "IA" para expandir, no había forma de volver a colapsar. Se añadió el estado `isSmallScreen` (independiente de `isCollapsed`) para mostrar un botón `ChevronLeft` en el header expandido cuando el viewport es pequeño. `isSmallScreen` solo refleja el tamaño del viewport; `isCollapsed` es el estado visual real (puede divergir cuando el usuario expande manualmente).

### B. DropdownMenu sin portal (posicionamiento CSS puro)

El componente local `@/components/ui/dropdown-menu` no usa los primitivos de Radix (`@radix-ui/react-dropdown-menu`) sino un wrapper CSS simplificado. El dropdown del perfil colapsado se posiciona con `absolute left-full bottom-0 ml-3` respecto al contenedor relativo. Esto funciona correctamente porque el `<aside>` no tiene `overflow: hidden`. Si en el futuro se migra el componente a Radix real, el posicionamiento pasaría a ser automático via portal.