## Context

El formulario `TemplateFormPage` actualmente usa `useForm` con `defaultValues` vacíos. No tiene forma de distinguir entre modo creación y modo edición, ni carga los datos existentes de la plantilla cuando se edita.

La ruta `/cultos/plantillas/:id/editar` ya existe en el router (App.tsx:121), pero el componente no la maneja correctamente.

## Goals / Non-Goals

**Goals:**
- Detectar modo creación vs edición desde la URL
- Cargar datos de plantilla existente via `useTemplate(id)`
- Poblar formulario con datos cargados
- Enviar a endpoint correcto (create vs update)

**Non-Goals:**
- Cambiar UI/UX del formulario
- Modificar backend
- Agregar validación adicional
- Cambiar estructura de datos

## Decisions

1. **Usar `useParams` de react-router para obtener el id**
   - Extrae `:id` de la URL
   - Si existe, está en modo edición; si no, modo creación

2. **Usar hook `useTemplate` existente**
   - Ya existe en `use-worship-services.ts`
   - Devuelve `ServiceTemplateResponseDto` con `groups` y `sections`

3. **Poblar formulario con `reset()` después de cargar datos**
   - `useEffect` observa el estado `data` del query
   - Cuando llega, llama `reset(transformedData)`

4. **Transformar datos del DTO al formato del formulario**
   - El DTO tiene `groups: TemplateGroupResponseDto[]` y `sections: TemplateSectionResponseDto[]`
   - El formulario espera `groups: GroupInput[]` y `sections: SectionInput[]`
   - Necesario transformar para que `reset()` funcione correctamente

## Risks / Trade-offs

- **Data transformation**: La estructura del DTO puede no coincidir exactamente con lo que `useFieldArray` espera → Mitigation: crear función de transformación que mapee campos

- **Loading state**: Si los datos tardan en cargar, el formulario muestra defaultValues vacíos → Mitigation: mostrar estado de carga o deshabilitar formulario mientras carga