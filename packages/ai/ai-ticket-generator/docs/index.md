---
title: Overview
description: Portable maintainer tickets for every @eristack package
sidebar_position: 1
---

# AI Ticket Generator

When something goes wrong — or a consumer has an idea — the goal is the same:
**capture everything an agent needs in one file**, then hand that file to a
maintainer.

```text
User / agent
   │
   │  bug or suggestion
   ▼
@eristack/ai-ticket-generator
   │
   │  .eristack/tickets/<id>.md
   ▼
Maintainer ──► agent fixer-upper
```

## Two ticket kinds

| Kind | Use when | Key sections |
| --- | --- | --- |
| **bug** | Something is broken | Repro, logs, scenario, fix plan |
| **suggestion** | Something should exist | Feasibility + implementation sketch |

## Mandatory for every package

Each `@eristack/*` package ships a `ticket.yaml` subscription. Without it,
`pnpm ticket:check` fails. That file tells generators the package scope, skills
to load, and who owns triage.
