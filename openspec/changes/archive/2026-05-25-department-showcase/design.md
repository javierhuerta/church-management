## Context

Actualmente el sistema tiene un módulo `departments` con CRUD básico (Admin-only) y una relación ManyToMany entre `User` y `Department` vía la tabla `user_departments`. Los usuarios con rol `DirectorDepartamento` están asociados a uno o más departamentos pero no tienen ningún espacio en la plataforma para publicar contenido propio de su departamento.

El módulo `document-center` ya tiene una entidad `ChurchDocument` que referencia `department_id`, pero está diseñado para documentos oficiales de la iglesia (actas, informes), no para contenido descriptivo y promocional de cada departamento.

### Stakeholders
- **Directores de Departamento**: Necesitan un espacio para comunicar la misión, actividades y recursos de su departamento.
- **Miembros de la iglesia**: Necesitan un lugar centralizado para conocer cada departamento.
- **Pastor y Administración**: Necesitan visibilidad del contenido que publica cada departamento.

## Goals / Non-Goals

**Goals:**
- Proveer un endpoint REST para que el director del departamento guarde y actualice contenido descriptivo (texto enriquecido) de su departamento.
- Permitir adjuntar archivos (PDF, imágenes) al showcase del departamento.
- Mostrar el showcase de cada departamento a cualquier usuario autenticado.
- Restringir la edición al director del departamento correspondiente y a Admins.
- Integrar la eliminación en cascada: al borrar un departamento, se elimina su showcase y archivos.

**Non-Goals:**
- No se implementa versionado ni historial de cambios del contenido.
- No hay sistema de comentarios ni interacción social.
- No se soportan múltiples idiomas.
- No hay flujo de aprobación (el director publica directamente).
- No se integra con el `document-center` existente (son propósitos distintos).

## Decisions

### Decisión 1: Entidad separada `DepartmentShowcase` en lugar de extender `Department`

**Alternativa considerada**: Agregar columnas `description` y `mission` directamente a la entidad `Department`.

**Decisión**: Crear una entidad separada `DepartmentShowcase` con relación OneToOne a `Department`.

**Razón**: 
- Separación de responsabilidades: el CRUD de departamentos (Admin) y el contenido del showcase (Director) son capacidades distintas con diferentes permisos.
- El contenido enriquecido (HTML/Markdown) puede crecer y no pertenece a los metadatos administrativos del departamento.
- Facilita la eliminación en cascada sin contaminar la entidad Department con lógica de archivos.

### Decisión 2: Relación OneToOne entre Department y DepartmentShowcase

**Alternativa considerada**: OneToMany (un departamento puede tener múltiples showcases, ej. por año).

**Decisión**: OneToOne. Cada departamento tiene exactamente un showcase activo.

**Razón**: El caso de uso no requiere múltiples versiones. Si en el futuro se necesita historial, se puede evolucionar a OneToMany. OneToOne simplifica la API y la UI.

### Decisión 3: Adjuntos como entidad separada `ShowcaseAttachment`

**Alternativa considerada**: Reutilizar `ChurchDocument` del módulo `document-center`.

**Decisión**: Entidad nueva `ShowcaseAttachment` con relación ManyToOne a `DepartmentShowcase`, independiente de `ChurchDocument`.

**Razón**:
- `ChurchDocument` tiene categorías fijas (actas, informes) que no aplican a los adjuntos del showcase.
- Los permisos son diferentes: `ChurchDocument` requiere roles de editor (Admin, Pastor, Secretaria); los adjuntos del showcase los gestiona el director del departamento.
- Separar evita acoplamiento y mantiene cada módulo con su propio dominio.

### Decisión 4: Almacenamiento de archivos en disco con referencia en BD

**Alternativa considerada**: Almacenar archivos como BLOB en PostgreSQL.

**Decisión**: Archivos guardados en `uploads/showcase/` en el servidor, con referencias (path, mimetype, tamaño) en la tabla `showcase_attachments`.

**Razón**: Mejor performance, backups más simples, y es el mismo patrón que usa `document-center`. PostgreSQL no está optimizado para servir archivos grandes.

### Decisión 5: No usar `node_modules` externos para rich text

**Alternativa considerada**: Integrar TipTap, Quill, o Slate como editor WYSIWYG.

**Decisión**: Usar un `<textarea>` con soporte Markdown en la primera iteración, renderizado como HTML en la vista de lectura.

**Razón**: Reduce la complejidad inicial y el bundle size. Si se necesita un editor WYSIWYG en el futuro, se puede migrar el contenido (Markdown es portable). Los directores no son usuarios técnicos pero el formato Markdown básico (títulos, negritas, listas) es suficiente para el MVP.

### Decisión 6: UI con patrón mobile/desktop obligatorio

**Decisión**: La página de showcase sigue el patrón del sistema: en mobile se muestra como lista vertical apilada, en desktop como layout de dos columnas (contenido principal + barra lateral con adjuntos).

**Razón**: Consistencia con el resto de la plataforma (calendario, documentos, cultos).

## Risks / Trade-offs

- **[Riesgo] Un director publica contenido inapropiado** → **Mitigación**: Los Admins y el Pastor tienen acceso de edición a todos los departamentos y pueden moderar. En el futuro se puede agregar un flag `is_published` con flujo de aprobación.
- **[Riesgo] Archivos adjuntos grandes saturan el disco** → **Mitigación**: Limitar tamaño máximo de archivo a 10MB por adjunto y máximo 10 adjuntos por showcase (validación en backend).
- **[Riesgo] Markdown no es amigable para usuarios no técnicos** → **Mitigación**: Proveer una pequeña guía de formato Markdown en la UI. Si hay adopción baja, migrar a WYSIWYG en iteración futura.
- **[Trade-off] OneToOne limita a un showcase por departamento** → Si en el futuro se necesita historial o versiones, se puede migrar la FK a OneToMany sin romper la API (el endpoint puede aceptar un query param `?version=`).

## Migration Plan

1. Crear migración para las nuevas tablas `department_showcases` y `showcase_attachments`.
2. Ejecutar migración en desarrollo y staging.
3. Desplegar backend con nuevos endpoints (zero-downtime: solo se agregan rutas).
4. Desplegar frontend con nuevas páginas.
5. No se requiere migración de datos (no hay contenido previo que migrar).

**Rollback**: Eliminar las tablas nuevas y revertir el deploy del frontend. El CRUD de departamentos no se modifica (solo se agrega cascade delete).

## Open Questions

- ¿Qué formato de texto enriquecido usar? → Decidido: Markdown para MVP.
- ¿Los adjuntos deben ser visibles para usuarios no autenticados? → Decidido: Solo usuarios autenticados (requiere JWT).
- ¿Se debe notificar al Pastor cuando un director actualiza su showcase? → No en esta iteración.

## UI Scenarios

### Escenario 1: Vista pública del showcase de un departamento
1. Usuario autenticado navega a "Departamentos" desde el sidebar.
2. Ve una lista de departamentos con nombre, sigla y color.
3. Al hacer clic en un departamento, se muestra la página de showcase con:
   - Nombre y sigla del departamento (con su color de identidad)
   - Descripción del departamento (renderizada desde Markdown)
   - Misión y anuncios (secciones separadas)
   - Lista de archivos adjuntos (nombre, tipo, fecha) con botón de descarga

### Escenario 2: Edición del showcase por el director
1. Director de "Jóvenes" inicia sesión.
2. En el sidebar ve un acceso directo a "Mi Departamento" (o desde la lista de departamentos).
3. Al entrar al showcase de su departamento, ve un botón "Editar".
4. Se muestra un formulario con:
   - Campo de descripción (textarea para Markdown)
   - Campo de misión (textarea para Markdown)
   - Campo de anuncios (textarea para Markdown)
   - Sección de archivos adjuntos con botón "Subir archivo"
   - Previsualización en tiempo real del Markdown renderizado
5. Puede subir archivos (arrastrar o seleccionar), ver los existentes y eliminarlos.
6. Al guardar, el showcase se actualiza y se redirige a la vista pública.

### Escenario 3: Admin modera contenido de cualquier departamento
1. Admin navega a cualquier departamento.
2. Ve el mismo botón "Editar" que el director.
3. Puede modificar y guardar el contenido igual que el director.

### Escenario 4: Vista mobile del showcase
1. Usuario en mobile ve la lista de departamentos como cards apiladas.
2. Al seleccionar un departamento, el contenido se muestra en una sola columna.
3. Los adjuntos aparecen al final del contenido (no en sidebar).
4. El editor en mobile muestra los campos de texto a ancho completo con previsualización toggle.

## Diseño visual

### Paleta de colores
- **Fondo de página**: `bg-background` (sistema)
- **Tarjeta de departamento**: `bg-card` con borde izquierdo del color del departamento (4px, `style="borderLeftColor: ${dept.color}"`)
- **Badge de sigla**: Fondo del color del departamento con texto blanco (`style="backgroundColor: ${dept.color}"`)
- **Secciones de contenido**: `bg-muted/30` con bordes redondeados
- **Botón de edición**: `variant="outline"` con ícono de lápiz
- **Archivos adjuntos**: Cards con ícono de archivo, `bg-accent/10`

### Mobile/Desktop split
- **Desktop (≥768px)**: Layout de dos columnas — contenido principal (70%) + sidebar de adjuntos (30%)
- **Mobile (<768px)**: Layout de una columna — contenido arriba, adjuntos abajo como lista horizontal con scroll

### Tipografía
- **Nombre del departamento**: `text-2xl font-bold` con color del departamento
- **Sigla**: `text-sm font-medium` en badge
- **Títulos de sección** (Descripción, Misión, Anuncios): `text-lg font-semibold`
- **Contenido renderizado**: `text-base leading-relaxed` en `prose` (Markdown renderizado)
- **Nombres de archivo**: `text-sm font-medium`

### Estados
- **Empty state**: Si el showcase no tiene contenido, mostrar mensaje "Este departamento aún no ha publicado contenido" con ícono informativo.
- **Loading**: Skeleton cards mientras carga el contenido.
- **Error**: Toast con mensaje de error si falla la carga o el guardado.
