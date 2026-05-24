---
description: Review code implementation against project skills and best practices
agent: reviewer
subtask: true
---

Review the code implementation of the active change for skill compliance, conventions, and best practices.

This is a standalone code review that can be run at any time. It loads the appropriate skills based on the files changed and generates a structured report.

**Input**: Optionally specify a change name (e.g., `/review add-auth`). If omitted, review the most recently modified files or prompt for selection.

**Steps**

1. **Identify scope**

   If a change name is provided, run:
   ```bash
   openspec status --change "<name>" --json
   ```
   
   Read the tasks and identify implementation files.

   If no change name provided, use `git diff --name-only HEAD~5` to find recently modified files.

2. **Load skills based on scope**

   Scan files to determine scope:
   - `.tsx`/`.css` in `frontend/src/` → load `church-ui-design`, then `vercel-react-best-practices`, `tailwind-v4-shadcn`
   - `.ts` in `backend/src/modules/` → load `nestjs-best-practices`
   - Both → load all relevant

3. **Generate review report**

   Produce a structured report with:
   - **Skills Compliance**: Does the code follow the design system? NestJS patterns?
   - **Conventions**: AGENTS.md rules followed? Naming? Error handling?
   - **Type Safety**: No `any` types? Proper generics?
   - **Security**: No exposed secrets? Proper auth guards?
   - **Performance**: N+1 queries? Missing memoization? Bundle size concerns?

4. **Show actionable report**

   ```
   ## Review: <change-name or "recent changes">

   ### Skills Compliance
   - [PASS/WARN/FAIL] church-ui-design: <details>
   - [PASS/WARN/FAIL] nestjs-best-practices: <details>

   ### Conventions Violations
   1. file:line — violation

   ### Verdict
   PASS / WARN / FAIL
   ```

   Recommend next steps:
   - PASS → proceed to `/check` or `/qa`
   - WARN → fix issues, then proceed
   - FAIL → must fix before continuing