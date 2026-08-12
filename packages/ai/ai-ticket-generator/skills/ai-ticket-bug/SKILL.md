---
name: ai-ticket-bug
description: >
  Generate a portable @eristack bug ticket (logs, scenario, repro, fix plan,
  agent handoff) as a markdown file the user can send to maintainers. Use when
  a consumer hits a package bug or wants a fixer-upper file for support.
metadata:
  type: core
  library: '@eristack/ai-ticket-generator'
  library_version: '0.0.0'
sources:
  - 'eristack/business-libs:packages/ai/ai-ticket-generator/docs/concepts.md'
  - 'eristack/business-libs:packages/ai/ai-ticket-generator/docs/bug-tickets.md'
---

# Bug tickets

## Goal

Produce **one markdown file** under `.eristack/tickets/` that a maintainer can
drop into an agent session and fix immediately.

## Required sections

1. Summary + package + version
2. Scenario (what the user was doing)
3. Steps to reproduce
4. Expected vs actual
5. Logs (paste or `@file`)
6. Suspects (files / APIs)
7. Fix plan (ordered)
8. Agent handoff checklist

## Workflow

1. Confirm which `@eristack/*` package owns the bug (check `ticket.yaml` scope).
2. Gather repro + logs from the user — do not invent stack traces.
3. Draft a concrete fix plan (tests first when possible).
4. Write the ticket:

```bash
pnpm eristack-ticket bug \
  --package @eristack/<name> \
  --title "…" \
  --summary "…" \
  --step "…" \
  --expected "…" \
  --actual "…" \
  --scenario "…" \
  --logs @./error.log \
  --fix-plan "…"
```

Or call `createBugTicket` + `writeTicketFile` from `@eristack/ai-ticket-generator`.

5. Tell the user the file path and that they can email/attach it to maintainers.
