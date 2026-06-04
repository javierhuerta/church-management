## ADDED Requirements

### Requirement: Calendario del sitio alimentado por el módulo Calendario

El sitio público SHALL mostrar en su sección Calendario los eventos provenientes del
módulo Calendario, incluyendo únicamente los eventos con estado **Publicado**. No
SHALL existir una administración de eventos separada para el sitio: la fuente de
verdad es el módulo Calendario.

#### Scenario: Solo eventos publicados en el sitio
- **WHEN** un visitante anónimo abre la sección Calendario del sitio
- **THEN** el sistema muestra los eventos publicados del módulo Calendario

#### Scenario: Evento no publicado no aparece
- **WHEN** un evento está en borrador en el módulo Calendario
- **THEN** ese evento no aparece en el sitio público

### Requirement: Tab explicativa de Calendario en Configuraciones

La sección Configuraciones SHALL incluir una tab "Calendario" de tipo explicativa que
indique que los eventos se gestionan en el módulo Calendario y que solo los eventos
publicados se muestran en el sitio, y SHALL ofrecer un enlace para ir a dicho módulo.

#### Scenario: Explicación y redirección
- **WHEN** un administrador abre la tab "Calendario" en Configuraciones
- **THEN** el sistema explica dónde se gestionan los eventos y ofrece un enlace a
  `/admin/calendario`

### Requirement: Degradación ante error de API

Si la API de calendario no responde, el sitio SHALL mostrar contenido por defecto sin
romper la página.

#### Scenario: API caída
- **WHEN** el sitio no logra cargar los eventos desde la API
- **THEN** la sección Calendario muestra contenido por defecto sin error visible
