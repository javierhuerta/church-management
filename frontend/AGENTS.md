# Frontend — Lineamientos para el agente IA

Este directorio contiene la aplicacion React + Vite + shadcn/ui + Tailwind CSS v4.
Las reglas generales del proyecto estan en el `AGENTS.md` raiz.

## Stack

- **Framework**: React (sin Next.js — solo Vite)
- **Build tool**: Vite
- **UI**: shadcn/ui
- **Estilos**: Tailwind CSS v4
- **Formularios**: React Hook Form + Zod
- **Server state**: TanStack Query (React Query)
- **API client**: generado desde OpenAPI (`npm run generate:api`)

## Skills disponibles

Los siguientes skills estan en `frontend/.agents/skills/` y se cargan automaticamente
cuando son relevantes al trabajo en este directorio.

| Skill | Cuándo se activa |
|---|---|
| `vercel-react-best-practices` | Al escribir componentes React, data fetching, optimizacion de re-renders, bundle |
| `vercel-composition-patterns` | Al disenar APIs de componentes, compound components, context providers |
| `react-hook-form` | Al construir formularios con useForm, useWatch, useFieldArray |
| `zod` | Al definir schemas de validacion, safeParse, z.infer |
| `shadcn` | Al agregar/modificar componentes shadcn/ui, components.json, presets |
| `tailwind-css-patterns` | Al aplicar estilos con Tailwind, responsive design, layouts |
| `tailwind-v4-shadcn` | Al configurar Tailwind v4 + shadcn, dark mode, temas, CSS variables |
| `vite` | Al modificar vite.config.ts, plugins, optimizaciones de build |
| `accessibility` | Al mejorar a11y, WCAG 2.2, keyboard navigation, ARIA |
| `frontend-design` | Al construir UI production-grade con alta calidad visual |

## Estructura de directorios

```
src/
├── components/     # Componentes reutilizables
├── features/       # Features de negocio (cada una con sus componentes/hooks)
├── lib/
│   └── api/        # Cliente generado desde OpenAPI — NO editar manualmente
└── main.tsx
```

## Comandos utiles

```bash
# Desarrollo
npm run dev

# Regenerar cliente API (requiere backend corriendo en :3000)
npm run generate:api

# Build
npm run build

# Tests
npm run test
```

## Reglas criticas

- No usar CSS plano — solo shadcn/ui o Tailwind
- No hacer fetch directo — usar el cliente generado en `src/lib/api/`
- No crear componentes fuera de `src/components/` o `src/features/`
- Server state siempre con TanStack Query
