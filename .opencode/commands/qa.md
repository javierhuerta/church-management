---
description: Run QA validation for a change using Playwright
agent: reviewer
subtask: true
---

Run QA validation for a change using Playwright MCP.

Navigates to the UI Scenarios documented in `design.md`, executes interaction steps, and generates a QA report with screenshots and a final verdict.

**Usage**:
- `/qa` — prompts to select a change
- `/qa <name>` — runs QA directly for the given change name

**When to run**: After `/check` passes and before `/done`. Use this to confirm the UI works as intended from the user's perspective.

**Requirements**:
- Frontend running at `http://localhost:5173`
- Backend running at `http://localhost:3000`
- `## UI Scenarios` section documented in the change's `design.md`

---

Load the `qa-change` skill and execute it with the change name (if provided as argument to this command).