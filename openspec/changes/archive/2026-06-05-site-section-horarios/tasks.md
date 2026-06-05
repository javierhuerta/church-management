## 1. Backend - Entidad ScheduleItem

- [x] 1.1 Cargar skill `nestjs-best-practices` antes de implementar
- [x] 1.2 Crear entidad `ScheduleItem` con los campos definidos en design.md, en `backend/src/modules/site-config/entities/schedule-item.entity.ts`
- [x] 1.3 Crear migración `CreateScheduleItems` para la tabla `schedule_items`
- [x] 1.4 Registrar `ScheduleItem` en los ENTITIES de `app.module.ts` y en `data-source.ts`
- [x] 1.5 Correr migración y verificar que la tabla existe

## 2. Backend - DTOs y Servicio

- [x] 2.1 Crear DTOs: `CreateScheduleItemDto`, `UpdateScheduleItemDto`, `ScheduleItemResponseDto` con decoradores OpenAPI (`@ApiProperty`, `@ApiPropertyOptional({ type: String, nullable: true })`)
- [x] 2.2 Crear DTO `ReorderScheduleItemsDto` con array de `{ id: string, sortOrder: number }`
- [x] 2.3 Crear `ScheduleService` con métodos CRUD y reordenamiento (transacción para reorder)
- [x] 2.4 Método `findAllOrdered()`: devuelve todos los ítems ordenados por `sortOrder`
- [x] 2.5 Método `findActiveGrouped()`: devuelve solo activos, agrupados por `dayLabel`, ordenados por `sortOrder`

## 3. Backend - Endpoints admin y público

- [x] 3.1 Crear `ScheduleController` (`/api/site-config/schedule`) con `JwtAuthGuard + RolesGuard + Roles(Admin)` — endpoints CRUD + reorder
- [x] 3.2 Decorar todos los endpoints admin con `@ApiTags('Site Config - Schedule')`, `@ApiOperation`, `@ApiBearerAuth`
- [x] 3.3 Agregar endpoint público `GET /api/public/schedule` en `PublicSiteController` (sin guard, devuelve `findActiveGrouped()` + textos de `SiteSetting`)
- [x] 3.4 Crear DTO `PublicScheduleResponseDto` con la estructura anidada de días e ítems
- [x] 3.5 Registrar `ScheduleController` en `site-config.module.ts`

## 4. Backend - Seeders

- [x] 4.1 Crear `ScheduleItemSeeder` en `backend/src/seeds/site-config/` con los 5 horarios del diseño actual, idempotente
- [x] 4.2 Crear o extender seeder de SiteSettings para insertar las claves `horarios.page_kicker`, `horarios.page_title`, `horarios.page_paragraph` con defaults si no existen
- [x] 4.3 Registrar ambos seeders en `scripts/seeders/run-all.ts`

## 5. Frontend - Cliente API y tab Horarios

- [x] 5.1 Cargar skill `church-ui-design` antes de implementar componentes
- [x] 5.2 Regenerar cliente API desde OpenAPI (`npm run generate:api`); restaurar `request.ts` con git si queda vacío
- [x] 5.3 Agregar tab "Horarios" al arreglo de tabs en `ConfiguracionesLayout` (`{ id: 'horarios', label: 'Horarios', path: 'horarios' }`)
- [x] 5.4 Crear ruta `/admin/configuraciones/horarios` en `App.tsx` apuntando al componente de la página

## 6. Frontend - Página de Horarios (admin)

- [x] 6.1 Crear componente `HorariosConfigPage` con layout de dos secciones verticales
- [x] 6.2 Sección "Textos de la página": formulario con 3 campos (kicker, título, párrafo) usando `SiteSetting`; guardar con el endpoint genérico
- [x] 6.3 Sección "Horarios": tabla con columnas Día, Hora, Servicio, Activo, Acciones
- [x] 6.4 Renderizar `dayLabel` con badge; si `dayAccent = true`, aplicar color gold de la paleta
- [x] 6.5 Toggle activo/inactivo con switch shadcn en cada fila, llamada inmediata al endpoint de actualización
- [x] 6.6 Botones subir/bajar en cada fila para reordenar; llamada al endpoint `reorder`
- [x] 6.7 Botón "+ Nuevo horario" que abre modal con formulario de creación
- [x] 6.8 Formulario de creación/edición (modal): campos dayLabel (input con sugerencias), dayAccent (checkbox), time (input HH:MM), title, description
- [x] 6.9 Implementar patrón mobile/desktop: tabla en desktop, tarjetas en mobile
- [x] 6.10 Estados de carga (Skeleton shadcn) y error (toast) para todas las operaciones

## 7. Sitio público - Cableado

- [x] 7.1 Agregar helper `fetchSchedule()` en `website/integration.js` que consuma `GET /api/public/schedule`
- [x] 7.2 Modificar `PageHorarios` en `website/pages-2.jsx`: reemplazar array `week` hardcodeado por llamado a `window.IASD_API.fetchSchedule()` con fallback al contenido actual
- [x] 7.3 Asegurar que el componente maneja estados: loading (skeleton o spinner), error (contenido hardcodeado), datos (contenido de la API)
- [x] 7.4 Actualizar `website/INTEGRATION.md` documentando el parche de la sección Horarios

## 8. Verificación

- [x] 8.1 La migración `schedule_items` corre limpio
- [x] 8.2 `GET /api/public/schedule` devuelve los 5 horarios del seeder sin token
- [x] 8.3 CRUD admin de horarios funciona vía API (`POST`, `PATCH`, `DELETE`, `reorder`)
- [x] 8.4 Al desactivar un ítem, `GET /api/public/schedule` ya no lo incluye
- [x] 8.5 La pestaña "Horarios" aparece en Configuraciones y carga los datos
- [x] 8.6 El sitio público en `/#horarios` muestra los horarios desde la API
- [x] 8.7 Verificar que `integration.js` se carga y `fetchSchedule()` es accesible desde la consola del navegador
