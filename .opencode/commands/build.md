---
description: Implement tasks from an OpenSpec change using the builder agent with skill-aware execution
agent: builder
subtask: true
---

Implement tasks from an OpenSpec change.

**IMPORTANT: Before writing any code, load the appropriate skills:**
- If tasks touch `frontend/src/` → load skill `church-ui-design` FIRST
- If tasks touch `backend/src/modules/` → load skill `nestjs-best-practices` FIRST
- If tasks touch both → load BOTH skills before starting
- If creating forms → also load `react-hook-form`
- If creating UI components → also load `shadcn`

**Input**: Optionally specify a change name (e.g., `/build add-auth`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context if the user mentioned a change
   - Auto-select if only one active change exists
   - If ambiguous, run `openspec list --json` to get available changes and use the **AskUserQuestion tool** to let the user select

   Always announce: "Using change: <name>"

2. **Check status to understand the schema**
   ```bash
   openspec status --change "<name>" --json
   ```
   Parse the JSON to understand:
   - `schemaName`: The workflow being used
   - Which artifact contains the tasks

3. **Get apply instructions**

   ```bash
   openspec instructions apply --change "<name>" --json
   ```

4. **Read context files**

   Read every file path listed under `contextFiles` from the apply instructions output.

5. **Load skills based on scope**

   Scan the tasks and determine which files will be modified:
   - Frontend files → load `church-ui-design`
   - Backend files → load `nestjs-best-practices`
   - FormBuilder → load `react-hook-form`
   - Both → load all relevant skills

6. **Show current progress and skill loading**

   Display:
   - Schema being used
   - Progress: "N/M tasks complete"
   - Skills loaded (or about to load)
   - Remaining tasks overview

7. **Implement tasks (loop until done or blocked)**

   For each pending task:
   - Show which task is being worked on
   - Make the code changes required
   - Keep changes minimal and focused
   - Mark task complete in the tasks file: `- [ ]` → `- [x]`
   - Continue to next task

8. **On completion or pause, show status**

   Display:
   - Tasks completed this session
   - Overall progress: "N/M tasks complete"
   - If all done: suggest `/test <name>` then `/check <name>`
   - If paused: explain why and wait for guidance

**Guardrails**
- Keep going through tasks until done or blocked
- Always read context files before starting
- Always load skills BEFORE writing code
- If task is ambiguous, pause and ask before implementing
- Keep code changes minimal and scoped to each task
- Update task checkbox immediately after completing each task
- Pause on errors, blockers, or unclear requirements