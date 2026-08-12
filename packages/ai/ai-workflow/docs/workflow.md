---
title: Sprint workflow
description: Backlog, sprints, tasks, ADRs, summary
sidebar_position: 5
---

# Sprint workflow

```text
.eristack/workflow/
  backlog/items.yaml
  sprints/YYYY-MM-DD-slug/
    plan.md
    tasks.yaml
    adr/ADR-NNNN-*.md
    summary.md
```

Typical cadence:

1. `backlog_upsert` ideas
2. `sprint_create` for the slice you are shipping
3. Keep `tasks.yaml` current (`task_upsert`)
4. `adr_create` for durable decisions
5. `sprint_summarize` when closing

Agents should prefer tool JSON for status, then open the markdown files for prose — not the reverse.
