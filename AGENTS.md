# Agents.md — Lineamientos para el agente IA

## Estilo de trabajo

- **Preguntar antes de actuar**: para tareas irreversibles o que cambian archivos的结构 (ej. mover archivos, cambiar arquitectura, eliminar codigo)
- **Explicar brevemente**: antes de ejecutar un comando destructivo o complejo, decir que vas a hacer y por que
- **Mantener contexto**: cuando trabajes en una spec o change, mantener el nombre visible en las acciones
- **Trabajar en silencio**: no narrar cada accion, solo las importantes

## OpenSpec Workflow

- Usar los comandos: `/opsx-propose`, `/opsx-apply`, `/opsx-archive`
- Las skills manejan el flujo automáticamente

## Stack Tecnologico — Reglas estrictas

### Backend (NestJS + TypeORM + PostgreSQL)
- Archivos por convencion: `*.entity.ts`, `*.dto.ts`, `*.service.ts`, `*.controller.ts`
- Siempre usar TypeORM entities con decoradores, no queries crudo
- DTOs con class-validator para validacion
- Controllers con documentacion OpenAPI decoradores (@ApiTags, @ApiOperation, etc.)
- Modules independientes por capacidad

### Frontend (React + Vite + shadcn/ui + Tailwind)
- No usar CSS plano — usar componentes shadcn o Tailwind
- No crear componentes fuera de `src/components/` o `src/features/`
- Para consumir API: usar clientes generados desde OpenAPI (no fetch directo)
- Estados: usar React Query (TanStack Query) para server state

### OpenAPI
- El backend es la fuente de verdad para los schemas
- Cuando crees/modifiques endpoints, usar decoradores OpenAPI completos
- No hardcodear URLs del frontend — usar variables de entorno
- Generar el schema con `npm run generate:api` o similar (por definir)

## Convenciones de codigo

- **Commits**: conventional commits (feat:, fix:, chore:, docs:, refactor:)
- **Naming**:
  - Archivos: kebab-case (`user-profile.service.ts`)
  - Clases: PascalCase (`UserProfileService`)
  - Variables: camelCase
- **Types**: no usar `any`, no usar `interface` para objetos de dominio — usar `type` o class
- **Errores**: siempre usar clases de error custom, no throw strings

## Permisos y restricciones

### Puede hacer sin preguntar
- Crear/modificar archivos dentro de un change activo
- Escribir tests para codigo existente
- Actualizar imports y refactors menores
- Crear archivos de spec/proposal/tasks
- Linting y formatting

### Debe preguntar antes de
- Eliminar archivos o carpetas
- Cambiar arquitectura de modulos NestJS
- Modificar el schema de base de datos (agregar columna, cambiar tipo)
- Hacer commit (a menos que el usuario lo pida explicitamente)
- Crear archivos fuera de los directorios del proyecto

### Nunca hacer
- Cambiar el schema de la base de datos en production
- Hacer push al remote sin confirmacion
- Comitear secretos, keys, passwords, .env en el repo
- Ignorar errores de linter o typecheck
- Trabajar sobre main para tareas de refactor o cleanup

### Reglas de versionado
- Para tareas destructivas o refactors mayores, crear rama dedicada desde development
- No hacer merge a development hasta que esté validado (por el usuario o por tests)
- Una vez completada la tarea, volver a development y continuar desde ahi
- **Nota**: main tiene el sistema legacy que está corriendo. No tocar main hasta que se complete la actualización del stack.

## Estructura de proyecto (por definir agreed)

```
church-management/
├── backend/           # NestJS app
│   └── src/
│       ├── modules/   # un folder por modulo
│       ├── common/    # shared (filters, guards, decorators)
│       └── main.ts
├── frontend/          # React + Vite app
│   └── src/
│       ├── components/
│       ├── features/
│       ├── lib/       # generated API clients
│       └── main.tsx
└── openspec/         # specs y cambios
```

## Flags especiales

- **Explorando**: cuando el usuario este en modo explore, no implementar, solo pensar y sugerir
- **Implementando change**: cuando haya un change activo, enfocarse solo en las tareas de ese change
- **Review**: cuando pida review, ser critico y específico, no generico

## Glosario rapido (para referencia)

- Spec = especificacion de una capacidad
- Change = propuesta de implementacion con tasks
- Module = modulo NestJS
- Feature = feature de negocio (no necesariamente igual a modulo)

---

**Version**: 1.0 — 2025-05-14