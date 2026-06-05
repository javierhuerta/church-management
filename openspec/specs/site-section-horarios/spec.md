# site-section-horarios

## Purpose

Permite a los administradores gestionar la sección Horarios del sitio público: la lista
de servicios semanales de la iglesia (Escuela Sabática, Culto Divino, Culto Joven, cultos
de oración, etc.) con día, hora, nombre, descripción, orden y estado activo/inactivo, más
los textos introductorios de la página. Los horarios se almacenan en una entidad dedicada
`ScheduleItem` (`schedule_items`) con CRUD, reordenamiento y activación por ítem. El
endpoint público `GET /api/public/schedule` expone únicamente los horarios activos,
agrupados por día y ordenados, junto con los textos introductorios, para que `PageHorarios`
del sitio se renderice con contenido vivo en vez de hardcodeado.

## Requirements

### Requirement: Gestionar la lista de horarios del sitio público

El sistema SHALL permitir al administrador gestionar la lista de servicios semanales
que se muestran en la sección Horarios del sitio público. Cada servicio se define con
un día, una hora, un nombre y una descripción opcional, y puede activarse o desactivarse
individualmente.

#### Scenario: Listar horarios en el admin
- **WHEN** un administrador accede a la pestaña "Horarios" en Configuraciones
- **THEN** el sistema muestra todos los horarios registrados, ordenados, con su día,
  hora, nombre, descripción, estado activo/inactivo y botones de acción

#### Scenario: Crear un nuevo horario
- **WHEN** un administrador crea un nuevo servicio con día "Jueves", hora "20:00",
  nombre "Estudio Bíblico" y descripción opcional
- **THEN** el sistema guarda el nuevo horario con `isActive = true` y lo agrega al
  final de la lista de ese día

#### Scenario: Editar un horario existente
- **WHEN** un administrador modifica el nombre de un servicio de "Culto Joven" a
  "Culto Juvenil"
- **THEN** el sistema actualiza el registro y conserva el resto de los campos

#### Scenario: Eliminar un horario
- **WHEN** un administrador elimina un servicio de la lista
- **THEN** el sistema elimina el registro permanentemente y reajusta el orden de los
  ítems restantes

#### Scenario: Reordenar horarios
- **WHEN** un administrador mueve un servicio hacia arriba en la lista
- **THEN** el sistema actualiza los valores de `sortOrder` de los ítems afectados y
  persiste el nuevo orden

### Requirement: Activar y desactivar horarios individualmente

El sistema SHALL permitir marcar cada horario como activo o inactivo. Solo los
horarios activos se muestran en el sitio público.

#### Scenario: Desactivar un horario
- **WHEN** un administrador desactiva el servicio "Culto de Oración" del miércoles
- **THEN** el sistema actualiza `isActive = false` y el servicio deja de aparecer en
  el endpoint público

#### Scenario: Reactivar un horario
- **WHEN** un administrador reactiva un servicio previamente desactivado
- **THEN** el sistema actualiza `isActive = true` y el servicio vuelve a aparecer en
  el sitio público

### Requirement: Exponer horarios activos en endpoint público

El sistema SHALL exponer un endpoint `GET /api/public/schedule` sin autenticación que
devuelva únicamente los horarios activos, agrupados por día y ordenados.

#### Scenario: Visitante consulta los horarios
- **WHEN** un visitante anónimo solicita `GET /api/public/schedule`
- **THEN** el sistema devuelve los días con sus servicios activos, los textos
  introductorios de la página, y ningún dato de administración

#### Scenario: Horario desactivado no aparece en endpoint público
- **WHEN** existe un horario con `isActive = false` y un visitante solicita
  `GET /api/public/schedule`
- **THEN** el sistema NO incluye ese horario en la respuesta

### Requirement: Textos introductorios de la página de horarios

El sistema SHALL permitir al administrador editar los textos del encabezado de la
sección Horarios del sitio público: kicker, título principal y párrafo descriptivo.
Estos textos se almacenan en `SiteSetting` con las claves `horarios.page_kicker`,
`horarios.page_title` y `horarios.page_paragraph`.

#### Scenario: Editar el título de la sección Horarios
- **WHEN** un administrador cambia el título de "Cada semana, un lugar para ti." a
  "Te esperamos cada sábado" y guarda
- **THEN** el sistema actualiza `SiteSetting` con clave `horarios.page_title` y el
  sitio público muestra el nuevo título

#### Scenario: Endpoint público incluye los textos editados
- **WHEN** un visitante solicita `GET /api/public/schedule` después de que el admin
  cambió los textos
- **THEN** la respuesta incluye los textos actualizados en los campos `kicker`,
  `title` y `paragraph`

### Requirement: Restricción de acceso por rol

El sistema SHALL restringir la administración de horarios exclusivamente al rol
`Admin`. La lectura del endpoint público es anónima y sin restricciones.

#### Scenario: Admin gestiona horarios
- **WHEN** un usuario con rol `Admin` accede a los endpoints de administración de
  horarios (`/api/site-config/schedule`)
- **THEN** el sistema permite todas las operaciones CRUD y de reordenamiento

#### Scenario: Usuario sin rol Admin no puede modificar horarios
- **WHEN** un usuario con rol `Pastor` o `Secretaria` intenta crear, editar o
  eliminar un horario
- **THEN** el sistema rechaza la solicitud con código 403 Forbidden

#### Scenario: Visitante anónimo solo lee
- **WHEN** un visitante sin autenticación intenta acceder a `/api/site-config/schedule`
- **THEN** el sistema rechaza la solicitud con código 401 Unauthorized
