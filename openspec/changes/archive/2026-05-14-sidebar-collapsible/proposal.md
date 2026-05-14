## Why

El sidebar de la aplicación tiene un ancho fijo de 256px (`w-64`), lo cual causa problemas de usabilidad en pantallas pequeñas (móvil y tablet). Cuando el viewport es reducido, el sidebar ocupa espacio desproporcionado y fuerza el contenido a ser difícil de leer. Se necesita un comportamiento collapsible que se adapte automáticamente según el tamaño de pantalla.

## What Changes

- Sidebar colapsable que alterna entre estado expandido (256px) y colapsado (64px)
- Detección automática del breakpoint vía `window.matchMedia` — no requiere acción del usuario
- Transición animada suave de 300ms para el collapse/expand
- Modo colapsado muestra solo iconos (logo IA + navegación + perfil)
- El icono "IA" en modo colapsado es clickeable para expandir manualmente
- DropdownMenu de perfil (usando shadcn/DropdownMenu de Radix) aparece al hacer click en el icono de perfil cuando está colapsado

## Capabilities

### New Capabilities

- `sidebar-collapsible`: Sistema de sidebar adaptativo con collapse automático según viewport y transición animada suave

## Out of Scope

- Persistencia de preferencia de collapse (el sidebar siempre inicia expandido en desktop)
- Sidebar overlay en mobile (el icono IA no abre un drawer, solo permite expandir)
- Cambio de breakpoints dinámicos (usan Tailwind por defecto `lg: 1024px`)

## Impact

### Frontend
- `frontend/src/components/layout/sidebar.tsx` — lógica de collapse y renderizado condicional
- `frontend/src/layouts/app-layout.tsx` — sin cambios necesarios (Sidebar maneja su propio estado)

### Dependencias
- `@radix-ui/react-dropdown-menu` — ya usado en shadcn/ui, ninguna nueva dependencia requerida
- `lucide-react` — iconos ya en uso