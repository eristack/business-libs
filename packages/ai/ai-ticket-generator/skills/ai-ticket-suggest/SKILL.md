---
name: ai-ticket-suggest
description: >
  Turn a user feature idea into a portable @eristack suggestion ticket with
  feasibility (possible/partial/unlikely/needs-decision) and an implementation
  sketch for maintainers/agents. Use when a consumer proposes a change.
metadata:
  type: core
  library: '@eristack/ai-ticket-generator'
  library_version: '0.0.0'
sources:
  - 'eristack/business-libs:packages/ai/ai-ticket-generator/docs/concepts.md'
  - 'eristack/business-libs:packages/ai/ai-ticket-generator/docs/suggestion-tickets.md'
---

# Suggestion tickets

## Goal

Capture the idea **and** a first-pass feasibility gate so maintainers know
whether an agent should implement, wait, or decline.

## Feasibility

| Value | Meaning |
| --- | --- |
| `possible` | In-bounds; implement from the sketch |
| `partial` | Additive / adapter-scoped; confirm edges |
| `needs-decision` | Breaking or product call — wait |
| `unlikely` | Out of scope / core-boundary violation |

Use `assessFeasibility(input, loadSubscription(pkgDir))`.

## Workflow

1. Identify target `@eristack/*` package via scope in `ticket.yaml`.
2. Restate the user story + proposed behavior/API.
3. Run feasibility; explain the rationale to the user.
4. If `possible` / `partial`, write an implementation sketch (files, APIs, tests).
5. Emit the ticket file:

```bash
pnpm eristack-ticket suggest \
  --package @eristack/<name> \
  --title "…" \
  --summary "…" \
  --user-story "…" \
  --behavior "…" \
  --api "…" \
  --sketch "…"
```

6. Hand the path to the user for maintainer delivery. Do **not** implement when
   feasibility is `unlikely` or `needs-decision` unless a maintainer overrides.
