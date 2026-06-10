# site-config-admin

## Purpose

Definir la especificacion principal de la seccion "Configuraciones" del admin, que agrupa la personalizacion de las secciones del sitio publico mediante navegacion por tabs, con dos tipos de tabs: editor (administra contenido) y explicativa (enlaza al modulo existente), y un almacen clave/valor (SiteSetting) mas subida de imagenes.

## Requirements

### Requirement: Seccion "Configuraciones" en el admin

El sistema SHALL ofrecer en el admin una seccion "Configuraciones" accesible desde el menu de navegacion, bajo la ruta `/admin/configuraciones`, que agrupa la personalizacion de las secciones del sitio publico.

#### Scenario: Acceder a Configuraciones
- **WHEN** un usuario administrador abre "Configuraciones" desde el sidebar
- **THEN** el sistema muestra la seccion de configuracion con su navegacion por tabs

#### Scenario: Acceso restringido
- **WHEN** un usuario sin rol administrador intenta entrar a Configuraciones
- **THEN** el sistema no permite gestionar la configuracion

### Requirement: Navegacion por tabs por seccion del sitio

La seccion Configuraciones SHALL presentar una navegacion por **tabs**, donde cada tab corresponde a una seccion del sitio publico. La base SHALL permitir que nuevas secciones registren su tab sin modificar las existentes.

#### Scenario: Cambiar de tab
- **WHEN** un administrador selecciona una tab de seccion
- **THEN** el sistema muestra las opciones de personalizacion de esa seccion en `/admin/configuraciones/<seccion>`

#### Scenario: Indice sin tab seleccionada
- **WHEN** un administrador entra a Configuraciones sin elegir una tab
- **THEN** el sistema muestra un indice/bienvenida de la seccion de configuracion

### Requirement: Tabs editor y tabs explicativas

Una tab de seccion SHALL ser de tipo **editor** (administra el contenido de la seccion) o de tipo **explicativa/redireccion** (la seccion se alimenta de un modulo existente del sistema; la tab explica donde/como se gestiona y enlaza a ese modulo). La base SHALL proveer un componente reutilizable para las tabs explicativas.

La tab "Transmisiones" SHALL ser de tipo editor: administra la configuracion del canal de YouTube (`channelId`, `channelHandle`, `isLiveManual`) y el CRUD de predicaciones anteriores (SermonVideo). NO SHALL requerir API Key de YouTube.

#### Scenario: Tab explicativa redirige al modulo
- **WHEN** un administrador abre una tab explicativa (p.ej. Calendario o Cultos)
- **THEN** el sistema muestra la explicacion de donde se gestiona ese contenido y un enlace/boton para ir al modulo correspondiente

### Requirement: Almacen generico de configuraciones (SiteSetting)

El sistema SHALL ofrecer un almacen clave/valor (`SiteSetting`) para configuraciones simples del sitio (textos, banderas, rutas de imagenes), con helpers para leer y escribir un valor por clave.

#### Scenario: Guardar un valor de configuracion
- **WHEN** un proceso del admin guarda un valor para una clave de configuracion
- **THEN** el sistema persiste el valor y lo expone al leer esa clave

#### Scenario: Leer una clave inexistente
- **WHEN** se lee una clave que nunca fue escrita
- **THEN** el sistema devuelve un valor nulo (sin error)

### Requirement: Subida de imagenes del sitio

El sistema SHALL permitir subir imagenes para la configuracion del sitio, almacenandolas bajo `uploads/site/` y exponiendolas como URL publica `/uploads/site/<archivo>`. SHALL aceptar solo archivos `image/*` dentro del limite de tamano configurado.

#### Scenario: Subir una imagen valida
- **WHEN** un administrador sube una imagen de configuracion valida
- **THEN** el sistema la guarda y devuelve su URL publica

#### Scenario: Rechazar archivo no imagen
- **WHEN** un administrador sube un archivo que no es imagen
- **THEN** el sistema rechaza la solicitud
