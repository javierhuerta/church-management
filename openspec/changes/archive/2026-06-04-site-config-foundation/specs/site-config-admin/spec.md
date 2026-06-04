## ADDED Requirements

### Requirement: Sección "Configuraciones" en el admin

El sistema SHALL ofrecer en el admin una sección "Configuraciones" accesible desde
el menú de navegación, bajo la ruta `/admin/configuraciones`, que agrupa la
personalización de las secciones del sitio público.

#### Scenario: Acceder a Configuraciones
- **WHEN** un usuario administrador abre "Configuraciones" desde el sidebar
- **THEN** el sistema muestra la sección de configuración con su navegación por tabs

#### Scenario: Acceso restringido
- **WHEN** un usuario sin rol administrador intenta entrar a Configuraciones
- **THEN** el sistema no permite gestionar la configuración

### Requirement: Navegación por tabs por sección del sitio

La sección Configuraciones SHALL presentar una navegación por **tabs**, donde cada
tab corresponde a una sección del sitio público. La base SHALL permitir que nuevas
secciones registren su tab sin modificar las existentes.

#### Scenario: Cambiar de tab
- **WHEN** un administrador selecciona una tab de sección
- **THEN** el sistema muestra las opciones de personalización de esa sección en
  `/admin/configuraciones/<seccion>`

#### Scenario: Índice sin tab seleccionada
- **WHEN** un administrador entra a Configuraciones sin elegir una tab
- **THEN** el sistema muestra un índice/bienvenida de la sección de configuración

### Requirement: Tabs editor y tabs explicativas

Una tab de sección SHALL ser de tipo **editor** (administra el contenido de la
sección) o de tipo **explicativa/redirección** (la sección se alimenta de un módulo
existente del sistema; la tab explica dónde/cómo se gestiona y enlaza a ese módulo).
La base SHALL proveer un componente reutilizable para las tabs explicativas.

#### Scenario: Tab explicativa redirige al módulo
- **WHEN** un administrador abre una tab explicativa (p.ej. Calendario o Cultos)
- **THEN** el sistema muestra la explicación de dónde se gestiona ese contenido y un
  enlace/botón para ir al módulo correspondiente

### Requirement: Almacén genérico de configuraciones (SiteSetting)

El sistema SHALL ofrecer un almacén clave/valor (`SiteSetting`) para configuraciones
simples del sitio (textos, banderas, rutas de imágenes), con helpers para leer y
escribir un valor por clave.

#### Scenario: Guardar un valor de configuración
- **WHEN** un proceso del admin guarda un valor para una clave de configuración
- **THEN** el sistema persiste el valor y lo expone al leer esa clave

#### Scenario: Leer una clave inexistente
- **WHEN** se lee una clave que nunca fue escrita
- **THEN** el sistema devuelve un valor nulo (sin error)

### Requirement: Subida de imágenes del sitio

El sistema SHALL permitir subir imágenes para la configuración del sitio,
almacenándolas bajo `uploads/site/` y exponiéndolas como URL pública
`/uploads/site/<archivo>`. SHALL aceptar solo archivos `image/*` dentro del límite
de tamaño configurado.

#### Scenario: Subir una imagen válida
- **WHEN** un administrador sube una imagen de configuración válida
- **THEN** el sistema la guarda y devuelve su URL pública

#### Scenario: Rechazar archivo no imagen
- **WHEN** un administrador sube un archivo que no es imagen
- **THEN** el sistema rechaza la solicitud
