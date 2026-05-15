## 1. Dependencia e instalación

- [x] 1.1 Instalar `@react-pdf/renderer` y sus tipos en `frontend/`: `npm install @react-pdf/renderer` y `npm install -D @types/react-pdf`

## 2. Componente PDF

- [x] 2.1 Crear `frontend/src/features/worship-services/components/program-pdf-document.tsx` con el componente `ProgramPdfDocument` usando `@react-pdf/renderer`
- [x] 2.2 Definir los estilos del documento con `StyleSheet.create`: página, encabezado, tabla, filas de grupo (fondo morado), filas de sección, celdas
- [x] 2.3 Implementar el encabezado del PDF: logo SVG placeholder inline + nombre del culto + fecha formateada en español
- [x] 2.4 Implementar la fila de encabezado de la tabla con columnas RESPONSABLE, PARTE, DETALLE
- [x] 2.5 Implementar las filas de grupo con fondo morado, texto blanco y nombre del grupo con rango horario opcional
- [x] 2.6 Implementar las filas de sección mapeando `responsible` → RESPONSABLE, `name`/`templateSection.name` → PARTE, `hymnText` → DETALLE
- [x] 2.7 Mostrar `notes` debajo del `hymnText` en la columna DETALLE con estilo gris suave cuando el campo no está vacío
- [x] 2.8 Aplicar filas alternas con fondo gris muy suave en las filas de sección para mejorar la legibilidad

## 3. Hook de descarga

- [x] 3.1 Crear `frontend/src/features/worship-services/hooks/use-program-pdf.ts` con la función `downloadProgramPdf(program)` que usa `pdf(...).download(filename)`
- [x] 3.2 Formatear el nombre del archivo como `programa-<fecha>.pdf` (ej: `programa-2025-05-18.pdf`)

## 4. Integración en la UI

- [x] 4.1 Importar el botón de descarga en `program-detail-page.tsx` y agregar el icono `Download` de `lucide-react`
- [x] 4.2 Agregar el botón "Descargar PDF" en el área de acciones del encabezado de `ProgramDetailPage`, visible para todos los roles y todos los estados del programa
- [x] 4.3 Conectar el botón al hook `downloadProgramPdf` pasando el objeto `program`

## 5. Verificación

- [x] 5.1 Probar la descarga con un programa que tenga grupos, secciones con himnos, notas y responsables
- [x] 5.2 Verificar que el PDF se genera correctamente con un programa sin grupos (solo secciones sueltas)
- [x] 5.3 Verificar que campos vacíos (sin responsable, sin himno, sin notas) no muestran texto espurio en el PDF
- [x] 5.4 Confirmar que el botón funciona en programas con estado DRAFT, PUBLISHED y ARCHIVED
