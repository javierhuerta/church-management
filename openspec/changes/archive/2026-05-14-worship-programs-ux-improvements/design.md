## Context

El módulo `worship-services` gestiona programas de culto con un ciclo de vida DRAFT → PUBLISHED. El listado actual (`programs-list-page.tsx`) no tiene filtros ni ordenamiento, y la vista de detalle (`program-detail-page.tsx`) usa `confirm()` nativo y `window.location.reload()` en 6 puntos distintos. No existen endpoints para eliminar grupos o secciones individuales. El estado ARCHIVED no existe ni en el enum del backend ni en la base de datos.

## Goals / Non-Goals

**Goals:**

- Añadir estado `ARCHIVED` al enum `ProgramStatus` con migración de DB.
- Exponer query params de filtrado en `GET /worship-programs` (sin romper contratos existentes).
- Añadir endpoints `DELETE` para programas, grupos y secciones.
- Crear un componente `ConfirmDialog` reutilizable basado en shadcn `Dialog`.
- Reemplazar todos los `window.location.reload()` del detalle por invalidaciones de React Query.
- Añadir panel de filtros en el listado con ordenamiento por fecha descendente por defecto.

**Non-Goals:**

- Drag & drop para reordenar grupos/secciones.
- Exportación a PDF.
- Notificaciones push al publicar.
- Paginación del listado (fuera del alcance de este change).

## Decisions

### D1 — Estado ARCHIVED como valor de enum PostgreSQL

**Decisión**: Añadir `ARCHIVED` al enum `ProgramStatus` del backend y crear una migración `ALTER TYPE ... ADD VALUE`.

**Alternativa considerada**: Campo booleano `isArchived` separado. Descartado porque rompe el patrón existente de ciclo de vida y complica los filtros.

**Rationale**: Consistente con el patrón `DRAFT`/`PUBLISHED` ya establecido. PostgreSQL permite `ADD VALUE` sin recrear el tipo. El frontend recibe el nuevo valor automáticamente vía codegen OpenAPI.

### D2 — Filtros en el backend como query params opcionales

**Decisión**: El endpoint `GET /worship-programs` acepta `createdById`, `templateId`, `dateFrom`, `dateTo`, `status` como query params opcionales con `QueryBuilder` de TypeORM. Todos los filtros son aditivos (AND). Ordenamiento por `date DESC` siempre.

**Alternativa considerada**: Filtrado en el frontend (client-side). Descartado porque la lista puede crecer y el filtrado en servidor es más correcto arquitecturalmente.

**Rationale**: Extiende el endpoint existente sin romper llamadas actuales (todos los params son opcionales). El codegen OpenAPI propaga los nuevos params al cliente frontend automáticamente.

### D3 — ConfirmDialog como componente compartido en `/components/ui/`

**Decisión**: Crear `ConfirmDialog` en `frontend/src/components/ui/confirm-dialog.tsx` usando `AlertDialog` de shadcn/ui (semánticamente más correcto que `Dialog` para confirmaciones destructivas).

**Alternativa considerada**: Un hook `useConfirm()` que retorna una promesa. Más flexible, pero más complejo y menos visible en el JSX.

**Rationale**: `AlertDialog` de shadcn ya existe en la librería instalada y tiene los estilos correctos para acciones destructivas. Un componente declarativo es más fácil de revisar en code review.

### D4 — Actualización optimista con React Query

**Decisión**: Reemplazar todos los `window.location.reload()` por `queryClient.invalidateQueries` en los callbacks `onSuccess` de las mutaciones existentes en `use-worship-services.ts`.

**Alternativa considerada**: Actualización optimista del cache local. Más compleja de implementar y el riesgo de inconsistencia con el servidor no justifica la ganancia de UX en este contexto.

**Rationale**: Invalidar las queries relevantes es el patrón estándar de React Query. Produce un re-fetch limpio sin recargar la página completa.

### D5 — Autorización DELETE programa: solo Admin

**Decisión**: El endpoint `DELETE /worship-programs/:id` requiere rol `Admin`. Los endpoints de grupos y secciones requieren los mismos permisos de edición que ya aplican (Admin o creador original en programas DRAFT/PUBLISHED).

**Rationale**: Eliminar un programa completo es una operación más destructiva que editar; restringirla a Admin es consistente con el principio de menor privilegio. Eliminar un grupo o sección es una operación de edición normal.

## Risks / Trade-offs

- **[Riesgo] Migraciones de enum en PostgreSQL** → `ADD VALUE` no es transaccional en algunas versiones; si el deploy falla a mitad no hay rollback automático. Mitigación: usar `IF NOT EXISTS` y probar en staging.
- **[Riesgo] Invalidación de queries puede causar refetches encadenados** si hay muchas queries dependientes en la misma vista. Mitigación: ser selectivo con las keys a invalidar (solo `['programs', id]` y `['programs']`).
- **[Trade-off] Filtros solo en el servidor** → el UX de filtros es ligeramente más lento (round trip) que client-side. Aceptable dado el tamaño esperado de la lista.

## Migration Plan

1. Backend: añadir `ARCHIVED` al enum en código + migración TypeORM.
2. Backend: añadir query params al endpoint GET y nuevos endpoints DELETE.
3. Backend: regenerar schema OpenAPI (arrancar servidor y verificar `/api-json`).
4. Frontend: regenerar cliente OpenAPI (`npm run generate:api`).
5. Frontend: crear `ConfirmDialog`, reemplazar `confirm()`/`alert()`, añadir filtros, añadir botones de eliminar.
6. Verificar que no quede ningún `window.location.reload()` en el módulo.

**Rollback**: Si el backend falla, el frontend sigue funcionando con el cliente anterior (los nuevos params son opcionales). El enum `ARCHIVED` no rompe queries existentes.

## Open Questions

- ¿El estado ARCHIVED debe impedir la edición del programa? (Propuesta: sí, ARCHIVED se comporta como read-only para todos excepto Admin).
- ¿Los filtros de fecha aplican sobre `date` (fecha del evento) o `created_at`? (Propuesta: `date` del evento, más útil para la gestión litúrgica).
