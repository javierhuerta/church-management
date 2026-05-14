## Context

El proyecto legacy Django fue limpiado. Se necesita crear la estructura base para NestJS + React con generación automática de clientes API desde OpenAPI.

**Estado actual:**
- Proyecto vacío con AGENTS.md, README.md, openspec/config.yaml
- Rama `chore/django-cleanup` creada para esta tarea

## Goals / Non-Goals

**Goals:**
- Estructura clara: `backend/` (NestJS) y `frontend/` (React)
- Módulos NestJS: auth, calendar, common
- React con Vite + shadcn/ui + Tailwind CSS
- OpenAPI configurado con generación automática de clientes
- Auth JWT funcional con 6 roles

**Non-Goals:**
- No implementar lógica de negocio más allá de auth básico
- No conectar PostgreSQL real (solo configuración TypeORM)
- No crear tests de integración
- No implementar módulos de Cultos o Misión

## Decisions

### 1. Estructura del repositorio

```
church-management/
├── backend/
│   └── src/
│       ├── modules/
│       │   ├── auth/
│       │   ├── calendar/
│       │   └── common/
│       ├── main.ts
│       └── app.module.ts
├── frontend/
│   └── src/
│       ├── components/
│       ├── features/
│       ├── lib/        # API clients generados
│       └── main.tsx
└── openspec/
```

**Decisión:** Carpetas separadas porque son proyectos independientes que pueden desplegarse por separado.

### 2. API client generation

Usar `openapi-typescript-codegen` o similar para generar los clientes desde el schema OpenAPI del backend.

**Alternativa:** SDK manual
**Decisión:** Generación automática garantiza sincronización frontend/backend.

### 3. ORM

TypeORM con migrations activas.

**Alternativa:** Prisma
**Decisión:** TypeORM tiene mejor integración con decoradores NestJS.

## Risks / Trade-offs

- [Riesgo] Schema OpenAPI desincronizado con backend → Mitigation: script en pre-commit
- [Trade-off] NestJS tiene más ceremony que frameworks minimalistas → Aceptado: la estructura modular escala mejor
- [Riesgo] shadcn/ui requiere CLI y configuración inicial → Mitigation: inicializar con componentes básicos necesarios

## Open Questions

1. ¿Package manager: npm, pnpm, o yarn?
2. ¿Usar workspaces de npm para el monorepo?
3. ¿El schema OpenAPI se genera en build time o es paso manual?