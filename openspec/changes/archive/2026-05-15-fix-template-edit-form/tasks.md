## 1. Modificar TemplateFormPage para detectar modo edición

- [x] 1.1 Importar `useParams` de react-router-dom
- [x] 1.2 Extraer `id` de los parámetros de la URL
- [x] 1.3 Crear estado para determinar si es modo edición
- [x] 1.4 Actualizar título dinámico: "Nueva plantilla" vs "Editar plantilla"

## 2. Cargar datos de plantilla existente

- [x] 2.1 Importar `useTemplate` de los hooks
- [x] 2.2 Usar `useTemplate(id)` cuando existe `id` en la URL
- [x] 2.3 Mostrar estado de carga mientras se obtienen los datos
- [x] 2.4 Crear función para transformar `ServiceTemplateResponseDto` a `FormValues`

## 3. Poblar formulario con datos cargados

- [x] 3.1 Usar `useEffect` para observar `data` del query
- [x] 3.2 Llamar `reset(transformedData)` cuando lleguen los datos
- [x] 3.3 Verificar que `groups` y `sections` se rendericen correctamente

## 4. Modificar envío del formulario

- [x] 4.1 Condicionar endpoint según modo: `create` vs `update`
- [x] 4.2 En modo edición, usar `WorshipServicesTemplatesService.templateControllerUpdate`
- [x] 4.3 Mantener navegación correcta después de guardar
- [x] 4.4 Cambiar texto del botón: "Crear plantilla" vs "Guardar cambios"