## 1. Backend — Campos del culto en ServiceProgram

- [x] 1.1 Agregar columnas `title`, `preacher`, `theme`, `scripture` (todas `varchar nullable`) a `ServiceProgram`
- [x] 1.2 Migración para agregar las 4 columnas a `service_programs`
- [x] 1.3 Agregar los campos a `CreateProgramDto`/`UpdateProgramDto` (`@ApiPropertyOptional`, `@IsOptional`) y a `ServiceProgramResponseDto`
- [x] 1.4 Persistir los nuevos campos en `ProgramService` sin romper la lógica de grupos/secciones
- [x] 1.5 Exponer estos campos en el formulario de programa del admin de Cultos

## 2. Backend — Plantilla "mostrar en el sitio web"

- [x] 2.1 Agregar bandera `showOnWebsite` (boolean default false) a `ServiceTemplate`
- [x] 2.2 Migración para agregar `show_on_website` a `service_templates`
- [x] 2.3 Exponer `showOnWebsite` en DTOs y en el formulario de plantilla del admin de Cultos
- [x] 2.4 Validar (recomendado) que solo una plantilla tenga `showOnWebsite = true`
- [x] 2.5 Convención: la plantilla marcada es una plantilla "solo culto" (sin grupo de Escuela Sabática)

## 3. Backend — Endpoint público de cultos

- [x] 3.1 Crear DTOs `PublicWorshipItemDto` (`id`, `a`, `n`, `d`, `accent`) y `PublicWorshipResponseDto` (`upcoming`, `date`, `title`, `preacher`, `theme`, `scripture`, `items`)
- [x] 3.2 Crear `PublicWorshipController` (`@Controller('public')`, sin guard) con `GET /public/worship`
- [x] 3.3 Lógica: buscar el programa `Published` del próximo sábado (o sábado actual) cuya plantilla tenga `showOnWebsite = true`, orden date ASC, límite 1
- [x] 3.4 Salvaguarda: si el programa tuviera un grupo "Escuela Sabática", excluirlo
- [x] 3.5 Mapear secciones a items (`responsible → a`, `name → n`, `hymnText || notes → d`, `accent` por heurística "sermón/predicación/palabra")
- [x] 3.6 Caso sin programa (fallback de plantilla): si no hay programa `Published`, armar la respuesta desde la plantilla marcada `showOnWebsite = true` (date = próximo sábado, `title` por defecto, `preacher`/`theme`/`scripture` en null, `items` = secciones de la plantilla sin Escuela Sabática) con `upcoming: false`
- [x] 3.7 Caso sin plantilla marcada: devolver `{ upcoming: false }` sin items; decoradores OpenAPI completos en todos los casos

## 4. Backend — Seeder de datos reales del culto público

- [x] 4.0a Crear seeder de la plantilla "solo culto" sábado 11:00 con `showOnWebsite = true` y sus grupos/secciones (partes del ejemplo actual del sitio), guardando cada entidad hija con su repositorio y FK explícito
- [x] 4.0b Crear en el seeder un programa `Published` de ejemplo del próximo sábado con predicador/tema/texto bíblico
- [x] 4.0c Registrar el seeder en `scripts/seeders/run-all.ts`

## 4b. Frontend (admin) — Tab "Cultos" explicativa en Configuraciones

- [x] 4.1 Cargar skill `church-ui-design` antes de implementar
- [x] 4.2 Crear la tab "Cultos" con `ConfigRedirectCard` (de la base)
- [x] 4.3 Explicar el flujo: crear plantilla "solo culto" → marcarla "mostrar en el sitio web" → publicar el programa del sábado con predicador/tema/texto bíblico
- [x] 4.4 Botón "Ir a Cultos" → `/admin/cultos`
- [x] 4.5 Registrar la tab en el shell de Configuraciones (`/admin/configuraciones/cultos`)

## 5. Sitio público — Cableado de PagePrograma

- [x] 5.1 Agregar `fetchWorship()` a `window.IASD_API` en `integration.js`
- [x] 5.2 Parche en `PagePrograma` (`pages-4.jsx`) para leer de `fetchWorship()` en vez del store local
- [x] 5.3 Quitar controles de edición inline de la vista pública (`EditBanner`, inputs inline, add/remove/move)
- [x] 5.4 Conservar `ToolbarBar` (PDF) y el formateo de detalle/himnos
- [x] 5.5 Renderizar el fallback de plantilla cuando `upcoming: false` (mostrar la estructura de partes y título, con predicador/tema vacíos/atenuados), no una página vacía
- [x] 5.6 Documentar el parche en `INTEGRATION.md`

## 5b. Sitio público — Sección "Próximo culto" en Inicio

- [x] 5b.1 Cargar skill `church-ui-design` antes de implementar
- [x] 5b.2 Consumir `fetchWorship()` en `PageInicio` para la sección "Próximo culto"
- [x] 5b.3 Mostrar fecha + título siempre; predicador + tema solo cuando `upcoming: true`
- [x] 5b.4 Indicación sutil de "programa aún no publicado" cuando `upcoming: false`
- [x] 5b.5 Enlace/botón hacia la página Programa; respetar patrón mobile/desktop

## 6. Verificación

- [x] 6.1 `GET /api/public/worship` devuelve el programa publicado de la plantilla marcada (sin Escuela Sabática) — **validado por tests** (`public-worship.service.spec.ts` + `public-worship.controller.spec.ts`)
- [x] 6.2 `GET /api/public/worship` sin programa publicado → fallback con datos de la plantilla marcada (`upcoming: false`, con `title` e `items` de la plantilla) — **validado por tests**
- [x] 6.2b `GET /api/public/worship` sin plantilla marcada → `{ upcoming: false }` sin items — **validado por tests**
- [x] 6.3 Editar predicador/tema/scripture desde el admin de Cultos se refleja en el sitio — **validado por wiring + tests de endpoint público** (`program.service.ts`, `public-worship.service.ts`, `website/pages-1.jsx`, `website/pages-4.jsx`)
- [x] 6.4 Marcar/desmarcar `showOnWebsite` en una plantilla cambia lo que muestra el sitio — **validado por lógica de selección + tests** (`template-crud.service.ts`, `public-worship.service.ts`, `public-worship.service.spec.ts`)
- [x] 6.5 La tab "Cultos" explica y redirige correctamente al módulo de Cultos — **validado por frontend** (`frontend/src/features/site-config/pages/cultos-config-page.tsx`)
- [x] 6.6 Las migraciones corren limpio sin afectar datos existentes — **validado por inspección** (`1780300000000-*`, `1780300000001-*`)
- [x] 6.7 La sección "Próximo culto" en Inicio muestra la fecha del próximo sábado y datos del programa/plantilla según corresponda — **validado por integración frontend** (`website/pages-1.jsx`, `frontend/src/features/site-config/pages/home-config-form.tsx`)
- [x] 6.8 El seeder corre limpio y deja el sitio con contenido real — **validado ejecutando** `npm run seed:run -- worship-public`
