---
description: Propose a new change - create it and generate all artifacts using the planner agent
agent: planner
subtask: true
---

Load the `openspec-propose` skill and execute it with the change name (if provided as argument).

After the skill execution completes, show:
- Change name and location
- List of artifacts created with brief descriptions
- What's ready: "All artifacts created! Ready for implementation."
- Prompt: "Run `/build` to start implementing."