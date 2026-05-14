## Why

La iglesia necesita gestionar los cultos semanales de manera estructurada, definiendo plantillas reutilizables con las secciones de cada culto (Escuela Sabática, Culto Divino, Culto JA, Culto de Oración). Actualmente no existe un sistema para definir responsables, himnos y tiempos para cada parte del programa, lo que genera improvisación y falta de trazabilidad.

## What Changes

- Nuevo módulo NestJS `worship-services` para gestionar plantillas de cultos y programas de culto
- Entidades: `ServiceTemplate`, `ServiceProgram`, `ServiceProgramLog`, `Hymn`
- CRUD para plantillas con grupos y secciones configurables
- Creación de programas a partir de plantillas con valores editables
- Sistema de auditoría (logs) para registrar cambios en los programas
- Seeder con los 695 himnos del himnario adventista
- Selector de himnos con autocomplete
- Permisos diferenciados: Admin/Pastor pueden editar plantillas, Admin/Pastor/Anciano/DirectorDepartamento pueden crear y editar programas

## Capabilities

### New Capabilities

- `worship-service-templates`: Gestión de plantillas de cultos con grupos y secciones
- `worship-service-programs`: Creación y gestión de programas de culto a partir de plantillas
- `worship-service-audit`: Historial de cambios en programas de culto
- `hymn-database`: Base de datos de himnos con buscador

### Modified Capabilities

- (ninguna)

## Impact

- **Backend**: Nuevo módulo `worship-services` en `backend/src/modules/worship-services/`
- **Database**: Nuevas tablas para templates, programs, logs, e himnos
- **Frontend**: Nuevas páginas para gestión de plantillas y programas de cultos
- **Seeds**: Seeder de himnos (~695 registros)
- **Permisos**: Nuevos permisos basados en roles existentes

## Out of Scope

- Integración con el calendario de eventos (cultos son conceptualmente separados)
--notificaciones o recordatorios de cultos
- Gestión de asistencia a cultos
- Reportes o estadísticas de cultos