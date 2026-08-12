---
name: ai-workflow-mcp
description: >
  Install and use the eristack-workflow MCP server alongside existing MCP tools.
  Covers Cursor/Claude config, tool inventory, and when to search vs read_chunk.
  Use when wiring @eristack/ai-workflow into a consumer project.
metadata:
  type: core
  library: '@eristack/ai-workflow'
  library_version: '0.1.0'
sources:
  - 'eristack/business-libs:packages/ai-workflow/docs/mcp.md'
---

# AI workflow MCP

## Install (additive)

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

Do **not** remove other MCP servers to add this one.

## Tool order

1. `workflow_status` (init if missing)
2. `index_reindex` when code changed materially
3. `search` → `read_chunk` for implementation
4. `sprint_*` / `task_*` / `adr_create` / `sprint_summarize` for cadence
