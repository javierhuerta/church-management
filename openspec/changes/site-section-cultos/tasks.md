## 1. Backend — Campos del culto en ServiceProgram

- [ ] 1.1 Agregar columnas `title`, `preacher`, `theme`, `scripture` (todas `varchar nullable`) a `ServiceProgram`
- [ ] 1.2 Migración para agregar las 4 columnas a `service_programs`
- [ ] 1.3 Agregar los campos a `CreateProgramDto`/`UpdateProgramDto` (`@ApiPropertyOptional`, `@IsOptional`) y a `ServiceProgramResponseDto`
- [ ] 1.4 Persistir los nuevos campos en `ProgramService` sin romper la lógica de grupos/secciones
- [ ] 1.5 Exponer estos campos en el formulario de programa del admin de Cultos

## 2. Backend — Plantilla "mostrar en el sitio web"

- [ ] 2.1 Agregar bandera `showOnWebsite` (boolean default false) a `ServiceTemplate`
- [ ] 2.2 Migración para agregar `show_on_website` a `service_templates`
- [ ] 2.3 Exponer `showOnWebsite` en DTOs y en el formulario de plantilla del admin de Cultos
- [ ] 2.4 Validar (recomendado) que solo una plantilla tenga `showOnWebsite = true`
- [ ] 2.5 Convención: la plantilla marcada es una plantilla "solo culto" (sin grupo de Escuela Sabática)

## 3. Backend — Endpoint público de cultos

- [ ] 3.1 Crear DTOs `PublicWorshipItemDto` (`id`, `a`, `n`, `d`, `accent`) y `PublicWorshipResponseDto` (`upcoming`, `date`, `title`, `preacher`, `theme`, `scripture`, `items`)
- [ ] 3.2 Crear `PublicWorshipController` (`@Controller('public')`, sin guard) con `GET /public/worship`
- [ ] 3.3 Lógica: buscar el programa `Published` del próximo sábado (o sábado actual) cuya plantilla tenga `showOnWebsite = true`, orden date ASC, límite 1
- [ ] 3.4 Salvaguarda: si el programa tuviera un grupo "Escuela Sabática", excluirlo
- [ ] 3.5 Mapear secciones a items (`responsible → a`, `name → n`, `hymnText || notes → d`, `accent` por heurística "sermón/predicación/palabra")
- [ ] 3.6 Caso sin programa: devolver `{ upcoming: false }`; decoradores OpenAPI completos

## 4. Frontend (admin) — Tab "Cultos" explicativa en Configuraciones

- [ ] 4.1 Cargar skill `church-ui-design` antes de implementar
- [ ] 4.2 Crear la tab "Cultos" con `ConfigRedirectCard` (de la base)
- [ ] 4.3 Explicar el flujo: crear plantilla "solo culto" → marcarla "mostrar en el sitio web" → publicar el programa del sábado con predicador/tema/texto bíblico
- [ ] 4.4 Botón "Ir a Cultos" → `/admin/cultos`
- [ ] 4.5 Registrar la tab en el shell de Configuraciones (`/admin/configuraciones/cultos`)

## 5. Sitio público — Cableado de PagePrograma

- [ ] 5.1 Agregar `fetchWorship()` a `window.IASD_API` en `integration.js`
- [ ] 5.2 Parche en `PagePrograma` (`pages-4.jsx`) para leer de `fetchWorship()` en vez del store local
- [ ] 5.3 Quitar controles de edición inline de la vista pública (`EditBanner`, inputs inline, add/remove/move)
- [ ] 5.4 Conservar `ToolbarBar` (PDF) y el formateo de detalle/himnos
- [ ] 5.5 Mostrar contenido por defecto si `upcoming: false`
- [ ] 5.6 Documentar el parche en `INTEGRATION.md`

## 6. Verificación

- [ ] 6.1 `GET /api/public/worship` devuelve el programa publicado de la plantilla marcada (sin Escuela Sabática)
- [ ] 6.2 `GET /api/public/worship` sin programa → `{ upcoming: false }`
- [ ] 6.3 Editar predicador/tema/scripture desde el admin de Cultos se refleja en el sitio
- [ ] 6.4 Marcar/desmarcar `showOnWebsite` en una plantilla cambia lo que muestra el sitio
- [ ] 6.5 La tab "Cultos" explica y redirige correctamente a `/admin/cultos`
- [ ] 6.6 Las migraciones corren limpio sin afectar datos existentes
