## Context

El frontend usa Tailwind CSS v4 con shadcn/ui, pero fue inicializado con configuración mínima y el código fue escrito antes de que las skills estuvieran activas. Cinco categorías de deuda técnica identificadas tras revisión del codebase:

1. **CSS/Tema**: `index.css` tiene solo `@import "tailwindcss"` sin la arquitectura de variables que v4 requiere. Los utility classes semánticos como `bg-background` o `text-muted-foreground` no existen actualmente porque falta el bloque `@theme inline`.
2. **Dark mode ausente**: `next-themes` está en `package.json` pero no implementado. El componente `Sonner` tiene `theme="light"` hardcodeado. `TextSizeProvider` en `src/lib/contexts/text-size-context.tsx` demuestra el patrón correcto de preferencia de usuario con `localStorage` y clase en `<html>`.
3. **Tokens de color**: Componentes UI y páginas usan valores raw de Tailwind (`bg-red-500`, `bg-white`, `border-neutral-200`, `bg-blue-600`) en lugar de los tokens semánticos del design system.
4. **Llamadas directas a API**: Tres `fetch()` directos existen fuera del cliente OpenAPI generado: `useUserSearch` (`/auth/autocomplete`), `uploadEventCover` (`/api/calendar/:id/cover`), y `fetchAsDataUrl` en `cover-search-tab.tsx`. Los dos primeros tienen servicios generados equivalentes (`AuthService.authControllerAutocomplete` y `CalendarService.calendarControllerUploadCover`). El tercero es una descarga de imagen externa (Unsplash), que es legítimamente `fetch()` nativo.
5. **Archivos legacy**: `src/lib/api-client.ts` exporta solo `API_URL` (un string duplicado de la config OpenAPI). `src/lib/api/config.ts` define `configureOpenAPI()` con `require()` que no se llama en ningún lugar. El barrel `src/features/worship-services/index.ts` exporta todo el feature pero no es importado en `App.tsx` (que ya usa lazy imports directos).

## Goals / Non-Goals

**Goals:**
- `index.css` con arquitectura completa Tailwind v4: `:root` (light) → `.dark` (dark overrides) → `@theme inline` (mapeo a utility classes) → `@layer base` (estilos base)
- `components.json` con `tailwind.config: ""` (corrección para v4)
- `ThemeProvider` de `next-themes` wrapeando la app en `main.tsx`
- `useTheme` hook disponible para toggle y para conectar `Sonner`
- Toggle dark mode en sidebar, integrado junto al selector de tamaño de texto
- Todos los componentes `src/components/ui/*.tsx` usando tokens semánticos
- Páginas y layouts usando tokens semánticos
- `useUserSearch` usando `AuthService.authControllerAutocomplete()`
- `uploadEventCover` usando `CalendarService.calendarControllerUploadCover()`
- Eliminar `src/lib/api-client.ts`, `src/lib/api/config.ts`, `src/features/worship-services/index.ts`

**Non-Goals:**
- Implementar selector de tema en páginas públicas/login (solo en sidebar del app autenticado)
- Instalar nuevos componentes shadcn (`FieldGroup`, `Field`, `Empty`, `Skeleton`, `Badge`)
- Migrar `space-y-*` a `flex flex-col gap-*` (estético, sin impacto funcional)
- Cambios al backend o al proceso `npm run generate:api`
- Auditoría de contraste WCAG (es un trabajo separado de accesibilidad)

## Decisions

### D1: Arquitectura de `index.css` — paleta `neutral` completa

La skill `tailwind-v4-shadcn` provee el template con la arquitectura correcta. Se usará paleta `neutral` (coincide con `baseColor: "neutral"` en `components.json`) con todos los tokens shadcn: background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, radius, chart-1..5. Tanto `:root` (light) como `.dark` necesitan los valores completos.

**Por qué `@theme inline` y no `tailwind.config.ts`**: En Tailwind v4, `tailwind.config.ts` ya no registra colores como utility classes. La única forma es mapear variables CSS en `@theme inline { --color-primary: var(--primary); }`. Sin este bloque, `bg-primary` simplemente no existe como clase CSS.

**`components.json`**: El campo `tailwind.config` debe ser `""` (string vacío) en v4 — la skill lo documenta explícitamente como gotcha #6.

### D2: Dark mode — `next-themes` con clase `.dark` en `<html>`

`next-themes` es la opción correcta dado que ya está instalado (`^0.4.6`). Tailwind v4 con shadcn usa la clase `.dark` en el elemento `<html>` para activar los tokens del bloque `.dark` en `index.css`.

```
ThemeProvider (next-themes, attribute="class")
  → agrega/quita .dark en <html>
  → CSS: .dark { --background: ...; } activa
  → Tailwind @theme inline mapea al utility class
  → bg-background refleja el tema activo
```

**Patrón de toggle**: Seguir el mismo patrón que `TextSizeProvider` — preferencia persiste en `localStorage` (key: `'theme'`), soporte a `'system'` que lee `prefers-color-scheme`. El toggle vive en el sidebar, en la sección de preferencias del usuario (donde ya está el selector de tamaño de texto).

**`defaultTheme: 'system'`**: Por defecto respetar la preferencia del sistema operativo. El usuario puede forzar light o dark desde el sidebar.

**`Sonner`**: Actualmente tiene `theme="light"` hardcodeado. Se conecta al tema activo usando `useTheme()` de `next-themes`:
```tsx
const { resolvedTheme } = useTheme()
<Sonner theme={resolvedTheme as 'light' | 'dark'} ... />
```

### D3: Tokens semánticos — mapeo de clases

Migración de raw → semántico para garantizar que dark mode funcione automáticamente en todos los componentes:

| Raw (actual) | Semántico (objetivo) | Contexto |
|---|---|---|
| `bg-white` | `bg-card` | contenedores/cards |
| `bg-white` | `bg-background` | layouts raíz |
| `bg-neutral-900` | `bg-primary` | button default |
| `bg-red-500` | `bg-destructive` | button destructive |
| `border-neutral-200` | `border-border` | borders generales |
| `text-neutral-900` | `text-foreground` | texto principal |
| `text-neutral-500` | `text-muted-foreground` | texto secundario |
| `text-neutral-400` | `text-muted-foreground` | texto terciario |
| `hover:bg-neutral-100` | `hover:bg-accent` | hover states |
| `hover:text-neutral-900` | `hover:text-accent-foreground` | hover text |
| `bg-neutral-50` | `bg-muted` | fondos sutiles |
| `bg-blue-600` / `text-blue-*` (activo) | `bg-primary` / `text-primary` | estados activos |
| `focus-visible:ring-neutral-950` | `focus-visible:ring-ring` | focus rings |

**Componentes UI a migrar**: `button.tsx`, `card.tsx`, `input.tsx`, `dropdown-menu.tsx`, `accordion.tsx`, `calendar.tsx`, `command.tsx`, `alert-dialog.tsx`

**Layouts a migrar**: `app-layout.tsx`, `public-layout.tsx`, `adaptive-layout.tsx`, `sidebar.tsx`

**Páginas a migrar** (colores raw visibles): `user-form-page.tsx`, `program-detail-page.tsx`, `programs-list-page.tsx`, `login-page.tsx`

### D4: Migración de `fetch()` directo — usar servicios OpenAPI generados

**`useUserSearch`** en `use-worship-services.ts`:
- Antes: `fetch('/auth/autocomplete?q=...', { headers: { Authorization: Bearer token } })`
- Después: `AuthService.authControllerAutocomplete(query)` — el cliente OpenAPI gestiona el token automáticamente via `OpenAPI.TOKEN` (configurado en `setup.ts`)
- Tipo actual hardcodeado: `{ id: string; name: string; email: string }[]` — reemplazar por el tipo generado del servicio

**`uploadEventCover`** en `use-cover-upload.ts`:
- Antes: `fetch('${API_URL}/api/calendar/${eventId}/cover', { method: 'POST', FormData, Authorization })`
- Después: `CalendarService.calendarControllerUploadCover(eventId, { file, sourceAuthor, sourceUrl })` — `UploadCoverDto` ya está generado y el cliente maneja `multipart/form-data`
- Se elimina la dependencia a `API_URL` de `api-client.ts` en este hook

**`fetchAsDataUrl`** en `cover-search-tab.tsx`:
- Esta llamada descarga una imagen desde una URL externa (Unsplash CDN) para convertirla a DataURL antes de pasarla al cropper. No hay servicio generado para esto porque no pasa por el backend propio. **Se mantiene como `fetch()` nativo** — es el único caso legítimo.

### D5: Limpieza de archivos legacy

**`src/lib/api-client.ts`**: Solo exporta `API_URL`. Tiene un único consumidor (`use-cover-upload.ts`) que desaparece al aplicar D4. Eliminar.

**`src/lib/api/config.ts`**: Define `configureOpenAPI()` usando `require()` (incompatible con ESM del proyecto). Ningún archivo lo importa (`grep` lo confirma — solo `config.ts` tiene la definición). Eliminar.

**`src/features/worship-services/index.ts`**: Barrel file. `App.tsx` ya importa directamente desde los archivos de páginas usando `lazy()`. Ningún otro archivo importa desde el barrel (`grep` confirma). Eliminar.

## Risks / Trade-offs

**[Riesgo] Flash of Unstyled Content (FOUC) en dark mode** → Al cambiar de tema, existe un breve instante donde `<html>` no tiene clase `.dark`. `next-themes` lo minimiza aplicando la clase antes del primer render, pero en SSR sería un problema. Este proyecto es CSR puro (Vite), por lo que el riesgo es mínimo. Si ocurre, se puede agregar un script inline en `index.html` como mitigación posterior.

**[Riesgo] Cambio visual al migrar tokens** → `bg-neutral-900` → `bg-primary` y `bg-red-500` → `bg-destructive` cambian el color exacto a lo que defina la paleta del `index.css`. Con paleta `neutral`, los valores son visualmente idénticos en light mode. Verificar visualmente después de cada componente.

**[Riesgo] Tipo de retorno de `AuthService.authControllerAutocomplete` difiere del hardcodeado** → El tipo generado puede no coincidir exactamente con `{ id, name, email }`. Verificar contra el modelo generado al implementar. Si el backend devuelve campos adicionales, TypeScript lo acepta (el tipo generado es más específico, no hay pérdida).

**[Riesgo] Firma de `CalendarService.calendarControllerUploadCover` usa `UploadCoverDto.file: string`** → El tipo generado tiene `file: string` pero el cliente enviará un `Blob`. Esto es una limitación conocida del codegen (`openapi-typescript-codegen`) con uploads multipart — el tipo dice `string` pero en runtime funciona con `Blob`/`File`. Puede requerir un cast explícito `as unknown as string` para satisfacer TypeScript sin romper el runtime.

**[Trade-off] `next-themes` vs. ThemeProvider propio** → El `text-size-context.tsx` implementa preferencia propia. Se podría hacer lo mismo para el tema. Se elige `next-themes` porque: (a) ya está instalado, (b) maneja edge cases (SSR, sistema, flash) mejor que una implementación manual, (c) la skill lo recomienda explícitamente.

## Migration Plan

El orden es importante: el CSS base debe estar correcto antes de migrar colores, y los archivos legacy se eliminan al final para no romper nada mientras se migra.

1. **CSS base + config** → `index.css` y `components.json`
2. **ThemeProvider + toggle** → `theme-provider.tsx`, `main.tsx`, sidebar, `sonner.tsx`
3. **Componentes UI** → migrar tokens en `src/components/ui/*.tsx` uno por uno
4. **Layouts** → `app-layout.tsx`, `public-layout.tsx`, `adaptive-layout.tsx`
5. **Sidebar colores** → separado de los layouts porque tiene lógica propia
6. **Páginas** → `login-page.tsx`, `user-form-page.tsx`, `program-detail-page.tsx`, `programs-list-page.tsx`
7. **Hooks API** → `use-worship-services.ts` (useUserSearch), `use-cover-upload.ts`
8. **Limpieza** → eliminar `api-client.ts`, `api/config.ts`, `worship-services/index.ts`

Cada paso es reversible con `git checkout`. No hay migraciones de base de datos ni cambios de API.

**Verificación por paso**: después de cada grupo, levantar el dev server y verificar visualmente que los componentes migrados se ven correctamente en light y dark mode.

## Open Questions

- ¿Se quiere exponer el toggle de dark mode también en la página de login (antes de autenticarse)? Por ahora el scope lo limita al sidebar del app autenticado.
- ¿El tipo generado para `AuthService.authControllerAutocomplete` incluye los campos `id`, `name`, `email`? (verificar al implementar D4 — si el backend no tiene el DTO documentado con OpenAPI completo, el tipo puede ser incompleto)
