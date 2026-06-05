# site-section-cultos

## Purpose

Define la especificacion principal para la seccion Programa/Cultos del sitio publico, incluyendo la plantilla publica de culto, los campos de encabezado del programa, el endpoint publico de culto del sabado y la integracion en Inicio y Configuraciones.

## Requirements

### Requirement: Plantilla marcada para el sitio web

El sistema SHALL permitir marcar una plantilla de culto (`ServiceTemplate`) con una
bandera `showOnWebsite` que indique que sus programas publicados alimentan la seccion
Programa/Cultos del sitio publico. Se espera que esa plantilla sea "solo culto" (sin
grupo de Escuela Sabatica). Se RECOMIENDA que solo una plantilla tenga la bandera
activa a la vez.

#### Scenario: Marcar la plantilla publica
- **WHEN** un editor de cultos marca una plantilla "solo culto" como "mostrar en el sitio web"
- **THEN** el sistema guarda la bandera y esa plantilla pasa a ser la fuente del sitio

#### Scenario: Cambiar la plantilla publica
- **WHEN** un editor marca otra plantilla como publica
- **THEN** el sitio pasa a mostrar los programas publicados de la nueva plantilla

### Requirement: Campos del culto en el programa

El sistema SHALL permitir almacenar `title`, `preacher`, `theme` y `scripture`
(opcionales) en cada `ServiceProgram`, editables por los roles de cultos existentes
(`Admin`, `Pastor`, `Anciano`, `DirectorDepartamento`) en el flujo del modulo Cultos.

#### Scenario: Completar datos del culto
- **WHEN** un editor de cultos ingresa predicador, tema y texto biblico en el programa
- **THEN** el sistema persiste esos valores en el programa

#### Scenario: Datos opcionales
- **WHEN** un editor publica un programa sin completar titulo/predicador/tema/texto biblico
- **THEN** el sistema permite la publicacion con esos campos en null

### Requirement: Endpoint publico del culto del sabado

El sistema SHALL exponer `GET /api/public/worship` (sin autenticacion) que devuelva el
programa `Published` del proximo sabado (o del sabado actual) cuya plantilla tiene
`showOnWebsite = true`. La respuesta SHALL incluir `upcoming` (booleano), `date`,
`title`, `preacher`, `theme`, `scripture` e `items` (`id`, `a`, `n`, `d`, `accent`).
Las secciones de un eventual grupo "Escuela Sabatica" SHALL excluirse. Cuando no exista
programa publicado pero si una plantilla marcada, el endpoint SHALL devolver los datos
de esa plantilla predeterminada con `upcoming: false`.

#### Scenario: Hay programa publicado
- **WHEN** existe un programa PUBLISHED para el sabado en la plantilla marcada
- **THEN** el endpoint devuelve `upcoming: true` con encabezado e items del culto, sin Escuela Sabatica

#### Scenario: No hay programa publicado pero hay plantilla marcada (fallback)
- **WHEN** no existe programa PUBLISHED para el sabado pero si una plantilla con `showOnWebsite = true`
- **THEN** el endpoint devuelve `upcoming: false` con `date` del proximo sabado, `title` por defecto de la plantilla, `preacher`/`theme`/`scripture` en null e `items` de las secciones de la plantilla (sin Escuela Sabatica)

#### Scenario: No hay plantilla marcada
- **WHEN** no existe ninguna plantilla con `showOnWebsite = true`
- **THEN** el endpoint devuelve `{ upcoming: false }` sin items

#### Scenario: Salvaguarda Escuela Sabatica
- **WHEN** el programa o la plantilla incluye un grupo "Escuela Sabatica"
- **THEN** el endpoint excluye sus secciones de la respuesta

### Requirement: Seccion "Proximo culto" en Inicio

La pantalla de Inicio del sitio publico SHALL mostrar una seccion "Proximo culto"
alimentada por `GET /api/public/worship`, con la fecha del proximo sabado y el titulo
del culto siempre, y el predicador y el tema cuando exista programa publicado
(`upcoming: true`).

#### Scenario: Proximo culto con programa publicado
- **WHEN** un visitante abre la pantalla de Inicio y hay un programa publicado del proximo sabado
- **THEN** la seccion "Proximo culto" muestra fecha, titulo, predicador y tema

#### Scenario: Proximo culto sin programa publicado
- **WHEN** un visitante abre Inicio y no hay programa publicado del proximo sabado
- **THEN** la seccion muestra la fecha y el titulo del culto (datos de plantilla) con una indicacion sutil de que el programa aun no esta publicado

### Requirement: Tab explicativa de Cultos en Configuraciones

La seccion Configuraciones SHALL incluir una tab "Cultos" de tipo explicativa que
indique como configurar el culto del sitio (crear plantilla "solo culto", marcarla
para el sitio, publicar el programa del sabado con predicador/tema/texto biblico) y
ofrezca un enlace al modulo de Cultos. La edicion de esos datos NO se hace en esta tab.

#### Scenario: Explicacion y redireccion
- **WHEN** un administrador abre la tab "Cultos" en Configuraciones
- **THEN** el sistema explica el flujo y ofrece un enlace a `/admin/cultos`
