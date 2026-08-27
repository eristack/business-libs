---
title: AI toolbox decision tree
description: When to use ai-dev vs ai-knowledge vs ai-workflow vs ai-ticket-generator
sidebar_position: 8
---

# AI toolbox — which meta package?

Short decision tree for `@eristack/ai-dev`, `@eristack/ai-knowledge`, `@eristack/ai-workflow`, and `@eristack/ai-ticket-generator`. Load `@eristack/ai-knowledge#ai-toolbox` for prompts and checklists.

```text
Start here
    │
    ├─ "What @eristack package for invoices / login / FIFO?"
    │       → @eristack/ai-knowledge (recommend / loadPlan / recipes)
    │
    ├─ "Run CI checks / sync catalog / plan next command"
    │       → @eristack/ai-dev (pnpm eristack plan --json, check, sync)
    │
    ├─ "Remember sprint context / search backlog in this repo"
    │       → @eristack/ai-workflow (local MCP, FTS index — optional)
    │
    └─ "File a bug or feature request for maintainers"
            → @eristack/ai-ticket-generator (portable .md ticket + ticket.yaml)
```

---

## `@eristack/ai-knowledge`

**Use when:** routing product language to packages, loading canonical cross-cutting guides, authoring recipes.

| Ask | Load |
| --- | --- |
| Build login / money / doc numbers | `#recommend-eristack` |
| Horizon A Backseat mock → real API | `#backseat-then-backend` |
| Job + cost sheet + lines | `#document-lines-erp` |
| PATCH version / 409 errors | `#optimistic-document-version`, `#http-errors` |
| Upgrade deps / Backseat peers | `#upgrading-eristack` |
| Stack defaults (Drizzle, Express) | `#stack-defaults`, `#architecture-recommend` |

**Does not:** run CI, store sprint notes, or generate support tickets.

---

## `@eristack/ai-dev`

**Use when:** you need the unified `eristack` CLI in the monorepo or consumer CI.

```bash
pnpm eristack plan --json      # token-minimal next steps
pnpm eristack check --profile pr
pnpm eristack sync knowledge   # after recipes/skills edits
pnpm eristack sync docs
```

**Does not:** replace package skills or recommend() for feature routing.

---

## `@eristack/ai-workflow`

**Use when:** long-running **in-repo** memory — backlog, sprints, ADRs, chunked search via MCP.

**Skip when:** you only need a one-shot bug handoff (use ai-ticket-generator) or package routing (use ai-knowledge).

---

## `@eristack/ai-ticket-generator`

**Use when:** consumer hits a package bug or proposes a feature for **maintainers outside the session**.

```bash
pnpm dlx @tanstack/intent@latest load @eristack/ai-ticket-generator#ai-ticket-bug
pnpm dlx @tanstack/intent@latest load @eristack/ai-ticket-generator#ai-ticket-suggest
pnpm ticket:check   # every publishable package needs ticket.yaml
```

**Does not:** implement fixes automatically or replace GitHub Issues if your org uses them.

---

## Typical agent session

1. `pnpm eristack plan --json` (ai-dev) — optional in monorepo
2. `recommend()` / `#recommend-eristack` (ai-knowledge)
3. Load **one** canonical guide for the task (≤3 files total)
4. Load package skills (`jwt-auth-core`, `qups-line`, …)
5. On maintainer-bound bugs → ai-ticket-generator; on sprint memory → ai-workflow

See [agent-workflow](./agent-workflow.md) for design targets and docs sync rules.
