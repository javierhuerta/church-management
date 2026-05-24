---
name: qa-change
description: QA validation of a change using Playwright MCP. Navigates to documented UI Scenarios in design.md, executes interaction steps, and generates a QA report with screenshots. Use after /check and before /done.
license: MIT
compatibility: Requires Playwright MCP configured in opencode.json. Frontend and backend must be reachable (or skill will detect and warn).
metadata:
  author: church-management
  version: "1.0"
---

Run QA validation for a change by testing its documented UI scenarios with Playwright.

**Input**: Optionally specify a change name. If omitted, prompt the user to select one.

---

## Overview

This skill reads the `## UI Scenarios` section from a change's `design.md`, then uses the Playwright MCP to navigate the app, execute interaction steps, and verify that the UI matches the documented expected state.

**Required stack**: Frontend at `http://localhost:5173`, Backend at `http://localhost:3000`.

---

## Steps

### 1. Resolve the change name

If no change name was provided:
- Run `openspec list --json` to get available changes
- Use **AskUserQuestion** to let the user select one
- **IMPORTANT**: Never auto-select. Always ask.

### 2. Locate design.md

Run:
```bash
openspec instructions apply --change "<name>" --json
```

Parse `contextFiles.design` to get the path(s) to `design.md`. Read the file.

If no `design.md` exists:
- Output: "No design.md found for change `<name>`. Cannot run QA without documented UI Scenarios."
- Stop.

### 3. Check for `## UI Scenarios` section

Scan `design.md` for a section starting with `## UI Scenarios`.

If the section does not exist:
- Output the following and stop:

  ```
  ## QA Report: <name>

  **Status**: SKIPPED — No UI Scenarios documented

  The `design.md` for this change does not contain a `## UI Scenarios` section.

  To enable QA validation, add the following to `design.md`:

  ## UI Scenarios

  ### Scenario: <descriptive name>
  **URL**: `/relative-path`
  **Description**: What this scenario validates

  **Steps**:
  1. Navigate to `/route`
  2. Fill `[data-testid="field"]` with `value`
  3. Click `button[type="submit"]`
  4. Expect URL to contain `/expected-route`
  5. Expect text `Expected text` to be visible

  **ASCII Wireframe** (expected final state):
  \`\`\`
  ┌────────────────────────┐
  │  Page Title            │
  │  Expected content here │
  └────────────────────────┘
  \`\`\`
  ```

### 4. Parse UI Scenarios

Extract all scenarios from the `## UI Scenarios` section. For each `### Scenario:` block, parse:

| Field | How to parse |
|---|---|
| **Name** | The heading after `### Scenario:` |
| **URL** | Value after `**URL**:` |
| **Description** | Value after `**Description**:` |
| **Steps** | Ordered list under `**Steps**:` |
| **ASCII Wireframe** | Code block under `**ASCII Wireframe**:` (optional, used as reference) |

Steps use a simple DSL:
- `Navigate to <url>` → `playwright_browser_navigate`
- `Fill <selector> with <value>` → `playwright_browser_type`
- `Click <selector>` → `playwright_browser_click`
- `Expect URL to contain <string>` → assert current URL after navigation
- `Expect text <string> to be visible` → check accessibility snapshot for text
- `Expect element <selector> to exist` → check snapshot for element
- `Select <selector> option <value>` → `playwright_browser_select_option`
- `Wait for text <string>` → `playwright_browser_wait_for`
- `Take screenshot` → explicit screenshot capture (always done at end of scenario)

### 5. Check environment availability

Before running any scenario, verify the stack is reachable:

**Frontend check** — navigate to `http://localhost:5173`:
- If successful (page loads): frontend is UP
- If error/timeout: frontend is DOWN

**Backend check** — navigate to `http://localhost:3000/api`:
- If 200 or any response: backend is UP
- If error/connection refused: backend is DOWN

If either is DOWN:
- Output a clear warning block:
  ```
  ## QA Report: <name>

  **Status**: BLOCKED — Stack not reachable

  | Service  | URL                       | Status |
  |----------|---------------------------|--------|
  | Frontend | http://localhost:5173     | DOWN   |
  | Backend  | http://localhost:3000/api | UP     |

  Start the required services and re-run `/qa <name>`.

  Frontend: `cd frontend && npm run dev`
  Backend:  `cd backend && npm run start:dev`
  ```
- Stop.

If both are UP, continue.

### 6. Execute scenarios

Use **TodoWrite** to track each scenario as a todo item.

For each scenario, in order:

a. **Mark scenario as in_progress** in the todo list.

b. **Execute steps** using Playwright MCP tools. For each step:
   - Map the step DSL to the correct Playwright MCP tool call
   - If a step fails (element not found, unexpected URL, text not visible):
     - Record the failure with step number and error message
     - Take a screenshot immediately at the point of failure
     - Continue to next steps if possible (non-blocking), or stop scenario if navigation failed

c. **Take a final screenshot** of the page state after all steps complete (even on partial failure).
   - Save screenshots to `qa-reports/<change-name>/` (create directory if needed)
   - Name files descriptively: `<scenario-slug>-final.png`, `<scenario-slug>-fail-step-N.png`
   - This directory is ignored by git (listed in `.gitignore`)

d. **Capture accessibility snapshot** (`playwright_browser_snapshot`) after the final screenshot — use it to assess text visibility and element presence.

e. **Evaluate scenario result**:
   - **PASS**: All steps completed without errors
   - **FAIL**: One or more steps failed
   - **PARTIAL**: Some steps passed, some failed

f. **Mark scenario as complete** in the todo list with its result status.

### 7. Generate QA Report

After all scenarios are executed, output the full report:

```markdown
## QA Report: <change-name>

**Run at**: <timestamp>
**Frontend**: http://localhost:5173 — UP
**Backend**: http://localhost:3000 — UP

---

### Results

| Scenario | Status | Steps Passed | Notes |
|----------|--------|-------------|-------|
| Login exitoso | ✅ PASS | 5/5 | — |
| Crear miembro | ❌ FAIL | 3/5 | Step 4: button not found |
| Ver dashboard | ⚠️ PARTIAL | 4/5 | Step 3: text missing |

---

### Scenario Details

#### ✅ Scenario: Login exitoso
All 5 steps passed. Final state matches expected wireframe.
[Screenshot: final state]

#### ❌ Scenario: Crear miembro
**Failed at step 4**: Element `button[data-testid="submit-member"]` not found.
- Steps 1–3: OK
- Step 4: FAIL — element not in DOM
- Steps 5–6: Skipped after navigation failure
[Screenshot: state at failure]

---

### Verdict

| Result | Count |
|--------|-------|
| ✅ PASS | 1 |
| ❌ FAIL | 1 |
| ⚠️ PARTIAL | 1 |

**Overall**: ⚠️ PARTIAL PASS — 1 scenario(s) failed. Review failures before archiving.

**Recommendation**: Fix the failing scenario(s) and re-run `/qa <name>` before running `/done`.
```

**Verdict rules**:
- All scenarios PASS → `✅ FULL PASS — Ready to archive. Run /done <name>.`
- Any scenario FAIL or PARTIAL → `⚠️ PARTIAL PASS` or `❌ FAIL — Fix issues before archiving.`
- Zero scenarios executed (all errored) → `❌ BLOCKED — Could not execute any scenarios.`

---

## Guardrails

- **Never skip environment check** — always verify localhost:5173 and localhost:3000 before running scenarios
- **Never assume a selector works** — if a step fails, record it precisely and continue where possible
- **Screenshots are mandatory** — capture at least one screenshot per scenario (final state or failure state)
- **ASCII wireframes are reference only** — use them as a visual guide to assess final state, not as pixel-perfect assertions
- **Credentials**: Use the following test accounts from the seeder. Do NOT ask the user for credentials — these are the known test accounts:

  | Role | Email | Password |
  |------|-------|----------|
  | Admin | admin@iglesia.cl | password123 |
  | Pastor | pastor@iglesia.cl | password123 |
  | Anciano | anciano@iglesia.cl | password123 |
  | Secretaria | secretaria@iglesia.cl | password123 |

  **Login flow**: Navigate to `/login`, fill email and password fields, click submit. After login, the app redirects to the dashboard. Use the appropriate role for each scenario (e.g., Admin for full access, Pastor for pastor-specific features).
- **Do NOT modify any application files** — this skill is read-only from the app's perspective
- **If design.md has scenarios but they reference routes that 404** — mark scenario as FAIL with note "Route not found: <url>"
