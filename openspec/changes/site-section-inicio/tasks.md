## 1. Backend — DTOs y tipos

- [ ] 1.1 Cargar skill `nestjs-best-practices` antes de implementar
- [ ] 1.2 Crear `PublicHomeDto` con los sub-objetos `hero`, `verse`, `schedule`, `social`, `footerCta` y `nextService`; cada campo con `@ApiProperty` decorado con `type` explícito y `nullable` donde aplique
- [ ] 1.3 Crear DTOs `UpdateHomeConfigDto` y `ReadHomeConfigDto` para los endpoints admin, reflejando las mismas claves que el formulario

## 2. Backend — Servicio `SiteConfigService`

- [ ] 2.1 Agregar constantes con los nombres de claves `inicio.*` usados en `SiteSetting`
- [ ] 2.2 Implementar `getPublicHome()`: leer todas las claves `inicio.*` de `SiteSetting`, consultar el próximo culto al módulo `Calendar` (`@InjectRepository(Event)` o vía servicio), armar y devolver `PublicHomeDto` con defaults para claves no seteadas
- [ ] 2.3 Implementar `getHomeConfig()` (admin): leer claves `inicio.*` y devolver `ReadHomeConfigDto`
- [ ] 2.4 Implementar `saveHomeConfig(dto: UpdateHomeConfigDto)`: persistir cada campo como `setSetting('inicio.<campo>', valor)`
- [ ] 2.5 Si `CalendarModule` no está disponible con imports directos, usar `forwardRef` o un provider puente

## 3. Backend — Controladores

- [ ] 3.1 Agregar `GET /public/home` en `PublicSiteController` con `@ApiOperation` y `@ApiResponse({ type: PublicHomeDto })`
- [ ] 3.2 Agregar `GET /site-config/home` y `PUT /site-config/home` en `SiteConfigController`, ambos protegidos con `@Roles(Admin)`, documentados con OpenAPI
- [ ] 3.3 Verificar que `SiteConfigModule` importe `CalendarModule` (o su repositorio) para que el servicio pueda consultar eventos

## 3b. Backend — Imágenes del hero

- [ ] 3b.1 Agregar `POST /site-config/home/images/:slot` (admin) con `FileInterceptor` y el config de upload del sitio (`uploads/site`); `slot` ∈ `main|small|next-service`
- [ ] 3b.2 Guardar la URL resultante en `SiteSetting` (`inicio.hero_main_image`, `inicio.hero_small_image`, `inicio.next_service_image`); borrar la imagen anterior si existía
- [ ] 3b.3 Incluir las URLs (o `null`) en `PublicHomeDto.images` (`heroMain`, `heroSmall`, `nextService`)

## 4. Frontend — Formulario de configuración de Inicio

- [ ] 4.1 Cargar skills `church-ui-design`, `shadcn`, `react-hook-form` y `zod` antes de implementar componentes
- [ ] 4.2 Regenerar cliente API desde OpenAPI (`npm run generate:api`); restaurar `request.ts` con git si queda vacío
- [ ] 4.3 Crear componente `HomeConfigForm` con `useForm` y validación Zod, campos agrupados por sección: Hero, Versículo, Horarios, Social, CTA final
- [ ] 4.4 Agregar indicador de solo lectura del próximo culto detectado (título, fecha, lugar) consultando `GET /public/home` o un endpoint dedicado
- [ ] 4.5 Al guardar, llamar al servicio generado por OpenAPI para `PUT /api/site-config/home`
- [ ] 4.6 Aplicar patrón mobile/desktop según la skill `church-ui-design`: formulario single-column en mobile con acordeón de secciones; dos columnas en desktop
- [ ] 4.7 Agregar subida/preview de las 3 imágenes del hero (principal, detalle, próximo culto) usando `POST /site-config/home/images/:slot`

## 5. Frontend — Registro de la pestaña "Inicio"

- [ ] 5.1 Registrar el tab `{ id: 'inicio', label: 'Inicio', path: 'inicio' }` en el arreglo de tabs de `ConfiguracionesLayout`
- [ ] 5.2 Agregar la sub-ruta `/admin/configuraciones/inicio` que renderice `HomeConfigForm`
- [ ] 5.3 Verificar que la pestaña aparece en el shell de Configuraciones y navega correctamente

## 6. Sitio público — `integration.js`

- [ ] 6.1 Agregar helper `window.IASD_API.fetchHome()` que llama a `apiGet('/public/home')` y devuelve el JSON parseado
- [ ] 6.2 Agregar helper `window.IASD_API.mapHomeData(data)` si se necesita transformación antes de entregar a `PageInicio`

## 7. Sitio público — Parche en `PageInicio`

- [ ] 7.1 Agregar `useState` + `useEffect` en `PageInicio` para llamar `window.IASD_API.fetchHome()` al montar
- [ ] 7.2 Reemplazar cada texto hardcodeado por `homeData.hero.subtitle`, `homeData.verse.text`, etc., con fallback a los valores por defecto actuales si `fetchHome` falla o el campo es `null`
- [ ] 7.3 Reemplazar el prop `nextService` (que venía de `app.jsx`) por `homeData.nextService`, con fallback al hardcodeado actual
- [ ] 7.4b Usar `homeData.images.heroMain/heroSmall/nextService` como `src` de los `PhotoSlot`/`image-slot` del hero, con fallback al placeholder del diseño cuando sea `null`
- [ ] 7.4 Documentar el parche en `INTEGRATION.md` bajo una nueva sección `## Sección Inicio` describiendo qué líneas de `pages-1.jsx` se modifican y por qué

## 8. Verificación

- [ ] 8.1 Probar `GET /api/public/home` sin token: devuelve datos con defaults
- [ ] 8.2 Probar `PUT /api/site-config/home` como Admin: guarda y responde OK
- [ ] 8.3 Probar `PUT /api/site-config/home` como no-Admin: recibe 403
- [ ] 8.4 Publicar un evento de calendario futuro y verificar que `GET /api/public/home` lo incluye como `nextService`
- [ ] 8.5 Cargar el sitio público (`/`) y verificar que `PageInicio` muestra contenido del endpoint en vez de datos hardcodeados
- [ ] 8.6 Probar la pestaña "Inicio" en Configuraciones (admin): formulario carga valores, edita y guarda correctamente
- [ ] 8.7 Verificar que sin eventos futuros, el bloque "próximo culto" no rompe la página (muestra fallback o se oculta)
