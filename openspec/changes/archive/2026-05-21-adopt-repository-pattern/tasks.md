## 1. EventRepository (calendar)

- [x] 1.1 Crear `calendar/repositories/event.repository.ts` (`@Injectable`) con `findWithFilters` (paginado/filtrado), `findOneWithRelations`, `findBySlugWithRelations`, `generateUniqueShareSlug`
- [x] 1.2 Registrar como provider en `CalendarModule`
- [x] 1.3 Refactor `calendar.service.ts` para consumir el repo (mantener escrituras transaccionales en el servicio)
- [x] 1.4 Ajustar `calendar.service.spec.ts` (mockear el repo custom) y verificar verde

## 2. ProgramRepository (worship)

- [x] 2.1 Crear `worship-services/repositories/program.repository.ts` con `findWithFilters`, `findOneWithRelations`, `findByDateRange`
- [x] 2.2 Registrar como provider en `WorshipServicesModule`
- [x] 2.3 Refactor `program.service.ts` para consumir el repo (createFromTemplate y escrituras siguen con `EntityManager`)
- [x] 2.4 Ajustar `program.service.spec.ts` y verificar verde

## 3. Verificación

- [x] 3.1 Confirmar relaciones/orden/paginación idénticos a los actuales
- [x] 3.2 Build, lint y tests verdes
