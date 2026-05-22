# Worship Service Audit

## Purpose

Tracks all changes made to worship service programs and their sections. Every modification creates an immutable log entry recording who changed what, when, and from which value to which value. Audit logs are displayed in the program detail view to provide full traceability.

## Requirements

### Requirement: Log all section changes

The system SHALL create a log entry whenever any field of a section is modified in a program.

#### Scenario: Change responsible

- **WHEN** user changes section "Sermón" responsible from "Juan Pérez" to "María García"
- **THEN** a log entry is created with:
  - userId: current user
  - sectionId: section id
  - action: "cambió responsable"
  - previousValue: "Juan Pérez"
  - newValue: "María García"
  - timestamp: current time

#### Scenario: Change hymn

- **WHEN** user changes section "Himno inicial" hymnText from "Himno 100" to "Himno 145"
- **THEN** a log entry is created with action "cambió himno"

#### Scenario: Change start time

- **WHEN** user changes section "Oración" startTime from "10:00" to "10:05"
- **THEN** a log entry is created with action "cambió hora de inicio"

### Requirement: Log program-level changes

The system SHALL create a log entry when the program itself is modified (not a specific section).

#### Scenario: Change program date

- **WHEN** user changes program date from "2026-05-16" to "2026-05-23"
- **THEN** a log entry is created with:
  - sectionId: null (program-level change)
  - action: "cambió fecha"
  - previousValue: "2026-05-16"
  - newValue: "2026-05-23"

#### Scenario: Publish program

- **WHEN** user publishes a program
- **THEN** a log entry is created with action "publicó programa"

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

#### Scenario: View program logs

- **WHEN** user opens program detail view
- **THEN** system displays all logs ordered by timestamp (newest first)
- **AND** each log shows user name, action description, previousValue, newValue, and timestamp

#### Scenario: Logs show human-readable action

- **WHEN** user views logs for a program
- **THEN** each log action is displayed as free text (e.g., "asignó responsable", "cambió himno", "definió hora")
- **AND** the action is presented as a colored badge (not plain text)

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

### Requirement: Logs are immutable

Log entries cannot be modified or deleted after creation.

#### Scenario: Attempt to delete log

- **WHEN** user attempts to delete a log entry
- **THEN** system returns 405 Method Not Allowed

#### Scenario: Attempt to edit log

- **WHEN** user attempts to edit a log entry
- **THEN** system returns 405 Method Not Allowed
