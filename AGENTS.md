# Agents.md — Lineamientos para el agente IA

## Estilo de trabajo

- **Preguntar antes de actuar**: para tareas irreversibles o que cambian archivos的结构 (ej. mover archivos, cambiar arquitectura, eliminar codigo)
- **Explicar brevemente**: antes de ejecutar un comando destructivo o complejo, decir que vas a hacer y por que
- **Mantener contexto**: cuando trabajes en una spec o change, mantener el nombre visible en las acciones
- **Trabajar en silencio**: no narrar cada accion, solo las importantes

## OpenSpec Workflow

Flujo completo para una nueva feature:

1. `/init <name>` — crear rama Git `feature/<name>` desde development
2. `/plan <name>` — generar propuesta, design y tasks (agente: planner/Kimi-K2.6)
3. `/build <name>` — implementar las tasks (agente: builder/Sonnet-4.6)
4. `/test <name>` — generar tests unitarios/integración (agente: tester/Minimax-M2.7)
5. `/check <name>` — verificar completeness/correctness/skills (agente: reviewer/DeepSeek-4-Flash)
6. `/review <name>` — review de código contra best practices (agente: reviewer/DeepSeek-4-Flash)
7. `/qa <name>` — validar UI con Playwright (agente: reviewer/DeepSeek-4-Flash)
8. `/done <name>` — archivar el change

`/init` debe ejecutarse siempre antes de proponer. Si el usuario describe una feature nueva
sin haber creado rama, sugerir `/init` primero antes de continuar con `/plan`.

### Comandos adicionales

- `/explore` — modo exploración read-only para pensar e investigar (agente: planner)
- `/sync <name>` — sincronizar specs delta a specs principales (agente: planner)
- `/onboard` — tutorial guiado del flujo completo

### Asignación de modelos por comando

| Comando | Agente | Modelo | Subtask |
|---------|--------|--------|---------|
| `/init` | planner | opencode-go/kimi-k2.6 | No |
| `/plan` | planner | opencode-go/kimi-k2.6 | Si |
| `/build` | builder | anthropic/claude-sonnet-4-6 | Si |
| `/test` | tester | opencode-go/minimax-m2.7 | Si |
| `/check` | reviewer | opencode-go/deepseek-4-flash | Si |
| `/review` | reviewer | opencode-go/deepseek-4-flash | Si |
| `/qa` | reviewer | opencode-go/deepseek-4-flash | Si |
| `/done` | planner | opencode-go/kimi-k2.6 | No |
| `/explore` | planner | opencode-go/kimi-k2.6 | No |
| `/sync` | planner | opencode-go/kimi-k2.6 | Si |

La columna "Subtask" indica si el comando corre en una sesión aislada (contexto limpio).
`/build` usa Sonnet-4.6 (el unico de pago) porque es donde se necesita maxima precision.
Los demas usan modelos gratuitos de Go para optimizar costos.

## Stack Tecnologico — Reglas estrictas

### Backend (NestJS + TypeORM + PostgreSQL)
- Archivos por convencion: `*.entity.ts`, `*.dto.ts`, `*.service.ts`, `*.controller.ts`
- Siempre usar TypeORM entities con decoradores, no queries crudo
- DTOs con class-validator para validacion
- Controllers con documentacion OpenAPI decoradores (@ApiTags, @ApiOperation, etc.)
- Modules independientes por capacidad

#### TypeORM: `@JoinColumn` obligatorio en `@ManyToOne`

**Toda relación `@ManyToOne` que tenga un `@Column` explícito para la FK debe llevar también `@JoinColumn({ name: '...' })` con el nombre snake_case de la columna.**

Sin `@JoinColumn`, TypeORM genera automáticamente una columna camelCase adicional (p.ej. `programId`) separada de la columna snake_case declarada en `@Column({ name: 'program_id' })`. El resultado: los datos se guardan en `program_id` pero los JOINs operan sobre `programId` (siempre vacía), devolviendo todas las relaciones como `null` o `[]` sin ningún error visible.

```typescript
// MAL — TypeORM crea una columna "programId" separada en la BD
@ManyToOne(() => ServiceProgram, ...)
program: ServiceProgram;

@Column({ name: 'program_id', type: 'uuid' })
programId: string;

// BIEN — @JoinColumn indica explícitamente qué columna usar para el JOIN
@ManyToOne(() => ServiceProgram, ...)
@JoinColumn({ name: 'program_id' })
program: ServiceProgram;

@Column({ name: 'program_id', type: 'uuid' })
programId: string;
```

Si en la BD existen columnas duplicadas camelCase (p.ej. `programId` junto a `program_id`), crear una migración para eliminar las camelCase **después** de agregar `@JoinColumn` y confirmar que los datos están en la columna snake_case.

#### TypeORM: Seeders — no confiar en cascade implícito

No usar `cascade` de TypeORM en seeders a menos que esté declarado `cascade: true` en la entidad. Crear cada entidad hija explícitamente con su propio repositorio, pasando el FK manualmente:

```typescript
// MAL — los hijos se ignoran silenciosamente si la entidad no tiene cascade: true
const template = templateRepo.create({ name, groups: [...] });
await templateRepo.save(template);

// BIEN — cada entidad hija se guarda con su repo propio
const template = await templateRepo.save(templateRepo.create({ name }));
for (const g of groupsData) {
  const group = await groupRepo.save(groupRepo.create({ ...g, templateId: template.id }));
  for (const s of g.sections) {
    await sectionRepo.save(sectionRepo.create({ ...s, groupId: group.id, templateId: template.id }));
  }
}
```

Esto aplica también al runner `scripts/seeders/run-all.ts`: cada entidad del árbol necesita su repositorio y sus FKs explícitos.

### Frontend (React + Vite + shadcn/ui + Tailwind)
- No usar CSS plano — usar componentes shadcn o Tailwind
- No crear componentes fuera de `src/components/` o `src/features/`
- Para consumir API: usar clientes generados desde OpenAPI (no fetch directo)
- Estados: usar React Query (TanStack Query) para server state
- **Al crear o modificar cualquier componente visual**: cargar la skill `church-ui-design` antes de escribir código. Define la paleta de colores, cómo aplicarlos (clases semánticas vs `style` inline), jerarquía tipográfica, patrón mobile/desktop obligatorio y todos los patrones de UI del sistema.

### OpenAPI
- El backend es la fuente de verdad para los schemas
- Cuando crees/modifiques endpoints, usar decoradores OpenAPI completos
- No hardcodear URLs del frontend — usar variables de entorno

### OpenAPI Client Generation (Frontend)

**Comando para regenerar:**
```bash
npm run generate:api
```

**Flujo correcto:**
1. Asegurarse que el backend esté corriendo (`npm run start:dev`)
2. El schema se genera en `http://localhost:3000/api-json`
3. El comando descarga el schema y genera los tipos en `src/lib/api/`
4. **Importante**: Si `request.ts` queda vacío después de regenerar, restaurarlo con:
   ```bash
   git checkout src/lib/api/core/request.ts
   ```

**Reglas para DTOs del backend (evitar tipos incorrectos en el schema):**
- Para campos opcionales con `string | null`, usar: `@ApiPropertyOptional({ type: String, nullable: true })`
- Para campos requeridos con `string`, usar: `@ApiProperty({ type: String })`
- **No usar** `@ApiPropertyOptional({ nullable: true })` sin `type: String` — genera `Record<string, any>` en vez de `string`
- Para uploads de archivos, crear un DTO formal con `@ApiProperty({ type: 'string' })` — no usar `@ApiBody({ schema: ... })` inline

**Solución de problemas:**
- Si el codegen genera tipos `Record<string, any>` en vez de `string`, revisar los `@ApiProperty` en el backend
- Si el build pasa pero hay errores de runtime en浏览器, puede ser `request.ts` corrupto — restaurar con git
- El archivo `setup.ts` configura `OpenAPI.BASE = ''` — las rutas en los servicios ya incluyen `/api/`

## Diagnóstico: problemas frecuentes de desarrollo

### Puerto 3000 ocupado por proceso zombie

Si `nest start --watch` no arranca, devuelve 404 en rutas nuevas, o el servidor no refleja cambios recientes, es probable que haya un proceso viejo ocupando el puerto:

```bash
lsof -ti:3000 | xargs kill -9
```

Arrancar siempre con `nest start --watch` desde `backend/`. Si el problema persiste, matar también procesos nest huérfanos:

```bash
pkill -f "nest start"
```

### IMPORTANTE — No levantar backend ni frontend

**El usuario corre el backend (puerto 3000) y frontend (puerto 5173) en su propia terminal.**
Antes de intentar arrancar cualquiera de los dos, verificar si el puerto ya está ocupado:

```bash
lsof -ti:3000   # si devuelve un PID, el backend ya está corriendo
lsof -ti:5173   # si devuelve un PID, el frontend ya está corriendo
```

Si el puerto está ocupado → **NO hacer nada**, el proceso del usuario ya está sirviendo.
Solo matar un proceso si el usuario lo pide explícitamente o si es claramente un proceso zombie (servidor muerto que no responde).

### Migraciones: verificar columna antes de hacer DROP

Antes de hacer `DROP COLUMN` en una migración que limpia duplicados, confirmar qué columna contiene los datos reales:

```sql
SELECT "program_id", "programId" FROM service_program_groups LIMIT 5;
```

Solo borrar la columna que esté vacía. Si hay datos en ambas, investigar antes de proceder.

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

## Skills disponibles por contexto

Los skills se cargan bajo demanda via la herramienta `skill`. Los agentes (builder, tester, reviewer) tienen instrucciones explicitas de cargar skills antes de trabajar.

### OpenCode
Registrados via `.opencode/opencode.json` → `skills.paths`. OpenCode los escanea y los expone al agente cuando son relevantes al prompt.

### Agentes custom (`.opencode/agents/`)
- `orchestrator` (google/gemini-3-flash-preview) — orquestador del flujo OpenSpec, guía paso a paso
- `planner` (Kimi-K2.6) — proposals, specs, design, tasks, archive
- `builder` (Sonnet-4.6) — implementación con carga obligatoria de skills
- `tester` (Minimax-M2.7) — generación de tests siguiendo patrones del proyecto
- `reviewer` (DeepSeek-4-Flash) — review de código contra skills y best practices, QA con Playwright

### Reglas de carga de skills (para el agente builder)

| Ámbito del archivo | Skills obligatorias |
|---|---|
| `frontend/src/**/*.tsx` | `church-ui-design` (siempre) |
| Formularios React | + `react-hook-form` |
| Componentes UI nuevos | + `shadcn` |
| Layouts/estilos | + `tailwind-v4-shadcn` |
| `backend/src/modules/**/*.ts` | `nestjs-best-practices` |
| Entidades/DTOs | + `typescript-advanced-types` |
| Ambos lados | Todas las relevantes |

### Backend (`backend/.agents/skills/`)
- `nestjs-best-practices` — arquitectura NestJS, DI, seguridad, performance
- `nodejs-backend-patterns` — patrones Express/Fastify, middleware, auth, DB
- `nodejs-best-practices` — principios de decision, async patterns, seguridad
- `typescript-advanced-types` — generics, conditional types, mapped types

### Frontend — Design System (`.opencode/skills/` y `.claude/skills/`)
- `church-ui-design` ⭐ — **skill principal de diseño del proyecto**. Paleta de marca, cómo aplicar colores (semántico vs inline), tipografía sin tags HTML semánticos, patrón mobile/desktop obligatorio, patrones de tarjetas de evento, badges, dark mode. **Cargar siempre que se construya o modifique cualquier componente o pantalla.**

### Frontend — Skills técnicas (`frontend/.agents/skills/`)
- `vercel-react-best-practices` — performance React/Vite, data fetching, bundle
- `react-hook-form` — formularios con useForm, useWatch, useFieldArray
- `shadcn` — componentes shadcn/ui, CLI, presets, components.json
- `tailwind-css-patterns` — utilidades Tailwind, responsive, layouts
- `tailwind-v4-shadcn` — setup Tailwind v4 + shadcn + Vite, dark mode, temas
- `zod` — validacion de schemas, safeParse, z.infer
- `vite` — configuracion vite.config.ts, plugins, SSR
- `vercel-composition-patterns` — compound components, context providers, APIs reutilizables
- `accessibility` — WCAG 2.2, a11y, keyboard navigation, ARIA
- `frontend-design` — UI production-grade, tipografia, motion, estetica

## Engram Memory Protocol

Tienes acceso a **memoria persistente** via MCP (Engram) — herramientas disponibles: `mem_save`, `mem_search`, `mem_context`, `mem_session_summary`, `mem_capture_passive`, `mem_get_observation`, `mem_current_project`.

### Cuándo guardar (obligatorio)

Llamar `mem_save` automáticamente después de CADA uno de estos eventos:

- **Bugfixes** — qué estaba mal, por qué, cómo se arregló
- **Decisiones arquitectónicas** — trade-offs, alternativas consideradas
- **Descubrimientos** — gotchas, comportamientos inesperados, configuraciones
- **Nuevos patrones o convenciones** establecidas en el proyecto
- **Cambios en estructura de archivos** significativos

Formato del contenido:
```
**What**: [qué se hizo]
**Why**: [por qué]
**Where**: [archivos afectados]
**Learned**: [gotchas o aprendizajes, omitir si no aplica]
```

### Cuándo buscar memoria

- **Al inicio** de cada sesión significativa, llamar `mem_context` para ver contexto reciente
- **Reactivo**: cuando el usuario diga "recuerda", "busca" o similar
- **Proactivo**: antes de implementar algo que podría tener contexto de sesiones previas

### Cierre de sesión

Al terminar tareas importantes, llamar `mem_session_summary` con el formato:
```
## Goal
[qué se buscaba]

## Discoveries
- [hallazgos importantes]

## Accomplished
- ✅ [lo completado]

## Next Steps
- [lo que sigue]

## Relevant Files
- ruta/archivo.ts — [qué cambió]
```

### Post-compactación

Si el contexto se comprime o reinicia, llamar `mem_context` inmediatamente para recuperar estado antes de continuar.

---

**Version**: 2.0 — 2026-05-24