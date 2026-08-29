---
title: Getting started
description: init, index, search, and your first sprint
sidebar_position: 3
---

# Getting started

## Install

```bash
pnpm add -D @eristack/ai-workflow
pnpm eristack-workflow init
pnpm eristack-workflow index
```

`index` may download an on-device embedding model on first embed run. For CI or offline:

```bash
pnpm eristack-workflow index --no-embed
```

## First search

```bash
pnpm eristack-workflow search "refresh token rotation"
```

Expect ≤8 compact hits. Follow up by opening paths or using MCP `read_chunk`.

Pair with **`pnpm eristack plan --json`** (`@eristack/ai-dev`) when you know which files changed — workflow search finds prose; `plan` returns checks, skills, and `nextBrainstormItem`.

## First sprint

```bash
pnpm eristack-workflow sprint create --title "Auth sessions"
pnpm eristack-workflow status
pnpm eristack-workflow sprint summarize
```

This creates `.eristack/workflow/sprints/<date>-auth-sessions/` with `plan.md`, `tasks.yaml`, `adr/`, and `summary.md`.

## MCP (optional)

Add the server beside your existing MCP config — see [MCP](./mcp.md). Set `ERISTACK_WORKFLOW_CWD` if the server process cwd is not the repo root.

## Next

- [Search & index](./search.md)
- [Sprint workflow](./workflow.md)
- [Recipes](./recipes.md)
