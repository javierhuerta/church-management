## ADDED Requirements

### Requirement: Gestionar álbumes de galería

El sistema SHALL permitir a usuarios administradores crear, editar, eliminar y listar álbumes de la galería del sitio público. Cada álbum tiene un título, un kicker opcional (etiqueta corta), una descripción opcional, un orden de presentación, un estado de publicación y opcionalmente una imagen de portada.

#### Scenario: Crear un álbum
- **WHEN** un administrador crea un álbum con título y orden
- **THEN** el sistema registra el álbum con estado "no publicado"

#### Scenario: Editar un álbum
- **WHEN** un administrador cambia el título o la descripción de un álbum existente
- **THEN** el sistema guarda los cambios

#### Scenario: Eliminar un álbum con sus imágenes
- **WHEN** un administrador elimina un álbum
- **THEN** el sistema elimina el álbum y todas sus imágenes (registros y archivos en disco)

#### Scenario: Listar álbumes
- **WHEN** un administrador solicita el listado de álbumes
- **THEN** el sistema devuelve todos los álbumes (publicados y no publicados) con el conteo de imágenes de cada uno, ordenados por `sortOrder`

### Requirement: Gestionar imágenes de un álbum

El sistema SHALL permitir a usuarios administradores subir, editar, eliminar y reordenar imágenes dentro de un álbum. Cada imagen tiene una ruta de archivo, un caption opcional, un orden y un estado de publicación.

#### Scenario: Subir una imagen a un álbum
- **WHEN** un administrador sube un archivo de imagen válido (JPEG, PNG, WebP, GIF) a un álbum
- **THEN** el sistema guarda el archivo en `uploads/gallery/`, crea el registro con estado "no publicado" y asigna el siguiente `sortOrder` disponible

#### Scenario: Rechazar archivo no imagen
- **WHEN** un administrador sube un archivo que no es imagen
- **THEN** el sistema rechaza la solicitud con error 400

#### Scenario: Rechazar archivo demasiado grande
- **WHEN** un administrador sube una imagen que excede 10 MB
- **THEN** el sistema rechaza la solicitud con error 400

#### Scenario: Eliminar una imagen
- **WHEN** un administrador elimina una imagen de un álbum
- **THEN** el sistema borra el archivo del disco y el registro de la base de datos

#### Scenario: Reordenar imágenes
- **WHEN** un administrador reordena las imágenes de un álbum (nuevo orden de `sortOrder`)
- **THEN** el sistema actualiza los valores de `sortOrder` de todas las imágenes del álbum según el nuevo orden

#### Scenario: Editar caption de una imagen
- **WHEN** un administrador cambia el caption de una imagen
- **THEN** el sistema guarda el nuevo caption

### Requirement: Publicar y despublicar contenido de galería

El sistema SHALL permitir marcar un álbum como publicado o no publicado, y marcar cada imagen individual como publicada o no publicada. Solo el contenido marcado como publicado es visible en el endpoint público.

#### Scenario: Publicar un álbum
- **WHEN** un administrador marca un álbum como publicado
- **THEN** el sistema actualiza su estado y el álbum aparece en el endpoint público

#### Scenario: Despublicar un álbum
- **WHEN** un administrador marca un álbum como no publicado
- **THEN** el álbum y todas sus imágenes dejan de aparecer en el endpoint público, sin eliminarse

#### Scenario: Publicar una imagen individual
- **WHEN** un administrador marca una imagen como publicada dentro de un álbum publicado
- **THEN** esa imagen aparece en el endpoint público

#### Scenario: Imagen no publicada en álbum publicado
- **WHEN** un álbum está publicado pero una de sus imágenes está marcada como no publicada
- **THEN** el endpoint público incluye el álbum pero excluye esa imagen

### Requirement: Endpoint público de galería

El sistema SHALL exponer un endpoint `GET /api/public/gallery` sin autenticación que devuelve los álbumes publicados con sus imágenes publicadas, ordenados por `sortOrder`, en un formato adecuado para el sitio público.

#### Scenario: Lectura anónima de galería
- **WHEN** el sitio público solicita `GET /api/public/gallery`
- **THEN** el sistema responde con un arreglo de álbumes publicados, cada uno con su arreglo de imágenes publicadas, sin requerir autenticación

#### Scenario: No exponer borradores
- **WHEN** existen álbumes o imágenes no publicados
- **THEN** el endpoint `GET /api/public/gallery` no los incluye en la respuesta

#### Scenario: Respuesta vacía cuando no hay contenido publicado
- **WHEN** no hay álbumes publicados
- **THEN** el endpoint responde con un arreglo vacío (200 OK)

### Requirement: Configuración de la sección Galería

El sistema SHALL permitir configurar el texto introductorio y el título del encabezado de la sección Galería del sitio público, a través de la tab "Galería" en la sección de Configuraciones del admin, usando el almacén `SiteSetting`.

#### Scenario: Guardar configuración de galería
- **WHEN** un administrador guarda el título del encabezado y el texto introductorio en la tab Galería de Configuraciones
- **THEN** el sistema persiste los valores en `SiteSetting` con claves `galeria.header_title` y `galeria.intro_text`

#### Scenario: Recuperar configuración de galería
- **WHEN** el sitio público carga la sección Galería
- **THEN** puede obtener los textos de configuración vía la API pública o desde la respuesta de galería

## MODIFIED Requirements

### Requirement: Navegación por tabs de Configuraciones

El sistema SHALL incluir la tab "Galería" en la navegación por tabs de la sección Configuraciones del admin, junto a las tabs de otras secciones del sitio.

#### Scenario: Acceder a la tab Galería
- **WHEN** un administrador selecciona la tab "Galería" en Configuraciones
- **THEN** el sistema navega a `/admin/configuraciones/galeria` y muestra las opciones de personalización de la sección Galería

### Requirement: API pública del sitio

El endpoint `GET /api/public/gallery` SHALL estar disponible en el espacio `/api/public/*` sin autenticación, como parte de los endpoints públicos del sitio.

#### Scenario: Galería en el espacio público
- **WHEN** el sitio consulta `/api/public/gallery`
- **THEN** el sistema responde con los álbumes e imágenes publicados, sin token de autenticación

### Requirement: Puente de integración del sitio

El helper `fetchGallery` SHALL estar disponible en `window.IASD_API` para consumir el endpoint público de galería y mapear la respuesta al formato que `PageGaleria` espera.

#### Scenario: Consumo de galería desde el sitio
- **WHEN** `PageGaleria` carga
- **THEN** obtiene los álbumes publicados vía `window.IASD_API.fetchGallery()` y los renderiza en la grilla de imágenes

#### Scenario: Degradación ante error de API en galería
- **WHEN** la API de galería no responde
- **THEN** `PageGaleria` muestra un mensaje de contenido no disponible sin romper la página
