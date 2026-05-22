# UI Scenarios — Formato de referencia

Este archivo es una referencia de formato para el agente al generar la sección `## UI Scenarios`
en `design.md`. Es leído por el skill `/qa-change` para ejecutar validación con Playwright.

---

## Template de sección completa

```markdown
## UI Scenarios

> Estos escenarios son ejecutados por `/qa-change` con Playwright MCP.
> Requiere frontend en http://localhost:5173 y backend en http://localhost:3000.

### Scenario: <nombre descriptivo del flujo de usuario>
**URL**: `/ruta-relativa`
**Description**: Una oración explicando qué flujo o funcionalidad valida este escenario.

> **Auth required** (incluir solo si el escenario requiere login previo):
> Usa credenciales de prueba admin. `/qa-change` pedirá estos datos antes de ejecutar.

**Steps**:
1. Navigate to `/ruta`
2. Fill `[data-testid="nombre-campo"]` with `valor realista`
3. Click `[data-testid="nombre-boton"]`
4. Expect URL to contain `/ruta-esperada`
5. Expect text `Texto visible esperado` to be visible

**ASCII Wireframe** (estado final esperado tras completar todos los steps):
```
┌─────────────────────────────────┐
│  Título de la página            │
│                                 │
│  Contenido que el usuario       │
│  debería ver al terminar        │
└─────────────────────────────────┘
```
```

---

## DSL de Steps — referencia completa

| Step | Playwright MCP tool |
|------|-------------------|
| `Navigate to /ruta` | `playwright_browser_navigate` |
| `Fill [selector] with valor` | `playwright_browser_type` |
| `Click [selector]` | `playwright_browser_click` |
| `Select [selector] option valor` | `playwright_browser_select_option` |
| `Wait for text Texto` | `playwright_browser_wait_for` |
| `Expect URL to contain /ruta` | assert URL after navigation |
| `Expect text Texto to be visible` | check accessibility snapshot |
| `Expect element [selector] to exist` | check snapshot for element |
| `Take screenshot` | explicit screenshot capture |

---

## Reglas

- **Selectores**: preferir `data-testid` — sobreviven refactors de estilo
- **Wireframes**: representan el estado FINAL, no estados intermedios
- **Granularidad**: un escenario por flujo distinto (login, crear registro, ver listado, etc.)
- **Valores de prueba**: realistas pero seguros (`test@iglesia.com`, no `aaa@bbb.com`)
- **Change backend-only**: omitir la sección completa y agregar al final del design.md:
  `<!-- No UI Scenarios: backend-only change -->`

---

## Ejemplo real

```markdown
## UI Scenarios

> Estos escenarios son ejecutados por `/qa-change` con Playwright MCP.
> Requiere frontend en http://localhost:5173 y backend en http://localhost:3000.

### Scenario: Crear nuevo miembro
**URL**: `/members`
**Description**: Valida que un usuario con rol Secretaria puede crear un miembro nuevo desde el listado.

> **Auth required**: Usa credenciales de prueba con rol Secretaria de Iglesia.

**Steps**:
1. Navigate to `/members`
2. Click `[data-testid="btn-nuevo-miembro"]`
3. Fill `[data-testid="input-nombre"]` with `Juan Pérez`
4. Fill `[data-testid="input-email"]` with `juan@iglesia.com`
5. Click `[data-testid="btn-guardar"]`
6. Expect text `Miembro creado exitosamente` to be visible
7. Expect text `Juan Pérez` to be visible

**ASCII Wireframe** (estado final esperado):
```
┌──────────────────────────────────┐
│  Miembros                        │
│                                  │
│  ✓ Miembro creado exitosamente   │
│                                  │
│  ┌──────────────────────────┐   │
│  │ Juan Pérez               │   │
│  │ juan@iglesia.com         │   │
│  └──────────────────────────┘   │
└──────────────────────────────────┘
```
```
