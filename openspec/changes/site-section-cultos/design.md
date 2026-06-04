## Contexto

El módulo `worship-services` ya modela plantillas (`ServiceTemplate`, con tipos en
`ServiceTemplateType` y `ProgramStatus`), programas (`ServiceProgram`) con grupos y
secciones, y estados DRAFT/PUBLISHED/ARCHIVED. La página `PagePrograma` del sitio
muestra el Culto Divino del sábado con encabezado (predicador, tema, texto bíblico)
y la tabla de partes.

## Decisiones

### 1. La plantilla "solo culto" es la fuente del sitio

En lugar de filtrar por nombre de grupo, el contenido público se determina por una
**plantilla marcada** (`ServiceTemplate.showOnWebsite = true`). Se espera que esa
plantilla sea "solo culto" (sin grupo de Escuela Sabática). El sitio muestra el
programa `Published` del sábado correspondiente basado en esa plantilla.

- Ventaja: el administrador controla explícitamente qué plantilla alimenta el sitio,
  desde el módulo de Cultos (donde corresponde).
- Salvaguarda: si por alguna razón el programa incluye un grupo "Escuela Sabática",
  el endpoint lo excluye igualmente.
- Recomendado: validar que solo una plantilla tenga `showOnWebsite = true`.

### 2. Datos por-sábado en el programa

`title`, `preacher`, `theme`, `scripture` son por-sábado → columnas en
`ServiceProgram`, editables en el flujo existente del módulo de Cultos. No se
gestionan en Configuraciones.

### 3. Endpoint público

`GET /api/public/worship` (sin guard): próximo sábado (o actual) con programa
`Published` de la plantilla marcada. Devuelve encabezado + items mapeados al shape
de `PagePrograma`. Sin programa → `{ upcoming: false }` y el sitio muestra contenido
por defecto.

### 4. Tab "Cultos": explicativa/redirección

La tab no edita datos del culto. Usa `ConfigRedirectCard` (base) para explicar el
flujo y enlazar a `/admin/cultos`:
1. Crear una plantilla "solo culto".
2. Marcarla "mostrar en el sitio web".
3. Crear/publicar el programa del sábado con predicador, tema y texto bíblico.

## Permisos

- Editar plantillas/programas y `showOnWebsite`: roles existentes de Cultos
  (`Admin`, `Pastor`, `Anciano`, `DirectorDepartamento`).
- Tab explicativa visible para `Admin`.
- Lectura pública anónima (solo `Published`).

## Notas

- El sitio es solo lectura; se quitan los controles de edición inline de la vista
  pública de `PagePrograma`.
- `accent` se infiere por nombre de sección (sermón/predicación/palabra) para
  resaltar la predicación.
