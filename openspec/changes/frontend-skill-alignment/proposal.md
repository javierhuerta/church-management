## Why

Las skills instaladas en el frontend (tailwind-v4-shadcn, shadcn, react-best-practices, react-hook-form, vite, zod, composition-patterns) definen patrones y restricciones específicas que el código actual no sigue: el `index.css` está prácticamente vacío sin la arquitectura de variables CSS que Tailwind v4 requiere, los componentes UI usan colores hardcodeados en vez de tokens semánticos, hay llamadas `fetch()` directas que deberían ir por el cliente OpenAPI generado, el barrel file de worship-services existe contrario a las buenas prácticas de bundle, y no hay soporte de dark mode a pesar de que `next-themes` ya está instalado. Corregir esto ahora evita acumular deuda técnica a medida que el proyecto crece y hace que las skills sean efectivamente útiles para el agente.

## What Changes

- **Sistema de temas CSS (Tailwind v4)**: reestructurar `src/index.css` con la arquitectura `:root` → `.dark` → `@theme inline` → `@layer base` que la skill `tailwind-v4-shadcn` requiere; corregir `components.json` (campo `config` debe ser `""`)
- **Dark mode completo**: implementar `ThemeProvider` con `next-themes`, toggle en el sidebar (junto al selector de tamaño de texto existente), persistencia en `localStorage`, soporte a preferencia del sistema operativo, y compatibilidad del `Sonner` toaster con el tema activo
- **Tokens semánticos en componentes UI shadcn**: reemplazar colores hardcodeados (`bg-red-500`, `bg-neutral-900`, `border-neutral-200`, `bg-white`, etc.) por tokens semánticos (`bg-destructive`, `bg-primary`, `bg-card`, `border-border`, etc.) en todos los componentes de `src/components/ui/`
- **Tokens semánticos en páginas y layouts**: misma corrección en archivos de features y layouts que usen colores raw (`bg-white`, `text-neutral-*`, `border-neutral-*`, `bg-blue-*`)
- **Eliminar `fetch()` directo en hooks**: migrar `use-worship-services.ts` (useUserSearch) y `use-cover-upload.ts` para usar el cliente OpenAPI generado; el generador de OpenAPI es la fuente de verdad para servicios e interfaces del backend
- **Limpiar archivos legacy**: eliminar `src/lib/api-client.ts` (duplicado de la config OpenAPI), eliminar `src/lib/api/config.ts` (no se usa en ningún lado), eliminar barrel file `src/features/worship-services/index.ts`

## Capabilities

### New Capabilities

- `frontend-theme-system`: Sistema de variables CSS y tokens semánticos de Tailwind v4 completamente configurado para soportar temas light/dark, con ThemeProvider, toggle en sidebar, persistencia de preferencia y soporte a preferencia del sistema operativo

### Modified Capabilities

- `login-ui`: El formulario de login usa colores raw que deben migrar a tokens semánticos
- `sidebar-navigation`: El sidebar usa colores raw (`bg-blue-*`, `text-neutral-*`) que migran a tokens semánticos; se agrega toggle de dark mode junto al selector de tamaño de texto existente
- `worship-service-programs`: El hook `useUserSearch` usa `fetch()` directo en lugar del cliente OpenAPI; páginas usan colores raw
- `event-cover-image`: `use-cover-upload.ts` usa `fetch()` directo y `API_URL` legacy para el upload de portadas
- `app-layout`: Los layouts usan colores raw que deben migrar a tokens semánticos

## Impact

- **Frontend — `src/index.css`**: reescritura completa con arquitectura Tailwind v4 + paleta neutral completa light/dark
- **Frontend — `frontend/components.json`**: campo `tailwind.config` pasa de `"tailwind.config.js"` a `""`
- **Frontend — `src/main.tsx`**: agregar `ThemeProvider` wrapeando la app
- **Frontend — `src/components/theme-provider.tsx`**: nuevo archivo con `ThemeProvider` y `useTheme`
- **Frontend — `src/components/ui/sonner.tsx`**: conectar al tema activo via `useTheme`
- **Frontend — `src/components/ui/*.tsx`**: button, card, input, dropdown-menu, accordion, calendar, command, alert-dialog — reemplazo de clases hardcodeadas
- **Frontend — `src/layouts/*.tsx`**: app-layout, public-layout, adaptive-layout — reemplazo de clases hardcodeadas
- **Frontend — `src/components/layout/sidebar.tsx`**: reemplazo de clases + agregar toggle dark mode
- **Frontend — `src/features/worship-services/hooks/use-worship-services.ts`**: migrar `useUserSearch` a `AuthService`
- **Frontend — `src/features/calendar/hooks/use-cover-upload.ts`**: migrar `uploadEventCover` a `CalendarService`
- **Frontend — eliminados**: `src/lib/api-client.ts`, `src/lib/api/config.ts`, `src/features/worship-services/index.ts`
- **Frontend — páginas afectadas**: `user-form-page.tsx`, `program-detail-page.tsx`, `programs-list-page.tsx`, `login-page.tsx`
- **Sin impacto en backend**: todos los cambios son estrictamente de frontend

## Fuera del alcance

- Migrar a `FieldGroup`/`Field` del nuevo shadcn para formularios (requiere instalar nuevos componentes, es un refactor mayor separado)
- Agregar `ToggleGroup` para reemplazar option sets — cambio de UX, fuera del scope técnico
- Tests automáticos de componentes
- Cambios al backend o al proceso de generación OpenAPI
- Migrar `space-y-*` a `flex flex-col gap-*` — cambio estético sin impacto funcional, posterior
