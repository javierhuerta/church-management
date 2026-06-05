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

### 3. Endpoint público con fallback de plantilla

`GET /api/public/worship` (sin guard): próximo sábado (o actual) con programa
`Published` de la plantilla marcada. Devuelve encabezado + items mapeados al shape
de `PagePrograma`, con `upcoming: true`.

**Fallback (sin programa publicado)**: cuando no existe un programa `Published`
para el sábado, el endpoint NO devuelve vacío. En su lugar arma la respuesta a
partir de la **plantilla predeterminada "solo culto" (sábado 11:00)** marcada con
`showOnWebsite = true`:
- `date`: el próximo sábado calculado.
- `title`: título por defecto de la plantilla (ej. "Culto Divino").
- `preacher` / `theme` / `scripture`: `null` (aún no asignados).
- `items`: las secciones de la plantilla (sus `name`, responsables/horarios por
  defecto si existen), excluyendo Escuela Sabática.
- `upcoming: false`: marca que es contenido de plantilla, no un programa publicado.

Así Programa e Inicio siempre muestran la estructura del culto (como el ejemplo
actual del sitio) aunque aún no se haya cargado el programa del próximo sábado. Si
no existe ninguna plantilla marcada, el endpoint devuelve `{ upcoming: false }` sin
items y el sitio cae a su contenido estático mínimo.

### 3b. Sección "Próximo culto" en Inicio

La pantalla de Inicio (`PageInicio`) consume el **mismo** `GET /api/public/worship`
y muestra una sección compacta "Próximo culto" con `date`, `title`, `preacher` y
`theme` (no la tabla completa de partes, que vive en Programa). Cuando
`upcoming: false`, muestra los datos de la plantilla (sin predicador/tema) e indica
de forma sutil que el programa aún no está publicado.

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

### 5. Seeder de datos reales del culto público

Un seeder crea: (a) la plantilla "solo culto" sábado 11:00 con `showOnWebsite = true`
y sus secciones (las partes actuales del ejemplo del sitio), y (b) un programa
`Published` de ejemplo para el próximo sábado con predicador/tema/texto bíblico. Así
el sitio muestra contenido real desde el primer arranque y se puede validar tanto el
camino "con programa" como el "fallback de plantilla". Sigue las reglas de seeders del
proyecto: cada entidad hija (grupos/secciones) se guarda con su repositorio y FK
explícito (no confiar en cascade implícito).

## UI Scenarios

### Escenario A — Programa con culto publicado
1. Existe un programa `Published` del próximo sábado en la plantilla marcada.
2. El visitante abre la página **Programa** del sitio público.
3. Ve el encabezado del culto (título, fecha, predicador, tema, texto bíblico) y la
   tabla de partes (anuncia/programa/detalle), con la fila del sermón resaltada
   (`accent`).
4. No aparece ningún control de edición (vista solo lectura); sí el botón de PDF.

### Escenario B — Programa sin culto publicado (fallback de plantilla)
1. No hay programa `Published` para el próximo sábado.
2. El visitante abre la página **Programa**.
3. Ve la estructura de partes de la plantilla predeterminada (sábado 11:00) con
   título "Culto Divino", sin predicador/tema (campos vacíos o atenuados).
4. La página se ve completa y consistente, no vacía.

### Escenario C — "Próximo culto" en Inicio
1. El visitante abre la pantalla de **Inicio**.
2. Ve la sección "Próximo culto" con la fecha del próximo sábado y, si hay programa
   publicado, el predicador y el tema.
3. Si no hay programa publicado, ve la fecha y el título del culto (datos de
   plantilla) con una indicación sutil de que el programa aún no está disponible.
4. Un enlace/botón lleva a la página **Programa** para ver el detalle.

### Escenario D — Tab "Cultos" en Configuraciones (admin)
1. Un administrador abre Configuraciones → tab **Cultos**.
2. Ve una tarjeta explicativa (`ConfigRedirectCard`) con los 3 pasos del flujo.
3. Pulsa "Ir a Cultos" y es redirigido a `/admin/cultos`.

## Diseño visual

- **Carga obligatoria del skill `church-ui-design`** antes de implementar cualquier
  componente o pantalla de esta sección.
- **Colores**: usar la paleta de marca vía clases semánticas (no hardcodear hex en
  componentes). El acento del sermón y la sección "Próximo culto" usan el color de
  acento/dorado de la marca según el skill. Soporte de dark mode obligatorio.
- **Tipografía**: respetar la jerarquía del skill (sin depender de tags HTML
  semánticos): título del culto como display, predicador/tema como subtítulo,
  partes como cuerpo/listado.
- **Mobile/desktop split**: la tabla de partes en Programa y la tarjeta "Próximo
  culto" en Inicio siguen el patrón obligatorio mobile/desktop del skill (lista
  apilada en mobile, tabla/grilla en desktop).
- **Tab Cultos (admin)**: reutiliza `ConfigRedirectCard` de la base, sin estilos
  nuevos; consistente con las demás tabs explicativas.

## Notas

- El sitio es solo lectura; se quitan los controles de edición inline de la vista
  pública de `PagePrograma`.
- `accent` se infiere por nombre de sección (sermón/predicación/palabra) para
  resaltar la predicación.
- Inicio y Programa comparten el mismo endpoint para evitar inconsistencias entre
  ambas vistas.
