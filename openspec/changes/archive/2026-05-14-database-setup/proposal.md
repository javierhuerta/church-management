## Why

Establecer una infraestructura de base de datos robusta desde el inicio del proyecto, utilizando PostgreSQL con Docker Compose para desarrollo, migrations para control de esquema, y seeders para poblar datos de prueba de forma reproducible.

## What Changes

- Docker Compose para levantar PostgreSQL en desarrollo
- Scripts npm para ejecutar migrations (run, revert, generate)
- Scripts npm para ejecutar seeders
- Scripts para ambiente de producción con Docker
- Actualización de package.json en root y backend con nuevos comandos
- Seeder inicial para tabla de usuarios
- Seeder inicial para tabla de eventos (Calendario)

## Capabilities

### New Capabilities
- `database-migrations`: Gestión del esquema de base de datos con migrations TypeORM
- `database-seeds`: Población de datos de prueba mediante seeders CLI
- `docker-infra`: Infraestructura Docker para desarrollo y producción

### Modified Capabilities
- `root-scripts`: Agregar comandos `db:*` al raíz para manejar base de datos

## Impact

- Backend: nuevo archivo `data-source.ts` para CLI de TypeORM
- Backend: nuevo directorio `src/migrations/` y `src/seeds/`
- Backend: actualización de `package.json` con scripts de migrations y seeds
- Root: nuevo `docker-compose.yml` y `docker-compose.prod.yml`
- Root: actualización de `package.json` con comandos Docker

## Out of Scope

- Configuración de producción en cloud (AWS, Railway, etc.)
- Migraciones de datos entre versiones del esquema
- Backups automatizados de base de datos