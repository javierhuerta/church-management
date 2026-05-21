## 1. Configuración

- [ ] 1.1 Instalar `@nestjs/cache-manager` y `cache-manager`
- [ ] 1.2 Registrar `CacheModule.registerAsync` global con TTL (`CACHE_TTL_DEFAULT`) y `max` configurables vía env (añadir al esquema joi)

## 2. Cachear lecturas públicas

- [ ] 2.1 `HymnController`: `@UseInterceptors(CacheInterceptor)` + `@CacheKey('hymns:all')` en `findAll`; key con query en `autocomplete`
- [ ] 2.2 `TemplateController`: `@UseInterceptors(CacheInterceptor)` en `findAll` y `findOne`
- [ ] 2.3 `CalendarController`: cache en `findBySlug` (publicado)

## 3. Invalidación

- [ ] 3.1 Inyectar `CACHE_MANAGER` en `HymnService` y `TemplateCrudService`
- [ ] 3.2 Invalidar keys correspondientes en create/update/delete de hymn y template

## 4. Verificación

- [ ] 4.1 Confirmar que endpoints privados/autenticados no caen en el cache compartido
- [ ] 4.2 Build, lint y tests verdes
