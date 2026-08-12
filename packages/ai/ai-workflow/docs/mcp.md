---
title: MCP
description: Install the eristack-workflow server and use its tools
sidebar_position: 4
---

# MCP

Additive only — keep Cursor/Claude/VS Code MCP servers and Intent skills you already use.

## Install (Cursor example)

```json
{
  "mcpServers": {
    "eristack-workflow": {
      "command": "pnpm",
      "args": ["exec", "eristack-workflow-mcp"],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

Bin: `eristack-workflow-mcp`. Override project root with `ERISTACK_WORKFLOW_CWD`.

## Tools

| Tool | Args | Returns (compact) |
| --- | --- | --- |
| `workflow_status` | — | active sprint, index stats, recent sprints |
| `workflow_init` | — | create `.eristack/workflow` if missing |
| `index_reindex` | `embed?: boolean` | reindex counts |
| `search` | `query`, `limit?` (1–8) | ≤8 hits, ≤3-line snippets |
| `read_chunk` | `path`, `startLine?`, `endLine?`, `maxLines?` (≤120) | bounded file slice (default ≤80 lines) |
| `backlog_list` | — | id, title, status, priority |
| `backlog_upsert` | `title`, `id?`, `priority?`, `status?`, `notes?` | id + status |
| `sprint_list` | — | id, title |
| `sprint_create` | `title`, `activate?` (default true) | sprint paths |
| `sprint_get` | `id?` (default active) | metadata + task counts + paths |
| `task_list` | `sprintId?` | id, title, status |
| `task_upsert` | `title`, `sprintId?`, `id?`, `status?`, `owner?` | id, status |
| `adr_create` | `title`, `sprintId?` | ADR path |
| `sprint_summarize` | `sprintId?` | `summary.md` path + outline |

### Status enums

- Backlog: `open` \| `in_progress` \| `done` \| `dropped`
- Tasks: `todo` \| `doing` \| `done` \| `blocked`

## Resource

| URI | Content |
| --- | --- |
| `eristack-workflow://sprint/active/plan` | Active sprint `plan.md` (or “no active sprint”) |

## Practice

1. `workflow_status`  
2. `search` for the topic  
3. `read_chunk` on the best hit  
4. `task_upsert` / `adr_create` as you decide  

Do not paste entire repositories into the model context when these tools suffice.
