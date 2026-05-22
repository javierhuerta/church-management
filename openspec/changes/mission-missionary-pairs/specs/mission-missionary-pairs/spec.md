## ADDED Requirements

### Requirement: Registrar una pareja misionera

El sistema SHALL permitir a usuarios con control total del módulo misionero registrar parejas misioneras. Una pareja misionera es una dupla de miembros que da estudios bíblicos y acompaña a interesados.

Cada pareja tiene un primer integrante obligatorio (una Persona) y, opcionalmente, un segundo integrante (otra Persona), una etiqueta, una audiencia (Niños, Adolescentes, General) y notas.

#### Scenario: Crear pareja con dos integrantes
- **WHEN** un coordinador misionero crea una pareja seleccionando dos Personas integrantes
- **THEN** el sistema registra la pareja con ambos integrantes

#### Scenario: Crear pareja con un integrante pendiente
- **WHEN** un coordinador misionero crea una pareja indicando solo el primer integrante
- **THEN** el sistema registra la pareja con el segundo integrante vacío, en estado "en busca de pareja"

#### Scenario: Integrantes deben ser personas distintas
- **WHEN** un usuario intenta crear una pareja con la misma Persona en ambos integrantes
- **THEN** el sistema rechaza la solicitud con un error de validación

### Requirement: Estado activo de una pareja misionera

El sistema SHALL permitir marcar una pareja misionera como activa o inactiva. Por defecto una pareja nueva es activa.

#### Scenario: Desactivar una pareja
- **WHEN** un coordinador misionero marca una pareja como inactiva
- **THEN** el sistema actualiza el estado y la pareja deja de contarse entre las parejas activas

### Requirement: Editar una pareja misionera

El sistema SHALL permitir a usuarios con control total editar los integrantes, la etiqueta, la audiencia, el estado y las notas de una pareja misionera.

#### Scenario: Cambiar un integrante de la pareja
- **WHEN** un coordinador misionero reemplaza un integrante de una pareja por otra Persona
- **THEN** el sistema guarda el nuevo integrante

#### Scenario: Completar una pareja en busca de integrante
- **WHEN** un coordinador misionero asigna un segundo integrante a una pareja que estaba incompleta
- **THEN** el sistema registra el segundo integrante y la pareja deja de estar "en busca de pareja"

### Requirement: Eliminar una pareja misionera

El sistema SHALL permitir a usuarios con control total eliminar una pareja misionera, siempre que no sea instructora de ningún estudio bíblico.

#### Scenario: Eliminar pareja sin estudios asociados
- **WHEN** un coordinador misionero elimina una pareja que no es instructora de ningún estudio
- **THEN** el sistema elimina la pareja

#### Scenario: Eliminar pareja instructora de estudios
- **WHEN** un usuario intenta eliminar una pareja que es instructora de uno o más estudios bíblicos
- **THEN** el sistema rechaza la eliminación e informa que la pareja está asignada a estudios

### Requirement: Listar parejas misioneras

El sistema SHALL permitir listar las parejas misioneras con sus integrantes y SHALL mostrar el total de parejas activas.

El listado SHALL ser accesible a cualquier usuario autenticado; las acciones de creación, edición y eliminación SHALL estar restringidas a usuarios con control total.

#### Scenario: Listar parejas con integrantes
- **WHEN** un usuario autenticado solicita el listado de parejas misioneras
- **THEN** el sistema devuelve las parejas con los datos de sus integrantes y el total de parejas activas

#### Scenario: Identificar parejas incompletas
- **WHEN** una pareja no tiene segundo integrante
- **THEN** el sistema la presenta como "en busca de pareja" en el listado
