## ADDED Requirements

### Requirement: Plantilla marcada para el sitio web

El sistema SHALL permitir marcar una plantilla de culto (`ServiceTemplate`) con una
bandera `showOnWebsite` que indique que sus programas publicados alimentan la sección
Programa/Cultos del sitio público. Se espera que esa plantilla sea "solo culto" (sin
grupo de Escuela Sabática). Se RECOMIENDA que solo una plantilla tenga la bandera
activa a la vez.

#### Scenario: Marcar la plantilla pública
- **WHEN** un editor de cultos marca una plantilla "solo culto" como "mostrar en el sitio web"
- **THEN** el sistema guarda la bandera y esa plantilla pasa a ser la fuente del sitio

#### Scenario: Cambiar la plantilla pública
- **WHEN** un editor marca otra plantilla como pública
- **THEN** el sitio pasa a mostrar los programas publicados de la nueva plantilla

### Requirement: Campos del culto en el programa

El sistema SHALL permitir almacenar `title`, `preacher`, `theme` y `scripture`
(opcionales) en cada `ServiceProgram`, editables por los roles de cultos existentes
(`Admin`, `Pastor`, `Anciano`, `DirectorDepartamento`) en el flujo del módulo Cultos.

#### Scenario: Completar datos del culto
- **WHEN** un editor de cultos ingresa predicador, tema y texto bíblico en el programa
- **THEN** el sistema persiste esos valores en el programa

#### Scenario: Datos opcionales
- **WHEN** un editor publica un programa sin completar título/predicador/tema/texto bíblico
- **THEN** el sistema permite la publicación con esos campos en null

### Requirement: Endpoint público del culto del sábado

El sistema SHALL exponer `GET /api/public/worship` (sin autenticación) que devuelva el
programa `Published` del próximo sábado (o del sábado actual) cuya plantilla tiene
`showOnWebsite = true`. La respuesta SHALL incluir `upcoming` (booleano), `date`,
`title`, `preacher`, `theme`, `scripture` e `items` (`id`, `a`, `n`, `d`, `accent`).
Las secciones de un eventual grupo "Escuela Sabática" SHALL excluirse.

#### Scenario: Hay programa publicado
- **WHEN** existe un programa PUBLISHED para el sábado en la plantilla marcada
- **THEN** el endpoint devuelve `upcoming: true` con encabezado e items del culto, sin Escuela Sabática

#### Scenario: No hay programa publicado
- **WHEN** no existe programa PUBLISHED para el sábado en la plantilla marcada
- **THEN** el endpoint devuelve `{ upcoming: false }`

#### Scenario: Salvaguarda Escuela Sabática
- **WHEN** el programa incluye un grupo "Escuela Sabática"
- **THEN** el endpoint excluye sus secciones de la respuesta

### Requirement: Tab explicativa de Cultos en Configuraciones

La sección Configuraciones SHALL incluir una tab "Cultos" de tipo explicativa que
indique cómo configurar el culto del sitio (crear plantilla "solo culto", marcarla
para el sitio, publicar el programa del sábado con predicador/tema/texto bíblico) y
ofrezca un enlace al módulo de Cultos. La edición de esos datos NO se hace en esta tab.

#### Scenario: Explicación y redirección
- **WHEN** un administrador abre la tab "Cultos" en Configuraciones
- **THEN** el sistema explica el flujo y ofrece un enlace a `/admin/cultos`
