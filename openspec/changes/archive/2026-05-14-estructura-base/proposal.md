## Why

El proyecto legacy en Django fue limpiado. Necesitamos establecer la estructura base del proyecto con backend (NestJS + TypeORM + PostgreSQL) y frontend (React + Vite + shadcn/ui) para poder implementar las capacidades del sistema de forma modular y preparada para crecer.

## What Changes

- Crear estructura inicial del proyecto (backend/ + frontend/ en el mismo repositorio)
- Inicializar NestJS con TypeORM, PostgreSQL y OpenAPI ( Swagger )
- Inicializar React con Vite, shadcn/ui y Tailwind CSS
- Configurar generación automática de clientes API en el frontend desde el schema OpenAPI
- Crear módulo base de autenticación JWT con roles (Pastor, Anciano, CoordinadorMisionero, DirectorDepartamento, Secretaria, MaestroClase)
- Establecer convenciones de código y estructura de carpetas

## Capabilities

### New Capabilities
- `auth`: Sistema de autenticación JWT con 6 roles de usuario
- `calendar`: Calendario de iglesia — eventos y actividades (módulo inicial)
- `common`: Utilidades compartidas — errores, paginación, timestamps

### Modified Capabilities
(Ninguna — es la estructura inicial)

## Impact

- Se crea `backend/` con proyecto NestJS modular
- Se crea `frontend/` con proyecto React + Vite
- Dependencias: NestJS, TypeORM, class-validator, Passport JWT, React Query, shadcn/ui, Tailwind CSS

## Fuera del alcance

- No se implementa lógica de negocio más allá de auth básico
- No se conecta a PostgreSQL real (solo configuración)
- No se implementan módulos de Cultos o Misión
- No se escriben tests de integración