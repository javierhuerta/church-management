## Context

El proyecto tiene backend (NestJS) y frontend (React + Vite) en carpetas separadas. Actualmente para trabajar hay que ejecutar comandos desde cada carpeta. Se necesita centralizar los comandos en la raíz.

## Goals / Non-Goals

**Goals:**
- Scripts en la raíz para ejecutar comandos comunes de ambos servicios
- Desarrollo simultáneo con `dev:all`
- Testing y linting unificado
- Generar API del frontend desde la raíz

**Non-Goals:**
- No cambiar la arquitectura de servicios
- No implementar tests del frontend (se decide después)
- No configurar migraciones/seeds de DB (se configura después)

## Decisions

### 1. Usar `npm-run-all` en vez de `concurrently`

**Decisión**: `npm-run-all` para scripts paralelos.

**Alternativas considered**:
- `concurrently`: Más simple, pero menos features para orquestación
- `npm-run-all`: Más popular, mejor para casos avanzados (secuencial + paralelo)

**Rationale**: `npm-run-all` tiene mejor soporte para combinaciones `-p` (parallel) y `-s` (sequential), y es ampliamente adoptado.

### 2. Estructura de scripts

```
dev:backend     → cd backend && npm run start:dev
dev:frontend    → cd frontend && npm run dev
dev:all         → npm-run-all -p dev:backend dev:frontend

test:backend    → cd backend && npm run test
test:frontend   → (pending - se configura después)
test:all        → npm-run-all -p test:backend (frontend pending)

lint:backend    → cd backend && npm run lint
lint:frontend   → cd frontend && npm run lint
lint:all        → npm-run-all lint:backend lint:frontend

build:backend   → cd backend && npm run build
build:frontend  → cd frontend && npm run build
build:all       → npm-run-all -p build:backend build:frontend

api:generate    → cd frontend && npm run generate:api

db:migrate      → (pending - se configura después)
db:seed         → (pending - se configura después)
```

### 3. Dependencias

- `npm-run-all` como devDependency en la raíz

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Los scripts de DB no están implementados aún | Se agregan cuando se configure TypeORM CLI |
| Tests de frontend pendientes | Se agrega `test:frontend` cuando se configure el framework |

## Migration Plan

1. Crear `package.json` en la raíz
2. Instalar `npm-run-all`
3. Definir todos los scripts
4. Verificar que `dev:all` funciona correctamente

## Open Questions

- None