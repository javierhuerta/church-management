---
description: Archive a completed change in the OpenSpec workflow
agent: planner
subtask: false
---

Archive a completed change in the OpenSpec workflow.

Load the `openspec-archive-change` skill and execute it with the change name (if provided as argument).

The skill handles:
1. Checking artifact completion status
2. Checking task completion status
3. Assessing delta spec sync state
4. Performing the archive (moving to `openspec/changes/archive/YYYY-MM-DD-<name>/`)
5. Displaying summary