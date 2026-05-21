## 1. CSS Base y Configuración Tailwind v4

- [x] 1.1 Reescribir `frontend/src/index.css` con la arquitectura completa: `:root` con paleta neutral light, bloque `.dark` con paleta neutral dark, bloque `@theme inline` mapeando todos los tokens a utility classes de Tailwind, y `@layer base` con estilos base de body y borders
- [x] 1.2 Actualizar `frontend/components.json`: cambiar `tailwind.config` de `"tailwind.config.js"` a `""` (string vacío requerido por Tailwind v4)
- [x] 1.3 Verificar en el browser que utility classes semánticas existen y aplican correctamente: `bg-background`, `bg-card`, `bg-primary`, `bg-destructive`, `text-foreground`, `text-muted-foreground`, `border-border`

## 2. ThemeProvider y Dark Mode

- [x] 2.1 Crear `frontend/src/components/theme-provider.tsx` con `ThemeProvider` (usando `next-themes`, `attribute="class"`, `defaultTheme="system"`, `storageKey="theme"`) y exportar `useTheme` re-exportando desde `next-themes`
- [x] 2.2 Envolver la app en `frontend/src/main.tsx` con `ThemeProvider` (debe quedar dentro de `StrictMode`, fuera de `QueryClientProvider` no es necesario — puede ir dentro)
- [x] 2.3 Actualizar `frontend/src/components/ui/sonner.tsx` para leer el tema activo via `useTheme()` de `next-themes` y pasar `resolvedTheme` como prop `theme` al componente `Sonner`, eliminando el `theme="light"` hardcodeado
- [x] 2.4 Agregar toggle de dark mode en `frontend/src/components/layout/sidebar.tsx`: tres opciones (Claro / Oscuro / Sistema) con iconos de Lucide (Sun, Moon, Monitor), en la misma sección del dropdown donde está el selector de tamaño de texto, usando `useTheme()` para leer y cambiar el tema

## 3. Migración de Tokens — Componentes UI

- [x] 3.1 Migrar `frontend/src/components/ui/button.tsx`: reemplazar `bg-neutral-900` → `bg-primary`, `bg-red-500` → `bg-destructive`, `border-neutral-200` → `border-border`, `hover:bg-neutral-100` → `hover:bg-accent`, `hover:text-neutral-900` → `hover:text-accent-foreground`, `focus-visible:ring-neutral-950` → `focus-visible:ring-ring`, `text-neutral-900` → `text-foreground`
- [x] 3.2 Migrar `frontend/src/components/ui/card.tsx`: reemplazar colores hardcodeados por tokens semánticos (`bg-card`, `text-card-foreground`, `border-border`)
- [x] 3.3 Migrar `frontend/src/components/ui/input.tsx`: tokens semánticos (`border-border`, `bg-background`, `text-foreground`, `ring-ring`)
- [x] 3.4 Migrar `frontend/src/components/ui/dropdown-menu.tsx`: tokens semánticos en todos los estados (hover, focus, destructive items)
- [x] 3.5 Migrar `frontend/src/components/ui/accordion.tsx`: tokens semánticos (`border-border`, `text-foreground`, hover states)
- [x] 3.6 Migrar `frontend/src/components/ui/calendar.tsx`: tokens semánticos para días seleccionados, rangos, estados hover y disabled
- [x] 3.7 Migrar `frontend/src/components/ui/command.tsx`: tokens semánticos para el combobox y sus items
- [x] 3.8 Migrar `frontend/src/components/ui/alert-dialog.tsx`: tokens semánticos (`bg-background`, `border-border`, `text-foreground`, botón destructive)
- [x] 3.9 Verificar visualmente los 8 componentes en light y dark mode en el browser

## 4. Migración de Tokens — Layouts

- [x] 4.1 Migrar `frontend/src/layouts/app-layout.tsx`: reemplazar `bg-neutral-50` → `bg-muted`, `border-neutral-200` → `border-border`, `bg-white` → `bg-card`, `text-neutral-500` → `text-muted-foreground`, `text-neutral-400` → `text-muted-foreground`
- [x] 4.2 Migrar `frontend/src/layouts/public-layout.tsx`: mismos reemplazos que app-layout; eliminar clases `bg-neutral-50`, `border-neutral-200`, `bg-white`, `text-blue-600`
- [x] 4.3 Migrar `frontend/src/layouts/adaptive-layout.tsx` si tiene colores hardcodeados: mismos reemplazos

## 5. Migración de Tokens — Sidebar

- [x] 5.1 Migrar colores hardcodeados en `frontend/src/components/layout/sidebar.tsx`: `bg-white` → `bg-card`, `border-neutral-200` → `border-border`, estados activos `bg-blue-50 text-blue-600` → `bg-primary/10 text-primary`, hover `hover:bg-neutral-100` → `hover:bg-accent`, textos `text-neutral-*` → `text-foreground` / `text-muted-foreground`
- [x] 5.2 Verificar que el sidebar se ve correctamente en modo colapsado y expandido, en light y dark

## 6. Migración de Tokens — Páginas

- [x] 6.1 Migrar `frontend/src/features/auth/pages/login-page.tsx` y `frontend/src/features/auth/components/login-form.tsx`: tokens semánticos en card, inputs, errores (`text-destructive`), fondo
- [x] 6.2 Migrar `frontend/src/features/mantenedores/pages/user-form-page.tsx`: reemplazar `bg-white border-neutral-200` del card del formulario por `bg-card border-border`; `text-neutral-*` por tokens semánticos
- [x] 6.3 Migrar `frontend/src/features/worship-services/pages/program-detail-page.tsx`: colores raw de status badges, fondos de sección, textos secundarios → tokens semánticos
- [x] 6.4 Migrar `frontend/src/features/worship-services/pages/programs-list-page.tsx`: colores raw en filtros, badges de status, fondos → tokens semánticos
- [x] 6.5 Verificar visualmente las 4 páginas en light y dark mode

## 7. Migración de Hooks a Cliente OpenAPI

- [x] 7.1 Verificar la firma exacta de `AuthService.authControllerAutocomplete` en `frontend/src/lib/api/services/AuthService.ts` y el tipo de retorno generado
- [x] 7.2 Reemplazar `useUserSearch` en `frontend/src/features/worship-services/hooks/use-worship-services.ts`: eliminar el `fetch()` directo y usar `AuthService.authControllerAutocomplete(query)` — actualizar el tipo de retorno al tipo generado
- [x] 7.3 Verificar la firma exacta de `CalendarService.calendarControllerUploadCover` en `frontend/src/lib/api/services/CalendarService.ts` y el tipo `UploadCoverDto`
- [x] 7.4 Reemplazar `uploadEventCover` en `frontend/src/features/calendar/hooks/use-cover-upload.ts`: eliminar el `fetch()` directo y `import { API_URL }`, usar `CalendarService.calendarControllerUploadCover(eventId, { file, sourceAuthor, sourceUrl })` — agregar cast `as unknown as string` en `file` si TypeScript lo requiere
- [x] 7.5 Probar el flujo completo de upload de portada en el browser para confirmar que el token se inyecta correctamente y el upload funciona

## 8. Limpieza de Archivos Legacy

- [x] 8.1 Confirmar con `grep` que ningún archivo importa desde `@/lib/api-client` — luego eliminar `frontend/src/lib/api-client.ts`
- [x] 8.2 Confirmar con `grep` que ningún archivo importa desde `@/lib/api/config` — luego eliminar `frontend/src/lib/api/config.ts`
- [x] 8.3 Confirmar con `grep` que ningún archivo importa desde `@/features/worship-services` (barrel) — luego eliminar `frontend/src/features/worship-services/index.ts`
- [x] 8.4 Ejecutar `npm run build` en `frontend/` y confirmar que compila sin errores TypeScript ni imports rotos
