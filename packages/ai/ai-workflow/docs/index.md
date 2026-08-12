---
title: Introduction
description: Local MCP, FTS+vector search, and sprint workflow — low token, additive
sidebar_position: 1
---

# @eristack/ai-workflow

Local-first project memory for agents: an installable **MCP server**, hybrid **FTS + on-device vector** search, and **sprint / backlog / ADR** folders under `.eristack/workflow`.

It is designed so agents stay effective with **low token usage** — compact search hits and short workflow JSON — without replacing Cursor, TanStack Intent, git, or [`@eristack/ai-knowledge`](/docs/ai-knowledge).

## What it is

- MCP tools for status, search, backlog, sprints, tasks, ADRs
- SQLite index (gitignored) with FTS5 and optional MiniLM embeddings
- File templates for plans, tasks, ADRs, summaries
- CLI + `createWorkflowClient` for scripts

## What it is not

| Not this | Use instead |
| --- | --- |
| Package API router | [`@eristack/ai-knowledge`](/docs/ai-knowledge) |
| Source of truth for code | git |
| Replacement for Intent skills | `pnpm dlx @tanstack/intent@latest load …` |
| Cloud-hosted memory | Everything is local to the repo |

## Token discipline

- Search: **max 8 hits**, **≤3-line** snippets (path + lines + score)
- Workflow tools return **ids / status / paths** — not full markdown bodies
- Use `read_chunk` after search when you need bounded file text

## Layout

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

## Next steps

| Guide | When |
| --- | --- |
| [Concepts](./concepts.md) | Boundaries vs Intent / knowledge / git |
| [Getting started](./getting-started.md) | init → index → search → sprint |
| [MCP](./mcp.md) | Tool reference + install |
| [Search & index](./search.md) | FTS, embeddings, CI |
| [Sprint workflow](./workflow.md) | Backlog, tasks, ADR, summarize |
| [CLI & client](./cli-and-client.md) | Commands + `createWorkflowClient` |
| [Recipes](./recipes.md) | Agent loops and closeout |
