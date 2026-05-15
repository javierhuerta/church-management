## Why

Los programas de culto configurados en el sistema necesitan poder compartirse e imprimirse para distribuirlos a los participantes antes o durante el servicio. Hoy esa información solo existe dentro de la app y no hay forma de exportarla.

## What Changes

- Se agrega un botón "Descargar PDF" en la página de detalle del programa de culto.
- El PDF generado incluye: nombre del culto, fecha, grupos (como separadores visuales) y secciones con responsable, parte y detalle (himno + notas).
- La generación ocurre completamente en el frontend, sin nuevos endpoints en el backend.
- Se instala `@react-pdf/renderer` como nueva dependencia del frontend.
- Se usa un logo SVG placeholder que puede reemplazarse más adelante por el logo definitivo de la iglesia.

## Capabilities

### New Capabilities

- `worship-program-pdf`: Capacidad de generar y descargar un PDF del programa de culto desde la página de detalle, disponible para cualquier estado (DRAFT, PUBLISHED, ARCHIVED).

### Modified Capabilities

- `worship-service-programs`: Se agrega una acción de exportación a PDF en la vista de detalle del programa. No cambian los requisitos del módulo, solo se añade un punto de entrada de UI.

## Fuera del alcance

- Envío del PDF por correo o mensajería.
- Generación del PDF desde el backend.
- Personalización del diseño del PDF por parte del usuario.
- Configuración del logo desde la UI.

## Impact

- **Frontend**: nuevo componente `ProgramPdfDocument` usando `@react-pdf/renderer`. Botón agregado en `program-detail-page.tsx`.
- **Backend**: sin cambios. No se crean endpoints nuevos.
- **Dependencias**: se agrega `@react-pdf/renderer` al `package.json` del frontend.
- **Módulo NestJS afectado**: ninguno (cambio puramente frontend).
- **Roles**: el botón de descarga está disponible para todos los roles que pueden ver el programa.
