---
description: Verify implementation matches change artifacts before archiving
agent: reviewer
subtask: true
---

Verify that an implementation matches the change artifacts (specs, tasks, design) and project best practices.

**Input**: Optionally specify a change name after `/check` (e.g., `/check add-auth`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **If no change name provided, prompt for selection**

   Run `openspec list --json` to get available changes. Use the **AskUserQuestion tool** to let the user select.

2. **Check status to understand the schema**
   ```bash
   openspec status --change "<name>" --json
   ```

3. **Get the change directory and load artifacts**

   ```bash
   openspec instructions apply --change "<name>" --json
   ```

   Read all available artifacts from `contextFiles`.

4. **Determine scope and load skills**

   Scan the implementation files to determine scope:
   - Frontend files → load skill `church-ui-design`, then `vercel-react-best-practices`
   - Backend files → load skill `nestjs-best-practices`
   - Both → load all relevant skills
   - TypeScript types → load `typescript-advanced-types`

   **CRITICAL**: Load skills BEFORE reviewing. Never skip this step.

5. **Verify Completeness**

   - If `contextFiles.tasks` exists, read every file path in it
   - Parse checkboxes: `- [ ]` (incomplete) vs `- [x]` (complete)
   - Count complete vs total tasks
   - If incomplete tasks exist: add CRITICAL issue for each

   - If delta specs exist: check if requirements are implemented in code
   - If requirements appear unimplemented: add CRITICAL issue

6. **Verify Skill Compliance**

   Based on loaded skills, verify:
   
   **Frontend (church-ui-design)**:
   - Colors: semantic classes vs inline styles used correctly
   - Typography: no `<h1>`-`<h3>` tags, uses `<p>` with classes/styles
   - Mobile/desktop split present for data-display components
   - Dark mode: `resolvedTheme === 'dark'` for brand colors
   - Borders/shadows: only `rounded-lg`/`rounded-xl`, `shadow-sm`/`hover:shadow-md`
   
   **Backend (nestjs-best-practices)**:
   - `@JoinColumn({ name: '...' })` on every `@ManyToOne` with FK column
   - DTOs with `class-validator` and `@ApiProperty` decorators
   - Controllers with OpenAPI decorators
   - Custom error classes, no throw strings
   - Independent modules per capability

7. **Verify Code Pattern Consistency**

   - File naming: kebab-case
   - Class naming: PascalCase
   - Variable naming: camelCase
   - No `any` types
   - No plain CSS files

8. **Check Test Coverage**

   - For each service with business logic, verify `.spec.ts` exists
   - If tests are missing, add WARNING

9. **Generate Verification Report**

   ```
   ## Check Report: <change-name>

   ### Summary
   | Dimension    | Status |
   |--------------|--------|
   | Completeness | X/Y tasks, N reqs |
   | Correctness  | M/N reqs covered |
   | Skills Compliance | Followed/Issues |
   | Test Coverage | Y modules tested / Z modules total |

   ### CRITICAL (Must fix before /done)
   1. <issue>

   ### WARNINGS (Should fix)
   1. <issue>

   ### SUGGESTIONS (Nice to fix)
   1. <issue>

   ### Verdict
   PASS / WARN / FAIL
   ```

**Guardrails**
- Load skills BEFORE reviewing — always
- Be specific: cite file:line for every issue
- Prefer WARN over FAIL for style issues
- Reserve FAIL for architectural violations and security issues
- This is read-only analysis — never modify files