# worship-service-audit — Delta Spec

## ADDED Requirements

### Requirement: Filtrar historial por tipo de acción

El sistema SHALL permitir filtrar las entradas del historial por categoría de acción desde la UI.

Las categorías son:
- **Todo**: sin filtro
- **Creación**: entradas cuyo campo `action` contiene "creó"
- **Ediciones**: entradas cuyo campo `action` contiene "cambió" o "editó" o "definió"
- **Publicaciones**: entradas cuyo campo `action` contiene "publicó" o "archivó"
- **Eliminaciones**: entradas cuyo campo `action` contiene "eliminó"

El filtrado se aplica en el cliente (sobre los datos ya cargados) sin nueva llamada a la API.

#### Scenario: Filtrar por ediciones

- **WHEN** usuario selecciona el filtro "Ediciones" en el historial
- **THEN** solo se muestran entradas con action que contiene "cambió", "editó" o "definió"
- **AND** las entradas siguen agrupadas por fecha

#### Scenario: Restablecer filtro

- **WHEN** usuario selecciona "Todo"
- **THEN** se muestran todas las entradas sin filtrar, agrupadas por fecha

### Requirement: Agrupación del historial por fecha

El sistema SHALL mostrar las entradas del historial agrupadas por fecha (día), con un separador visual entre cada grupo de fechas.

#### Scenario: Múltiples cambios en el mismo día

- **WHEN** existen 5 entradas de log con el mismo día (fechas distintas en horas)
- **THEN** se muestran bajo un único separador con la fecha del día (ej. "22 may 2026")
- **AND** dentro del grupo, las entradas están ordenadas de más reciente a más antigua

#### Scenario: Cambios en días diferentes

- **WHEN** existen entradas en fechas distintas
- **THEN** cada día tiene su propio separador visual
- **AND** los días están ordenados de más reciente a más antiguo

## MODIFIED Requirements

### Requirement: Logs are visible in UI

All logs for a program SHALL be retrievable and displayed in the program's detail view. En mobile, el historial se muestra en un tab colapsable separado del editor. En desktop, se muestra como sidebar sticky en el lado derecho. Las entradas deben respetar el dark mode usando colores del design system (`STATUS_COLORS` para badges de acción, separadores con `border-border`).

#### Scenario: View program logs — desktop

- **WHEN** user opens program detail view on desktop (≥ 768px)
- **THEN** system displays the changelog as a sticky right-column sidebar
- **AND** entries are grouped by date with visual separators
- **AND** action badges use STATUS_COLORS (created=teal, deleted=destructive, published=primary, edited=muted)

#### Scenario: View program logs — mobile

- **WHEN** user opens program detail view on mobile (< 768px)
- **THEN** the changelog is hidden behind a "Historial" tab or button
- **AND** tapping the tab reveals the full changelog in a collapsible section or drawer

#### Scenario: Logs show human-readable action

- **WHEN** user views logs for a program
- **THEN** each log action is displayed as free text (e.g., "asignó responsable", "cambió himno", "definió hora")
- **AND** the action is presented as a colored badge (not plain text)
