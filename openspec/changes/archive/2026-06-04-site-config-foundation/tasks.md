## 1. Backend - Módulo site-config (base genérica)

- [x] 1.1 Cargar skill `nestjs-best-practices` antes de implementar
- [x] 1.2 Crear entidad `SiteSetting` (`site_settings`: `key` PK varchar, `value` text null, `updated_at`)
- [x] 1.3 Crear migración `CreateSiteSettings` (tabla `site_settings`)
- [x] 1.4 Crear `SiteConfigService` con helpers `getSetting(key)` / `setSetting(key, value)`
- [x] 1.5 Crear config de upload de imágenes del sitio (`uploads/site/`, multer, filtro image/*, DTO `UploadImageDto` formal binario)
- [x] 1.6 Crear `SiteConfigController` base (`/api/site-config`, `JwtAuthGuard+RolesGuard+Roles(Admin)`) — endpoints genéricos de settings si aplican
- [x] 1.7 Crear `PublicSiteController` base (`@Controller('public')`, sin guard) — vacío, listo para que cada sección agregue su `GET`
- [x] 1.8 Registrar entidad en `app.module.ts` (ENTITIES) y en `data-source.ts`; registrar `SiteConfigModule` en imports
- [ ] 1.9 Correr migración y verificar arranque _(pendiente: reiniciar backend)_

## 2. Frontend - Shell de Configuraciones (admin)

- [x] 2.1 Cargar skills `church-ui-design` y `shadcn` antes de implementar
- [ ] 2.2 Regenerar cliente API (`npm run generate:api`); restaurar `request.ts` con git si queda vacío _(pendiente: reiniciar backend)_
- [x] 2.3 Crear `ConfiguracionesLayout` con navegación por tabs (desktop) y selector/scroll (mobile)
- [x] 2.4 Agregar rutas `/admin/configuraciones` (índice) y `/admin/configuraciones/:seccion` en `App.tsx`
- [x] 2.5 Agregar entrada "Configuraciones" al sidebar (icono engranaje), visible solo para Admin
- [x] 2.6 Definir un registro de tabs extensible (arreglo `{ id, label, path }`) que cada section change amplía
- [x] 2.7 Crear página índice/bienvenida de Configuraciones
- [x] 2.8 Crear componente reutilizable de tab "explicativa/redirección" (`ConfigRedirectCard`: título, explicación, botón "Ir a <módulo>")

## 2b. Sitio público - Limpieza de Documentos (privado)

- [x] 2b.1 Quitar "Documentos" de la navegación del sitio (`Nav` en `website/ui.jsx`)
- [x] 2b.2 Quitar `'documentos'` de `VALID_PAGES` y del `switch` en `website/app.jsx`
- [x] 2b.3 Quitar/inhabilitar `PageDocumentos` (`website/pages-5.jsx`) y `store.docs` demo _(dejar como código muerto, no accesible)_
- [x] 2b.4 Documentar en `INTEGRATION.md` que Documentos es privado y se gestiona en `/admin/documentos`

## 3. Sitio público - Puente de integración

- [x] 3.1 Asegurar `website/integration.js` con `window.IASD_API.apiGet(path)` (fetch mismo origen, manejo de error)
- [x] 3.2 Documentar en `website/INTEGRATION.md` los puntos de enganche y el patrón por sección
- [x] 3.3 Asegurar carga de `integration.js` en `index.html` antes de los scripts del diseño

## 4. Verificación

- [ ] 4.1 La migración corre limpio y la tabla `site_settings` existe _(pendiente: reiniciar backend)_
- [ ] 4.2 `/api/public/*` responde sin token (aunque vacío en la base) _(pendiente: reiniciar backend)_
- [ ] 4.3 "Configuraciones" aparece en el sidebar (solo Admin) y el layout por tabs renderiza _(listo para probar)_
- [ ] 4.4 `window.IASD_API.apiGet` funciona en dev (proxy `/api`) y en build _(listo para probar)_
