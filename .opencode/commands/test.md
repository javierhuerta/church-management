---
description: Generate tests for the active OpenSpec change using the tester agent
agent: tester
subtask: true
---

Generate unit/integration tests for the functionality implemented in the active OpenSpec change.

**Input**: Optionally specify a change name (e.g., `/test add-auth`). If omitted, check if it can be inferred from conversation context.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context
   - Auto-select if only one active change exists
   - If ambiguous, run `openspec list --json` to let the user select

   Always announce: "Testing change: <name>"

2. **Check status and read tasks**

   ```bash
   openspec status --change "<name>" --json
   openspec instructions apply --change "<name>" --json
   ```

   Read the tasks file to understand what was implemented.

3. **Identify implementation files**

   From the completed tasks, identify which files were created or modified:
   - Backend: look in `backend/src/modules/<module>/`
   - Frontend: look in `frontend/src/features/<feature>/` or `frontend/src/components/`

4. **Find reference test patterns**

   For each module being tested:
   - Search for existing `.spec.ts` files in the same directory
   - Use the project's mock repository pattern (`createMockRepo<T>()`, `TestingModule`, factory functions)
   - For frontend: check if `vitest.config.ts` exists; if not, set it up first

5. **Generate tests**

   For each service/component with business logic:
   
   **Backend (.spec.ts)**:
   - Create mock repositories following the `createMockRepo` pattern
   - Test happy path: valid inputs → expected outputs
   - Test permission guards: each role → ForbiddenException or access
   - Test validation: invalid inputs → BadRequestException/NotFoundException
   - Test edge cases: null values, empty arrays, boundary conditions
   - Test audit logging where applicable
   - Use `it.each()` for role-based access control tests
   
   **Frontend (.test.ts or .spec.ts)**:
   - Set up Vitest + React Testing Library if not configured
   - Test rendering: component renders without crashing
   - Test interactions: button clicks, form submissions
   - Test loading/error states
   - Mock API calls with React Query wrappers

6. **Run tests**

   ```bash
   cd backend && npm test -- --testPathPattern="<module>"
   ```
   
   If tests fail, report the failures but do NOT modify implementation code.

7. **Report results**

   Show:
   - Test files created
   - Number of test cases generated
   - Test run results (pass/fail counts)
   - Any failures that reveal bugs in the implementation (report, don't fix)

**Guardrails**
- ALWAYS find an existing test file in the same module to match its pattern
- Do NOT modify implementation files — ONLY write test files
- Do NOT change source code to make tests pass
- Use descriptive test names: `it('rejects unauthorized roles with ForbiddenException')`
- Test ALL roles for permission-gated methods
- If no test infrastructure exists in frontend, create it first (vitest.config.ts, setup file)