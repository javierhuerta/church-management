## 1. Configuración

- [x] 1.1 Instalar `@nestjs/cache-manager` y `cache-manager`
- [x] 1.2 Registrar `CacheModule.registerAsync` global con TTL (`CACHE_TTL_DEFAULT`) y `max` configurables vía env (añadir al esquema joi)

## 2. Cachear lecturas públicas

- [x] 2.1 `HymnController`: `@UseInterceptors(CacheInterceptor)` + `@CacheKey('hymns:all')` en `findAll`; key con query en `autocomplete`
- [x] 2.2 `TemplateController`: `@UseInterceptors(CacheInterceptor)` en `findAll` y `findOne`
- [x] 2.3 `CalendarController`: cache en `findBySlug` (publicado)

## 3. Invalidación

- [x] 3.1 Inyectar `CACHE_MANAGER` en `HymnService` y `TemplateCrudService`
- [x] 3.2 Invalidar keys correspondientes en create/update/delete de hymn y template

## 4. Verificación

- [x] 4.1 Confirmar que endpoints privados/autenticados no caen en el cache compartido
- [x] 4.2 Build, lint y tests verdes
