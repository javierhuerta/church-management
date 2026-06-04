## ADDED Requirements

### Requirement: Gestionar líderes principales de la junta directiva

El sistema SHALL permitir a usuarios con rol `Admin` administrar los líderes
principales (junta directiva) que se muestran en la sección Liderazgo del sitio
público. Cada líder tiene un rol, nombre, foto retrato opcional, orden de
visualización y estado activo.

#### Scenario: Crear un líder principal
- **WHEN** un administrador crea un líder con rol y nombre
- **THEN** el sistema registra el líder y lo expone en el endpoint público si está activo

#### Scenario: Editar los datos de un líder
- **WHEN** un administrador modifica el nombre o rol de un líder existente
- **THEN** el sistema actualiza los datos y el cambio se refleja en el sitio público

#### Scenario: Desactivar un líder
- **WHEN** un administrador marca un líder como inactivo
- **THEN** el líder deja de aparecer en el endpoint público pero se conserva en el admin

#### Scenario: Eliminar un líder
- **WHEN** un administrador elimina un líder
- **THEN** el registro y su foto asociada (si existe) se eliminan

#### Scenario: Subir foto retrato de un líder
- **WHEN** un administrador sube una foto para un líder existente
- **THEN** el sistema guarda la imagen en `uploads/site/` y devuelve su URL pública

#### Scenario: Solo Admin puede gestionar líderes
- **WHEN** un usuario sin rol Admin intenta crear, editar o eliminar un líder
- **THEN** el sistema rechaza la solicitud

### Requirement: Gestionar la foto grupal de la junta

El sistema SHALL permitir a usuarios `Admin` subir y reemplazar la foto grupal
de la junta directiva que se muestra en el sitio público, almacenándola como un
`SiteSetting` con clave `leadership.board_photo`.

#### Scenario: Subir foto grupal por primera vez
- **WHEN** un administrador sube una foto grupal y no existía una previa
- **THEN** el sistema guarda la imagen y expone su URL en el endpoint público

#### Scenario: Reemplazar foto grupal existente
- **WHEN** un administrador sube una nueva foto grupal
- **THEN** el sistema elimina la foto anterior del disco y guarda la nueva,
  actualizando la URL expuesta

#### Scenario: Rechazar archivo que no es imagen
- **WHEN** un administrador intenta subir un archivo que no es `image/*` como foto grupal
- **THEN** el sistema rechaza la solicitud

### Requirement: Exponer ministerios derivados de departamentos

El sistema SHALL incluir en el endpoint público de liderazgo los ministerios de
la iglesia, derivados de los departamentos registrados en el sistema y sus
directores asignados mediante `user_departments`. Los departamentos sin director
asignado SHALL aparecer con el campo de responsable en nulo.

#### Scenario: Ministerio con director asignado
- **WHEN** un departamento tiene uno o más usuarios asignados como directores
- **THEN** el endpoint público incluye el ministerio con los nombres de los
  directores en el campo `leaders`

#### Scenario: Ministerio sin director
- **WHEN** un departamento no tiene ningún usuario asignado como director
- **THEN** el endpoint público incluye el ministerio con `leaders: null`

#### Scenario: Ministerio con múltiples directores
- **WHEN** un departamento tiene dos o más directores asignados
- **THEN** el endpoint público une sus nombres con « y » en el campo `leaders`

### Requirement: Endpoint público de liderazgo para el sitio

El sistema SHALL exponer un endpoint `GET /api/public/leadership` sin
autenticación que devuelva la carga completa de la sección Liderazgo:
foto grupal, junta directiva (solo líderes activos) y ministerios con sus
responsables.

#### Scenario: Sitio público consume los datos
- **WHEN** el sitio público solicita `GET /api/public/leadership` sin token
- **THEN** el sistema responde con `boardPhotoUrl`, `board[]` (activos, ordenados)
  y `ministries[]`

#### Scenario: No hay líderes activos
- **WHEN** no hay ningún líder principal activo en el sistema
- **THEN** el endpoint devuelve `board: []` (arreglo vacío, sin error)

### Requirement: Cablear PageNosotros con datos vivos

La página `PageNosotros` del sitio público SHALL consumir los datos del endpoint
`/api/public/leadership` a través de `window.IASD_API.fetchLeadership()` en vez
de usar arrays hardcodeados. SHALL conservar los datos hardcodeados como fallback
si la API no responde.

#### Scenario: Carga exitosa de datos vivos
- **WHEN** un visitante carga la página Liderazgo y la API responde correctamente
- **THEN** la página muestra los líderes, la foto grupal y los ministerios desde
  la API

#### Scenario: Fallback ante error de API
- **WHEN** un visitante carga la página Liderazgo y la API falla
- **THEN** la página muestra el contenido hardcodeado por defecto sin romperse
