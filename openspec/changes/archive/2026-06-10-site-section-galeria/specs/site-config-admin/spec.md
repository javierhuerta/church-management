## MODIFIED Requirements

### Requirement: Navegacion por tabs por seccion del sitio

La seccion Configuraciones SHALL presentar una navegacion por **tabs**, donde cada tab corresponde a una seccion del sitio publico. La base SHALL permitir que nuevas secciones registren su tab sin modificar las existentes. La tab "Galeria" SHALL estar disponible como tab de tipo editor para personalizar el contenido de la seccion Galeria del sitio publico.

#### Scenario: Acceder a la tab Galeria
- **WHEN** un administrador selecciona la tab "Galeria" en Configuraciones
- **THEN** el sistema navega a `/admin/configuraciones/galeria` y muestra las opciones de personalizacion de la seccion Galeria
