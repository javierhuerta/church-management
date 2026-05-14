## Why

Facilitar la ejecución simultánea de ambos servicios (backend y frontend) desde la raíz del proyecto, y estandarizar comandos para tareas comunes como testing, linting y generación de API.

## What Changes

- Crear `package.json` en la raíz del proyecto
- Agregar scripts para desarrollo, build, test y lint de ambos servicios
- Scripts para operaciones de base de datos (migrate, seed) — implementados cuando estén disponibles
- Scripts para generación de API del frontend
- Opción para correr todos los servicios en paralelo durante desarrollo

## Capabilities

### New Capabilities
- `root-scripts`: Define los comandos npm disponibles en la raíz del proyecto para operar ambos servicios

## Impact

- Nuevo archivo: `package.json` en `/`
- Dependencias necesarias: `npm-run-all`
- Afecta el flujo de trabajo diario de desarrollo

## Out of Scope

- Tests del frontend (se decidirá después)
- Migraciones y seeds de base de datos (configuración posterior)
- Deployment scripts