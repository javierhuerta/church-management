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

### Requirement: Seeder con datos reales del sitio

El sistema SHALL incluir un seeder (`GallerySeeder`) que replique exactamente los 4 álbumes y 17 imágenes actualmente hardcodeados en `PageGaleria` del sitio público, con estado publicado tanto para álbumes como para imágenes.

#### Scenario: Ejecutar seeder en base vacía
- **WHEN** se ejecuta el seeder en una base de datos sin álbumes de galería
- **THEN** el sistema crea 4 álbumes ("Cultos y predicaciones", "Bautismos y compromisos", "Ministerios", "Eventos especiales") con sus kickers, descripciones, orden y `isPublished = true`, y 17 imágenes con sus captions, orden y `isPublished = true`

#### Scenario: Ejecutar seeder en base con datos existentes
- **WHEN** se ejecuta el seeder y ya existe un álbum con título "Cultos y predicaciones"
- **THEN** el seeder no crea ningún álbum ni imagen adicional (idempotente)

### Requirement: Configuración de la sección Galería

El sistema SHALL permitir configurar el texto introductorio y el título del encabezado de la sección Galería del sitio público, a través de la tab "Galería" en la sección de Configuraciones del admin, usando el almacén `SiteSetting`.

#### Scenario: Guardar configuración de galería
- **WHEN** un administrador guarda el título del encabezado y el texto introductorio en la tab Galería de Configuraciones
- **THEN** el sistema persiste los valores en `SiteSetting` con claves `galeria.header_title` y `galeria.intro_text`

#### Scenario: Recuperar configuración de galería
- **WHEN** el sitio público carga la sección Galería
- **THEN** puede obtener los textos de configuración vía la API pública o desde la respuesta de galería
