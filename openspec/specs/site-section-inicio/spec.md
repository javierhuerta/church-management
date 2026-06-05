# site-section-inicio

## Purpose

Permite a los administradores gestionar todo el contenido de la sección Inicio del
sitio público: textos del hero, versículo destacado, horarios, CTA, imágenes del hero,
y el bloque de "próximo culto" (derivado automáticamente del calendario). El endpoint
público `GET /api/public/home` consolida estos datos para que `PageInicio` se renderice
con contenido vivo en vez de hardcodeado.

## Requirements

### Requirement: Endpoint público de la sección Inicio

El sistema SHALL exponer un endpoint `GET /api/public/home`, sin autenticación, que
devuelve todos los datos que la sección Inicio del sitio público necesita para
renderizarse: textos del hero, versículo, horarios destacados, datos sociales, CTA
final, y el próximo culto derivado del calendario. SHALL devolver valores por defecto
cuando una clave de configuración no ha sido establecida.

#### Scenario: Carga de la página de inicio con contenido administrado
- **WHEN** el sitio público solicita `GET /api/public/home`
- **THEN** el sistema devuelve los textos configurados por el administrador para
  cada bloque de la sección Inicio, aplicando los defaults donde no haya
  configuración explícita

#### Scenario: Próximo culto detectado del calendario
- **WHEN** existe al menos un evento de calendario con `status = 'published'` y
  `startDate` en el futuro
- **THEN** la respuesta incluye el campo `nextService` con el título, la fecha/hora
  y el lugar del evento más próximo

#### Scenario: Sin próximos cultos en el calendario
- **WHEN** no hay eventos publicados con `startDate` futura
- **THEN** la respuesta incluye `nextService: null` y la página muestra contenido
  por defecto sin romperse

### Requirement: Administración de textos del hero

El sistema SHALL permitir al administrador editar los textos del hero de la sección
Inicio: las dos líneas del kicker superior, las dos líneas del título principal, el
párrafo del subtítulo, y los textos de los dos botones CTA. Los cambios SHALL
reflejarse inmediatamente en el endpoint público.

#### Scenario: Admin edita el subtítulo del hero
- **WHEN** un administrador guarda un nuevo subtítulo para el hero de Inicio
- **THEN** el endpoint `GET /api/public/home` devuelve el nuevo subtítulo en
  `hero.subtitle`

#### Scenario: Admin edita el texto del botón CTA primario
- **WHEN** un administrador cambia el texto del botón CTA primario del hero
- **THEN** el endpoint público refleja el nuevo texto en `hero.ctaPrimary`

### Requirement: Administración del versículo destacado

El sistema SHALL permitir al administrador editar el texto del versículo bíblico
destacado y su referencia (ej. "MATEO 11:28").

#### Scenario: Admin cambia el versículo destacado
- **WHEN** un administrador actualiza el texto y la referencia del versículo
- **THEN** el endpoint público devuelve los nuevos valores en `verse.text` y
  `verse.reference`

### Requirement: Administración de los horarios destacados del hero

El sistema SHALL permitir al administrador editar los tres horarios que aparecen
tanto en la mini-info bar del hero como en la sección de horarios resumidos. Cada
horario tiene una etiqueta de día, una hora y una descripción.

#### Scenario: Admin actualiza un horario destacado
- **WHEN** un administrador cambia la hora y descripción del segundo bloque de
  horario
- **THEN** el endpoint público devuelve los nuevos valores en `hero.schedule[1]`

### Requirement: Próximo culto desde el calendario

El sistema SHALL derivar automáticamente el bloque "próximo culto" de la sección
Inicio desde el calendario de eventos reales. SHALL seleccionar el evento más
próximo con estado publicado y fecha futura, y SHALL mapearlo al formato que espera
la página (título, fecha/hora formateada, lugar). No SHALL requerir intervención
manual del administrador para mantener este bloque actualizado.

#### Scenario: El próximo culto se actualiza automáticamente
- **WHEN** se publica un nuevo evento de culto en el calendario
- **THEN** el endpoint `GET /api/public/home` devuelve ese evento como `nextService`
  sin que el administrador deba editar la configuración de Inicio

### Requirement: Administración de las 3 imágenes del hero

El sistema SHALL permitir al administrador subir y reemplazar las tres imágenes del
hero de la sección Inicio: la foto principal (`home-hero-main`), el detalle de
congregación (`home-hero-small`) y la imagen del bloque "próximo culto"
(`home-next-service`). Las imágenes se almacenan bajo `uploads/site` y sus URLs se
exponen en `GET /api/public/home`. Si una imagen no está configurada, la respuesta
devuelve `null` y el sitio usa el placeholder del diseño.

#### Scenario: Admin sube la foto principal del hero
- **WHEN** un administrador sube una imagen para la foto principal del hero
- **THEN** el sistema la almacena y `GET /api/public/home` devuelve su URL en
  `images.heroMain`

#### Scenario: Imagen no configurada
- **WHEN** una de las tres imágenes del hero no ha sido subida
- **THEN** el endpoint público devuelve `null` para esa imagen y el sitio muestra el
  placeholder del diseño

### Requirement: Administración de textos de la sección social y CTA final

El sistema SHALL permitir al administrador editar el kicker y título de la sección
"Síguenos en redes", y el texto y la dirección del CTA final de la página.

#### Scenario: Admin actualiza el mensaje del CTA final
- **WHEN** un administrador cambia el texto del CTA final
- **THEN** el endpoint público devuelve el nuevo texto en `footerCta.text`

### Requirement: Acceso restringido a la administración de Inicio

Solo los usuarios con rol `Admin` SHALL poder leer y modificar la configuración de
la sección Inicio. Los demás roles y el público anónimo SHALL solo poder leer el
contenido publicado a través del endpoint público.

#### Scenario: Usuario sin rol Admin intenta editar
- **WHEN** un usuario sin rol Admin intenta acceder a `PUT /api/site-config/home`
- **THEN** el sistema rechaza la solicitud con un error de autorización

#### Scenario: Público anónimo lee la configuración
- **WHEN** un visitante sin autenticación solicita `GET /api/public/home`
- **THEN** el sistema responde exitosamente con el contenido publicado

### Requirement: Pestaña "Inicio" en Configuraciones

El sistema SHALL agregar una pestaña "Inicio" en la sección de Configuraciones del
admin (`/admin/configuraciones/inicio`), accesible solo para Admin, que contiene un
formulario con todos los campos editables de la sección Inicio organizados por
bloques, y un indicador informativo del próximo culto detectado por el calendario.

#### Scenario: Admin accede a la pestaña Inicio
- **WHEN** un administrador navega a Configuraciones y selecciona la pestaña "Inicio"
- **THEN** el sistema muestra el formulario de configuración con los valores actuales
  precargados y el indicador del próximo culto

#### Scenario: Admin guarda cambios en la configuración de Inicio
- **WHEN** un administrador modifica campos y presiona "Guardar cambios"
- **THEN** el sistema persiste los valores y muestra confirmación
