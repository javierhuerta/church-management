## Why

El formulario de edición de plantillas (`TemplateFormPage`) no carga los datos existentes de la plantilla. Cuando un usuario accede a `/cultos/plantillas/:id/editar`, el formulario se muestra vacío sin los grupos ni secciones ya creados, haciendo imposible la edición de plantillas.

## What Changes

- Modificar `TemplateFormPage` para detectar si está en modo creación o edición
- Cargar datos existentes cuando se edita una plantilla (`useTemplate(id)`)
- Poblar el formulario con los datos cargados usando `reset()`
- Condicionar el envío: `POST` para crear nuevo, `PATCH` para actualizar

## Capabilities

### New Capabilities
- `template-edit-form`: Formulario de edición de plantillas que carga y persiste cambios

### Modified Capabilities
- (ninguno - es un bug fix del formulario existente, no cambia requisitos)

## Impact

**Frontend:**
- `frontend/src/features/worship-services/pages/template-form-page.tsx` - modify
- `frontend/src/features/worship-services/hooks/use-worship-services.ts` - useTemplate ya existe

**Backend:**
- Sin cambios - el endpoint `GET /api/worship-services/templates/:id` ya existe y devuelve los datos correctos

## Fuera del alcance

- Cambios en el backend
- Nuevas funcionalidades de plantillas
- Cambios en la lista de plantillas