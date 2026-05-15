## Why

Actualmente el sistema tiene usuarios y departamentos definidos como seeds/enums hardcodeados, lo que impide su gestión dinámica. Los administradores y pastores necesitan una interfaz para gestionar usuarios, roles y departamentos sin depender del código.

## What Changes

- **Nuevo módulo de Mantenedores** en el sidebar con tres secciones: Usuarios, Departamentos, Plantillas
- **CRUD de Usuarios**: crear, editar, eliminar usuarios; asignar rol y departamentos donde es director
- **CRUD de Departamentos**: convertir el enum `Department` en entidad editable; migrar datos existentes
- **Exponer Plantillas** en el menú de mantenedores (CRUD ya existe, solo se muestra en UI)
- **Permisos**: solo Admin accede a mantenedores; Pastor tiene acceso a plantillas

## Capabilities

### New Capabilities

- `mantenedor-usuarios`: Gestión de usuarios (CRUD completo, asignación de rol y departamentos)
- `mantenedor-departamentos`: Gestión de departamentos (CRUD completo, relación con directores)
- `mantenedor-plantillas`: Exposición de gestión de plantillas en menú de mantenedores

### Modified Capabilities

- `worship-service-templates`: No cambia requisitos, solo se expone en nueva sección del menú

## Impact

- **Backend**: Nuevo `UsersModule` y `DepartmentsModule` (NestJS)
- **Frontend**: Nueva sección de menú "Mantenedores" con pages para usuarios, departamentos y plantillas
- **Base de datos**: Migración de `Department` de enum a tabla; nueva tabla `user_departments`
- **Seeders**: Actualizar `UserSeeder` para usar la nueva estructura; mantener como semillas

## Out of Scope

- Sistema de registro de usuariosself-service
- Gestión de permisos granular por permisos específicos (los roles ya existen)
- Eliminación de usuarios que tienen programas creados asociados