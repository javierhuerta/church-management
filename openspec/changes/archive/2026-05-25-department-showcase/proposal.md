## Why

Cada departamento de la iglesia (Jóvenes, Familia, Misionero, etc.) necesita un espacio propio en la plataforma donde su director pueda publicar contenido descriptivo, anuncios y archivos relevantes. Actualmente no existe ningún mecanismo para que los directores de departamento comuniquen sus actividades, planes o recursos a la congregación dentro del sistema. Esto deja a los departamentos invisibles en la plataforma y fuerza a los directores a usar canales externos (WhatsApp, email) para compartir información.

## What Changes

- **Nueva entidad `DepartmentShowcase`**: Almacena contenido enriquecido (descripción, misión, anuncios) por departamento, con soporte para texto formateado y archivos adjuntos.
- **Nuevos endpoints REST**: CRUD para el showcase del departamento, accesible para el director del departamento y admins.
- **Subida de archivos adjuntos**: Los directores podrán adjuntar archivos (PDF, imágenes, documentos) al showcase de su departamento.
- **Página de visualización pública**: Cualquier usuario autenticado podrá ver el showcase de un departamento.
- **Interfaz de edición**: Una página dedicada donde el director de departamento edita el contenido de su departamento, con editor de texto enriquecido y gestión de archivos.
- **Navegación**: Acceso al showcase desde el sidebar o desde la lista de departamentos.

## Capabilities

### New Capabilities
- `department-showcase-content`: Almacenamiento y edición de contenido descriptivo por departamento (descripción, misión, anuncios) con texto enriquecido.
- `department-showcase-attachments`: Subida, almacenamiento y gestión de archivos adjuntos asociados al showcase de un departamento.
- `department-showcase-display`: Visualización pública del showcase de un departamento para usuarios autenticados.

### Modified Capabilities
- `mantenedor-departamentos`: El CRUD de departamentos se extiende para vincular cada departamento con su showcase. La eliminación de un departamento debe eliminar en cascada su showcase y archivos asociados.

## Impact

- **Backend**: Nuevo módulo `department-showcase` con entidad `DepartmentShowcase`, controlador, servicio, DTOs y manejo de archivos. Migración de base de datos para la nueva tabla.
- **Frontend**: Nuevas páginas en `features/departments/` para visualización y edición del showcase. Componentes de editor de texto enriquecido, upload de archivos y galería de adjuntos.
- **Base de datos**: Nueva tabla `department_showcases` con FK a `departments` y tabla `department_showcase_attachments` para archivos.
- **Permisos**: El rol `DirectorDepartamento` requiere acceso de escritura a su propio departamento. El rol `Admin` mantiene acceso completo.
- **API**: Nuevos endpoints bajo `/api/departments/:id/showcase` para el contenido y `/api/departments/:id/showcase/attachments` para archivos.

## Fuera del alcance

- **No** se implementa un sistema de comentarios o feedback sobre el showcase.
- **No** se incluye historial de versiones del contenido editado.
- **No** se soportan múltiples idiomas por showcase (solo español).
- **No** se incluyen notificaciones automáticas cuando se actualiza un showcase.
- **No** se implementa un sistema de aprobación (el director publica directamente).
- **No** se migra contenido existente desde fuentes externas.
