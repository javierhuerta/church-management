## Context

Las secciones de plantilla (`service_template_sections`) actualmente solo tienen `name` y `order`. Las secciones de programa (`service_program_sections`) ya tienen `startTime` y `duration`, pero al crear un programa desde una plantilla esos campos nunca se propagan porque la plantilla no los almacena.

Para el reordenamiento, los programas tienen grupos y secciones con campo `order`, pero no hay endpoints para actualizarlo masivamente ni UI para manipularlo.

## Goals / Non-Goals

**Goals:**
- Agregar `startTime` y `duration` a las secciones de plantilla con migración y propagación al crear programa.
- Implementar dos endpoints de reordenamiento: grupos y secciones de un programa.
- Drag & drop en el detalle del programa para reordenar grupos y secciones.

**Non-Goals:**
- Reordenamiento en la vista de plantilla.
- Recalculación automática en cascada de tiempos.
- Reordenamiento de secciones entre distintos grupos.

## Decisions

### D1 — Campos en plantilla: `startTime` varchar + `duration` int

Misma estructura que en `ServiceProgramSection`. `startTime` como `varchar` (no `time`) para consistencia con el resto del modelo. `duration` en minutos como `int`.

Migración: `1779600000000-AddTimesToTemplateSection.ts`.

### D2 — Propagación al crear programa

En `program.service.ts`, al crear secciones desde plantilla (dos loops: secciones en grupos y secciones sueltas), se agrega `startTime: tSection.startTime, duration: tSection.duration` al `sectionRepo.create({...})`.

### D3 — Endpoints de reordenamiento

```
PATCH /worship-services/programs/:programId/groups/reorder
Body: { orderedIds: string[] }

PATCH /worship-services/programs/:programId/sections/reorder
Body: { orderedIds: string[] }
```

El body recibe el array de IDs en el nuevo orden. El servicio itera y asigna `order = index` a cada entidad, guardando en una sola transacción con `save([...])`.

**Alternativa descartada**: endpoints `up/down` por ID — requieren más llamadas y el frontend con drag & drop ya conoce el orden final completo.

### D4 — Frontend: `@dnd-kit/core` + `@dnd-kit/sortable`

`@dnd-kit` es la librería de drag & drop más moderna para React (accessible, sin dependencias en DOM, compatible con touch). Se instala `@dnd-kit/core` y `@dnd-kit/sortable`.

**Estructura de componentes en program-detail-page.tsx:**

```
<DndContext onDragEnd={handleGroupDragEnd}>
  <SortableContext items={groupIds}>
    {groups.map(group =>
      <SortableGroupCard key={group.id} group={group}>
        <DndContext onDragEnd={handleSectionDragEnd(group.id)}>
          <SortableContext items={sectionIds}>
            {group.sections.map(section =>
              <SortableSectionRow key={section.id} section={section} />
            )}
          </SortableContext>
        </DndContext>
      </SortableGroupCard>
    )}
  </SortableContext>
</DndContext>
```

El drag handle es un ícono `GripVertical` de lucide-react (ya instalado), visible solo cuando `canEdit` es true. Al soltar, se llama al endpoint de reordenamiento con el array de IDs resultante e invalida la query del programa.

### D5 — Template form: campos en SectionDto

En `template.dto.ts`, `SectionDto` agrega `startTime?: string` y `duration?: number`. En `template-response.dto.ts`, `TemplateSectionResponseDto` agrega los mismos campos. El frontend (`template-form-page.tsx`) agrega inputs de tiempo y duración en el formulario de secciones.

## Risks / Trade-offs

- **Orden optimista vs confirmado**: se puede optimizar con actualización optimista en el cliente (reordenar localmente antes de confirmar), pero para simplicidad se espera la respuesta del servidor antes de actualizar la UI. Riesgo: percepción de lentitud. Mitigación: la operación es rápida (solo UPDATE de `order`).
- **Secciones en distintos grupos**: el drag & drop NO permite mover secciones entre grupos. Si el usuario intenta arrastrar fuera, se cancela. Esto es intencional.

## Migration Plan

1. Crear migración `1779600000000-AddTimesToTemplateSection.ts` con `ALTER TABLE service_template_sections ADD COLUMN start_time VARCHAR, ADD COLUMN duration INT`.
2. Actualizar entidad, DTOs y servicio (backend).
3. Instalar `@dnd-kit/core` y `@dnd-kit/sortable` en frontend.
4. Actualizar template form y program detail page.
5. No hay rollback de datos requerido — los campos son nullable.

## Open Questions

- ¿El formulario de edición de secciones en plantilla debe validar formato de `startTime` (HH:MM)? Implementar validación básica con regex en el DTO.
