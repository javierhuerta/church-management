# Worship Program PDF

## Purpose

Provides PDF export functionality for worship service programs. The PDF is generated entirely in the frontend without requiring a backend endpoint, and is available for programs in any status (DRAFT, PUBLISHED, ARCHIVED).

## Requirements

### Requirement: Descarga de PDF del programa de culto

El sistema SHALL permitir descargar un PDF del programa de cualquier culto configurado, disponible para cualquier estado (DRAFT, PUBLISHED, ARCHIVED). La descarga se inicia desde la página de detalle del programa y ocurre completamente en el frontend sin necesidad de un endpoint adicional en el backend.

#### Scenario: Descarga exitosa del PDF

- **WHEN** el usuario hace clic en el botón "Descargar PDF" en la página de detalle de un programa
- **THEN** el sistema genera un archivo PDF y lo descarga en el navegador con el nombre `programa-<fecha>.pdf`

#### Scenario: PDF disponible en estado borrador

- **WHEN** el programa tiene estado DRAFT
- **THEN** el botón "Descargar PDF" está visible y funcional

#### Scenario: PDF disponible en estado publicado

- **WHEN** el programa tiene estado PUBLISHED
- **THEN** el botón "Descargar PDF" está visible y funcional

#### Scenario: PDF disponible en estado archivado

- **WHEN** el programa tiene estado ARCHIVED
- **THEN** el botón "Descargar PDF" está visible y funcional

### Requirement: Contenido del PDF

El PDF generado SHALL incluir: encabezado con logo y datos del culto, y una tabla de tres columnas (RESPONSABLE, PARTE, DETALLE) con todas las secciones del programa ordenadas correctamente.

#### Scenario: Encabezado del PDF

- **WHEN** se genera el PDF
- **THEN** el encabezado contiene el logo de la iglesia (placeholder SVG), el nombre del culto y la fecha formateada en español

#### Scenario: Grupos como separadores visuales

- **WHEN** el programa tiene grupos definidos con secciones dentro
- **THEN** cada grupo aparece como una fila separadora con fondo morado y texto blanco, mostrando el nombre del grupo y el rango horario si está definido

#### Scenario: Secciones en la tabla

- **WHEN** el programa tiene secciones (dentro o fuera de grupos)
- **THEN** cada sección aparece como una fila con: columna RESPONSABLE (campo `responsible`), columna PARTE (campo `name` o nombre de la plantilla), columna DETALLE (campo `hymnText`)

#### Scenario: Notas incluidas en el detalle

- **WHEN** una sección tiene un campo `notes` no vacío
- **THEN** las notas aparecen debajo del `hymnText` en la columna DETALLE, en un tono gris más suave para distinguirlas visualmente

#### Scenario: Campos vacíos no muestran contenido espurio

- **WHEN** una sección no tiene responsable, himno o notas
- **THEN** las celdas correspondientes aparecen vacías sin texto de relleno ni símbolos

### Requirement: Calidad y formato del PDF

El PDF SHALL generarse en formato vectorial (no imagen rasterizada), en orientación vertical, tamaño carta (Letter), con tipografía legible para impresión.

#### Scenario: Descarga en formato vectorial

- **WHEN** el usuario descarga el PDF
- **THEN** el archivo es un PDF vectorial que escala sin pérdida de calidad al imprimirse en cualquier tamaño
