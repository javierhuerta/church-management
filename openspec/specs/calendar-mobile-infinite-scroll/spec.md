# calendar-mobile-infinite-scroll — Infinite Scroll en Vista Móvil del Calendario

## Purpose

Permitir que los usuarios en dispositivos móviles carguen eventos de meses consecutivos de forma continua haciendo scroll, sin necesidad de volver al tope de la pantalla para navegar entre meses.

## Requirements

### Requirement: Carga incremental de meses al hacer scroll

La vista lista del calendario en móvil SHALL cargar automáticamente los eventos del mes siguiente cuando el usuario llega al final del scroll.

#### Scenario: Scroll hasta el final carga el mes siguiente
- **WHEN** el usuario hace scroll hasta el final de la lista de eventos en móvil
- **THEN** el sistema carga los eventos del mes siguiente y los agrega al final de la lista sin reemplazar los ya visibles

#### Scenario: Indicador de carga mientras se obtienen eventos
- **WHEN** se está cargando el siguiente mes
- **THEN** se muestra un indicador visual de carga al final de la lista

#### Scenario: Meses acumulados se muestran con encabezado
- **WHEN** se han cargado eventos de múltiples meses
- **THEN** cada mes muestra un encabezado separador que identifica el mes y año

#### Scenario: Filtros aplican sobre todos los meses cargados
- **WHEN** el usuario cambia un filtro (tipo de evento o departamento) con múltiples meses cargados
- **THEN** la lista se reinicia al mes actual y muestra solo eventos que cumplan el filtro

### Requirement: Botón flotante para volver al inicio

La vista lista del calendario en móvil SHALL mostrar un botón de acceso rápido al tope de la página cuando el usuario ha scrolleado hacia abajo.

#### Scenario: Botón aparece al scrollear
- **WHEN** el usuario ha scrolleado más de 300px hacia abajo en la vista móvil
- **THEN** aparece un botón flotante visible en la esquina inferior derecha de la pantalla

#### Scenario: Botón lleva al inicio de la página
- **WHEN** el usuario presiona el botón flotante
- **THEN** la página se desplaza suavemente hasta el tope (donde están los filtros y el encabezado)

#### Scenario: Botón oculto en vista desktop
- **WHEN** el viewport es desktop (≥ 768px)
- **THEN** el botón flotante no es visible

### Requirement: Vista desktop no se ve afectada

El cambio SHALL no modificar el comportamiento de la vista grid (desktop). Desktop sigue navegando mes a mes con los controles de la barra de filtros.

#### Scenario: Desktop mantiene comportamiento actual
- **WHEN** el usuario accede al calendario desde un viewport desktop (≥ 768px)
- **THEN** se muestra la vista grid con navegación mes a mes, sin infinite scroll
