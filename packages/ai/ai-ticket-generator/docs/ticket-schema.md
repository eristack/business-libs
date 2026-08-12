---
title: Ticket schema
description: Fields, validation errors, and markdown shape
sidebar_position: 3
---

# Ticket schema

Both bug and suggestion tickets share identity fields, then diverge on kind-
specific sections. Generators validate before write.

## Shared identity

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | Stable file id / slug |
| `kind` | yes | `bug` \| `suggestion` |
| `package` | yes | Must be `@eristack/...` and match a subscribed package |
| `title` | yes | Short human title |
| `summary` | yes | One-paragraph problem / idea |
| `createdAt` | usually | ISO timestamp from generator |

## Bug-only

| Field | Purpose |
| --- | --- |
| `scenario` | What the user was doing |
| `reproSteps` | Ordered steps (do not invent) |
| `expected` / `actual` | Behavior delta |
| `logs` | Pasted facts only |
| `environment` | versions, runtime |
| `fixPlan` | Maintainer/agent starting plan |

Weak bugs (no repro, no fix plan) validate with **warnings** — treat as “not
ready to send.”

## Suggestion-only

| Field | Purpose |
| --- | --- |
| `motivation` | Why the change matters |
| `feasibility` | `possible` \| `partial` \| `unlikely` \| `needs-decision` |
| `implementationSketch` | Enough for an agent to start if allowed |
| `alternatives` | Optional other approaches |

Agents must not implement `unlikely` / `needs-decision` without a human.

## Markdown output

```text
---
kind: bug
package: @eristack/jwt-auth
title: …
---

## Summary
…

## Scenario
…

## Repro
…

## Logs
…

## Fix plan
…

## Agent handoff
1. Load skills …
2. Reproduce …
3. Fix …
4. Test …
```

Path default: `.eristack/tickets/<id>.md`.

## Validation

`validateTicket`:

- **Errors** block write (bad package prefix, empty title/summary, …)
- **Warnings** nudge completeness

CLI and Intent skills share the same validator.

## Subscription cross-check

`package` should exist in that package’s `ticket.yaml`. Feasibility for
suggestions is assessed against `scope` / `outOfScope`. See
[Subscription](./subscription.md).

## Next

- [Bug tickets](./bug-tickets.md)
- [Suggestion tickets](./suggestion-tickets.md)
- [Workflow](./workflow.md)
