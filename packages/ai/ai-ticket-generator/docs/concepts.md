---
title: Concepts
description: Portable files, feasibility gates, and agent handoff
sidebar_position: 2
---

# Concepts

Four ideas keep the support loop honest: tickets are files, generators draft but humans send, feasibility is a gate, and subscription is the contract.

## Portable over portals

Tickets are **markdown files**, not a hosted issue tracker. Anyone can email, Slack, or attach them. Maintainers paste the file into an agent session and work. The rendered markdown includes an **Agent handoff** section with load → reproduce → fix → test steps.

Default path:

```text
.eristack/tickets/<id>.md
```

## Draft vs send

Generators (CLI or Intent skills) should:

1. Collect facts from the user (**do not invent** stack traces or versions).
2. Structure them into the ticket schema.
3. `validateTicket` (errors block; warnings nudge completeness).
4. `writeTicketFile` → `.eristack/tickets/<id>.md`.
5. Tell the user the path — **they** decide when to send it.

Agents must not auto-email maintainers unless the user asks.

## Feasibility is a gate, not a veto forever

`assessFeasibility` is a **first pass** against `ticket.yaml` scope / out-of-scope and a few core-boundary heuristics. Maintainers can override. Agents must **not** implement `unlikely` / `needs-decision` tickets unless a human says so.

| Value | Agent should |
| --- | --- |
| `possible` | Implement from the sketch |
| `partial` | Implement carefully / confirm edges |
| `needs-decision` | Wait for maintainer |
| `unlikely` | Decline or redirect |

## Subscription is the contract

`ticket.yaml` is how a package opts into (and stays in) the support loop:

- `scope` / `outOfScope` steer feasibility
- `skills` tell fixer agents what to load
- `maintainers` show who receives files
- `package` must match `package.json` `name`

CI runs `pnpm ticket:check` so new packages cannot skip the loop. Details in [Subscription](./subscription.md).

## Validation

`validateTicket` enforces hard errors (package prefix, title, summary, id) and emits warnings for weak bugs (no repro steps, no fix plan) or weak suggestions (no feasibility / sketch). Treat warnings as “not ready to send” unless the reporter consciously omits them.

## Library vs CLI vs Intent

| Path | Best for |
| --- | --- |
| Library API | Embedding in tools / custom agents |
| CLI | Humans and scripts in a repo |
| Intent skills | Coding agents mid-conversation |

All three produce the same markdown shape.

## Next steps

- [Bug tickets](./bug-tickets.md) / [Suggestion tickets](./suggestion-tickets.md)
- [Workflow](./workflow.md) — fixer-upper loop
- [Recipes](./recipes.md)
