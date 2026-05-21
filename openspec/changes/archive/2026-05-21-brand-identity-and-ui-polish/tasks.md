## Phase 1 — Brand tokens & typography

- [x] 1.1 En `frontend/src/index.css`: reemplazar los tokens `--primary` y `--primary-foreground` del bloque `:root` por la paleta de marca navy (`hsl(219 59% 25%)` / `hsl(0 0% 98%)`). Agregar `--accent: hsl(40 55% 55%)` y `--accent-foreground: hsl(219 59% 15%)`. Cambiar `--background` a `hsl(36 50% 97%)` (crema) y `--border` a `hsl(36 20% 85%)`. Actualizar `--ring` para coincidir con el nuevo primary.
- [x] 1.2 En `frontend/src/index.css`: reemplazar los tokens del bloque `.dark` para usar primary azul claro (`hsl(219 70% 60%)`), accent gold (`hsl(40 60% 60%)`), background navy oscuro (`hsl(222 47% 8%)`), card `hsl(222 35% 12%)`, foreground crema `hsl(36 50% 95%)`.
- [x] 1.3 En `frontend/src/index.css`: agregar `@import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;500;700&family=Playfair+Display:wght@600;700&display=swap');` al inicio del archivo. En `@layer base`, aplicar `font-family: 'Lato', system-ui, sans-serif` al selector `body`.

## Phase 2 — Logo PNG

- [x] 2.1 Confirmar que `frontend/src/assets/images/logo.png` y `logo-mark.png` existen (ya procesados con Pillow).
- [x] 2.2 Actualizar `frontend/src/components/layout/sidebar.tsx`: reemplazar el placeholder "IA" por `<img src={logoMark} />` colapsado y `<img src={logo} />` expandido. Aplicar `filter: brightness(0) invert(1)` en dark mode. Importar los PNG como módulos Vite.

## Phase 3 — defaultTheme y LoginControls

- [x] 3.1 En `frontend/src/main.tsx`: cambiar `defaultTheme="system"` a `defaultTheme="light"`.
- [x] 3.2 Crear `frontend/src/components/login-controls.tsx`: toggle de tema (Sun/Moon/Monitor) + selector de tamaño (S/M/L). Usar `useTheme` desde `@/components/theme-provider` y `useTextSize`.

## Phase 4 — Login rediseñado

- [x] 4.1 Rediseñar `frontend/src/features/auth/pages/login-page.tsx`: layout 2 columnas desktop. Columna izquierda: panel navy con logo PNG + tagline. Columna derecha: formulario. Mobile: solo columna derecha con logo arriba.
- [x] 4.2 Incluir `<LoginControls />` en esquina superior derecha del login.
- [x] 4.3 En `frontend/src/features/auth/components/login-form.tsx`: Playfair Display en el heading de bienvenida.

## Phase 5 — Dark mode: Calendar module

- [x] 5.1 `frontend/src/features/calendar/pages/calendar-page.tsx`: reemplazar colores hardcodeados por tokens semánticos.
- [x] 5.2 `frontend/src/features/calendar/pages/event-detail-page.tsx`: ídem.
- [x] 5.3 `frontend/src/features/calendar/pages/event-form-page.tsx`: ídem.
- [x] 5.4 `frontend/src/features/calendar/components/event-card.tsx`: ídem. Usar paleta extendida para badges de estado.
- [x] 5.5 `frontend/src/features/calendar/components/event-form.tsx`: ídem.
- [x] 5.6 `frontend/src/features/calendar/components/calendar-grid.tsx`: ídem.
- [x] 5.7 `frontend/src/features/calendar/components/calendar-list.tsx`: ídem.
- [x] 5.8 `frontend/src/features/calendar/components/wysiwyg-editor.tsx`: ídem.
- [x] 5.9 `frontend/src/features/calendar/components/attachment-gallery.tsx`: ídem.
- [x] 5.10 `frontend/src/features/calendar/components/organizer-chip.tsx`: ídem.
- [x] 5.11 `frontend/src/features/calendar/components/organizers-select.tsx`: ídem.
- [x] 5.12 `frontend/src/features/calendar/components/cover-image-picker/cover-search-tab.tsx`: ídem.
- [x] 5.13 `frontend/src/features/calendar/components/cover-image-picker/cover-upload-tab.tsx`: ídem.
- [x] 5.14 `frontend/src/features/calendar/components/cover-image-picker/cover-cropper.tsx`: ídem.
- [x] 5.15 `frontend/src/features/calendar/components/cover-image-picker/index.tsx`: ídem.
- [x] 5.16 `frontend/src/features/calendar/components/attachment-uploader.tsx`: ídem.
- [x] 5.17 `frontend/src/features/calendar/components/share-buttons.tsx`: ídem.

## Phase 6 — Dark mode: WorshipServices module

- [x] 6.1 `frontend/src/features/worship-services/pages/programs-list-page.tsx`: usar paleta extendida para badges de estado (published/draft). Tokens semánticos para el resto.
- [x] 6.2 `frontend/src/features/worship-services/pages/templates-list-page.tsx`: ídem.
- [x] 6.3 `frontend/src/features/worship-services/pages/program-create-page.tsx`: ídem.
- [x] 6.4 `frontend/src/features/worship-services/pages/template-form-page.tsx`: ídem.
- [x] 6.5 `frontend/src/features/worship-services/components/program-change-history.tsx`: ídem.

## Phase 7 — Dark mode: Mantenedores y Dashboard

- [x] 7.1 `frontend/src/features/mantenedores/pages/users-list-page.tsx`: tokens semánticos, paleta extendida para badge de rol.
- [x] 7.2 `frontend/src/features/mantenedores/pages/departments-list-page.tsx`: ídem.
- [x] 7.3 `frontend/src/features/mantenedores/pages/department-form-page.tsx`: ídem.
- [x] 7.4 `frontend/src/features/dashboard/pages/dashboard-page.tsx`: ídem.

## Phase 8 — Verificación final

- [x] 8.1 Ejecutar `npm run build` en `frontend/` y confirmar sin errores TypeScript ni warnings de chunk.
