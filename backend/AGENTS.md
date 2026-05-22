# Backend — Lineamientos para el agente IA

Este directorio contiene la aplicacion NestJS + TypeORM + PostgreSQL.
Las reglas generales del proyecto estan en el `AGENTS.md` raiz.

## Stack

- **Framework**: NestJS
- **ORM**: TypeORM
- **Base de datos**: PostgreSQL
- **Lenguaje**: TypeScript estricto

## Skills disponibles

Los siguientes skills estan en `backend/.agents/skills/` y se cargan automaticamente
cuando son relevantes al trabajo en este directorio.

| Skill | Cuándo se activa |
|---|---|
| `nestjs-best-practices` | Al escribir, revisar o refactorizar codigo NestJS (modules, controllers, services, guards, pipes) |
| `nodejs-backend-patterns` | Al crear APIs REST, middleware, autenticacion, integracion con DB |
| `nodejs-best-practices` | Al tomar decisiones de arquitectura, async patterns, seguridad |
| `typescript-advanced-types` | Al implementar tipos complejos, generics, utility types, type safety |

## Convencion de archivos

```
src/
├── modules/<nombre>/
│   ├── <nombre>.module.ts
│   ├── <nombre>.controller.ts
│   ├── <nombre>.service.ts
│   ├── entities/<nombre>.entity.ts
│   └── dto/
│       ├── create-<nombre>.dto.ts
│       └── update-<nombre>.dto.ts
└── common/
    ├── filters/
    ├── guards/
    └── decorators/
```

## Comandos utiles

```bash
# Desarrollo
npm run start:dev

# Migraciones
npm run migration:generate -- src/migrations/<nombre>
npm run migration:run

# Tests
npm run test
npm run test:e2e

# Matar proceso zombie en puerto 3000
lsof -ti:3000 | xargs kill -9
```
