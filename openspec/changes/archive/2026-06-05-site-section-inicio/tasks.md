## 1. Backend — DTOs y tipos

- [x] 1.1 Cargar skill `nestjs-best-practices` antes de implementar
- [x] 1.2 Crear `PublicHomeDto` con los sub-objetos `hero`, `verse`, `schedule`, `social`, `footerCta` y `nextService`; cada campo con `@ApiProperty` decorado con `type` explícito y `nullable` donde aplique
- [x] 1.3 Crear DTOs `UpdateHomeConfigDto` y `ReadHomeConfigDto` para los endpoints admin, reflejando las mismas claves que el formulario

## 2. Backend — Servicio `SiteConfigService`

- [x] 2.1 Agregar constantes con los nombres de claves `inicio.*` usados en `SiteSetting`
- [x] 2.2 Implementar `getPublicHome()`: leer todas las claves `inicio.*` de `SiteSetting`, consultar el próximo culto al módulo `Calendar` (`@InjectRepository(Event)` o vía servicio), armar y devolver `PublicHomeDto` con defaults para claves no seteadas
- [x] 2.3 Implementar `getHomeConfig()` (admin): leer claves `inicio.*` y devolver `ReadHomeConfigDto`
- [x] 2.4 Implementar `saveHomeConfig(dto: UpdateHomeConfigDto)`: persistir cada campo como `setSetting('inicio.<campo>', valor)`
- [x] 2.5 Si `CalendarModule` no está disponible con imports directos, usar `forwardRef` o un provider puente

## 3. Backend — Controladores

- [x] 3.1 Agregar `GET /public/home` en `PublicSiteController` con `@ApiOperation` y `@ApiResponse({ type: PublicHomeDto })`
- [x] 3.2 Agregar `GET /site-config/home` y `PUT /site-config/home` en `SiteConfigController`, ambos protegidos con `@Roles(Admin)`, documentados con OpenAPI
- [x] 3.3 Verificar que `SiteConfigModule` importe `CalendarModule` (o su repositorio) para que el servicio pueda consultar eventos

## 3b. Backend — Imágenes del hero

- [x] 3b.1 Agregar `POST /site-config/home/images/:slot` (admin) con `FileInterceptor` y el config de upload del sitio (`uploads/site`); `slot` ∈ `main|small|next-service`
- [x] 3b.2 Guardar la URL resultante en `SiteSetting` (`inicio.hero_main_image`, `inicio.hero_small_image`, `inicio.next_service_image`); borrar la imagen anterior si existía
- [x] 3b.3 Incluir las URLs (o `null`) en `PublicHomeDto.images` (`heroMain`, `heroSmall`, `nextService`)

## 4. Frontend — Formulario de configuración de Inicio

- [x] 4.1 Cargar skills `church-ui-design`, `shadcn`, `react-hook-form` y `zod` antes de implementar componentes
- [x] 4.2 Regenerar cliente API desde OpenAPI (`npm run generate:api`); restaurar `request.ts` con git si queda vacío
- [x] 4.3 Crear componente `HomeConfigForm` con `useForm` y validación Zod, campos agrupados por sección: Hero, Versículo, Horarios, Social, CTA final
- [x] 4.4 Agregar indicador de solo lectura del próximo culto detectado (título, fecha, lugar) consultando `GET /public/home` o un endpoint dedicado
- [x] 4.5 Al guardar, llamar al servicio generado por OpenAPI para `PUT /api/site-config/home`
- [x] 4.6 Aplicar patrón mobile/desktop según la skill `church-ui-design`: formulario single-column en mobile con acordeón de secciones; dos columnas en desktop
- [x] 4.7 Agregar subida/preview de las 3 imágenes del hero (principal, detalle, próximo culto) usando `POST /site-config/home/images/:slot`

## 5. Frontend — Registro de la pestaña "Inicio"

- [x] 5.1 Registrar el tab `{ id: 'inicio', label: 'Inicio', path: 'inicio' }` en el arreglo de tabs de `ConfiguracionesLayout`
- [x] 5.2 Agregar la sub-ruta `/admin/configuraciones/inicio` que renderice `HomeConfigForm`
- [x] 5.3 Verificar que la pestaña aparece en el shell de Configuraciones y navega correctamente

## 6. Sitio público — `integration.js`

- [x] 6.1 Agregar helper `window.IASD_API.fetchHome()` que llama a `apiGet('/public/home')` y devuelve el JSON parseado
- [x] 6.2 Agregar helper `window.IASD_API.mapHomeData(data)` si se necesita transformación antes de entregar a `PageInicio`

## 7. Sitio público — Parche en `PageInicio`

- [x] 7.1 Agregar `useState` + `useEffect` en `PageInicio` para llamar `window.IASD_API.fetchHome()` al montar
- [x] 7.2 Reemplazar cada texto hardcodeado por `homeData.hero.subtitle`, `homeData.verse.text`, etc., con fallback a los valores por defecto actuales si `fetchHome` falla o el campo es `null`
- [x] 7.3 Reemplazar el prop `nextService` (que venía de `app.jsx`) por `homeData.nextService`, con fallback al hardcodeado actual
- [x] 7.4b Usar `homeData.images.heroMain/heroSmall/nextService` como `src` de los `PhotoSlot`/`image-slot` del hero, con fallback al placeholder del diseño cuando sea `null`
- [x] 7.4 Documentar el parche en `INTEGRATION.md` bajo una nueva sección `## Sección Inicio` describiendo qué líneas de `pages-1.jsx` se modifican y por qué

## 8. Verificación

- [x] 8.1 Probar `GET /api/public/home` sin token: devuelve datos con defaults
- [x] 8.2 Probar `PUT /api/site-config/home` como Admin: guarda y responde OK
- [x] 8.3 Probar `PUT /api/site-config/home` como no-Admin: recibe 403
- [x] 8.4 Publicar un evento de calendario futuro y verificar que `GET /api/public/home` lo incluye como `nextService`
- [x] 8.5 Cargar el sitio público (`/`) y verificar que `PageInicio` muestra contenido del endpoint en vez de datos hardcodeados
- [x] 8.6 Probar la pestaña "Inicio" en Configuraciones (admin): formulario carga valores, edita y guarda correctamente
- [x] 8.7 Verificar que sin eventos futuros, el bloque "próximo culto" no rompe la página (muestra fallback o se oculta)
