---
title: MCP install
description: Wire eristack-workflow-mcp into Cursor or Claude without removing existing servers
sidebar_position: 3
---

# MCP install

Add alongside your existing MCP servers:

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

Optional: `ERISTACK_WORKFLOW_CWD` overrides the project root.

## Tools (compact)

| Tool | Use |
| --- | --- |
| `workflow_init` / `workflow_status` | Bootstrap / status |
| `index_reindex` / `search` / `read_chunk` | Index + hybrid search |
| `backlog_*` / `sprint_*` / `task_*` / `adr_create` / `sprint_summarize` | Workflow |

Search never dumps whole files. Call `read_chunk` only for the hit you need.
