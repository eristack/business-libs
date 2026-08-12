---
title: Overview
description: Portable maintainer tickets for every @eristack package
sidebar_position: 1
---

# @eristack/ai-ticket-generator

When something breaks — or a consumer has an idea — the goal is the same: **capture everything an agent needs in one markdown file**, then hand that file to a maintainer. No portal required.

`@eristack/ai-ticket-generator` builds **bug** and **suggestion** tickets, validates them, writes `.eristack/tickets/<id>.md`, and enforces a mandatory `ticket.yaml` subscription on every publishable `@eristack/*` package (`pnpm ticket:check`).

## Flow

```text
User / agent
   │
   │  bug or suggestion (facts, not invented logs)
   ▼
@eristack/ai-ticket-generator
   │  create*Ticket → validate → writeTicketFile
   │  .eristack/tickets/<id>.md
   ▼
Maintainer ──► agent fixer-upper (load skills → reproduce → fix → test)
```

## Two ticket kinds

| Kind | Use when | Key sections |
| --- | --- | --- |
| **bug** | Something is broken | Repro, logs, scenario, fix plan |
| **suggestion** | Something should exist | Feasibility + implementation sketch |

## Mandatory subscription

Each `@eristack/*` package ships `ticket.yaml`. Without it, `pnpm ticket:check` fails. That file states scope, out-of-scope, skills to load, and maintainers. See [Subscription](./subscription.md).

## Surfaces

| Surface | Entry |
| --- | --- |
| Library | `createBugTicket` / `createSuggestionTicket` / `writeTicketFile` |
| CLI | `eristack-ticket bug \| suggest \| check \| subscribe` |
| Intent skills | `ai-ticket-bug`, `ai-ticket-suggest` |

## A minute of code

```ts
import {
  createBugTicket,
  validateTicket,
  writeTicketFile,
} from "@eristack/ai-ticket-generator";

const ticket = createBugTicket({
  package: "@eristack/jwt-auth",
  title: "Refresh reuse not revoked",
  summary: "Second use of an old refresh tip still issued tokens",
  stepsToReproduce: ["login", "refresh once", "reuse previous refresh"],
  expected: "RefreshTokenReuseError + family revoke",
  actual: "new access token issued",
  fixPlan: ["Add regression test", "Verify revokeFamily on reuse path"],
});

validateTicket(ticket);
writeTicketFile(process.cwd(), ticket);
```

## Where to go next

| Guide | Read it when |
| --- | --- |
| [Concepts](./concepts.md) | Portable files, draft vs send, feasibility |
| [Bug tickets](./bug-tickets.md) | CLI / library / Intent for bugs |
| [Suggestion tickets](./suggestion-tickets.md) | Feasibility gate |
| [Subscription](./subscription.md) | `ticket.yaml` + `ticket:check` |
| [Workflow](./workflow.md) | Agent handoff and fixer-upper loop |
| [Recipes](./recipes.md) | End-to-end patterns |
