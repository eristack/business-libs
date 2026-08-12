# @eristack/ai-workflow

Local-first AI workflow for Eristack projects: installable **MCP server**, FTS + on-device vector index, and sprint/backlog/ADR folders.

Designed so agents stay effective with **low token usage** — compact search hits and short workflow JSON — without replacing Cursor, TanStack Intent, git, or `@eristack/ai-knowledge`.

## Install

```bash
pnpm add -D @eristack/ai-workflow
pnpm eristack-workflow init
pnpm eristack-workflow index
```

## CLI

```bash
pnpm eristack-workflow status
pnpm eristack-workflow search "refresh token rotation"
pnpm eristack-workflow sprint create --title "Auth sessions"
pnpm eristack-workflow sprint summarize
```

## MCP (Cursor / Claude / VS Code)

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

Additive only — keep your existing MCP servers and Intent skills.

## Project layout

```text
.eristack/
  workflow/
    config.json
    backlog/items.yaml
    sprints/<date>-<slug>/
      plan.md
      tasks.yaml
      adr/
      summary.md
  index/workflow.sqlite   # gitignored
```

## Token discipline

- Search: max 8 hits, ≤3-line snippets
- Workflow tools: ids/status/paths — read markdown files when you need prose
- Use `read_chunk` for bounded file slices after search

## With Eristack knowledge

```bash
pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#architecture-recommend
pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#recommend-eristack
pnpm dlx @tanstack/intent@latest load @eristack/ai-workflow#ai-workflow-core
```

## Docs

See [`docs/`](./docs/).
