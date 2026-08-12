# AI ticket generator

## Problem

Consumers hit bugs or have ideas, but maintainers get incomplete chat threads.
Agents on the maintainer side need a single portable file: scenario, logs,
repro, fix plan / feasibility, handoff checklist.

## Decisions

- **Markdown files**, not a hosted tracker — email/Slack attachable.
- **Mandatory `ticket.yaml`** on every `@eristack/*` package (scope, skills, maintainers). Enforced by `pnpm ticket:check`.
- Two kinds: **bug** and **suggestion** (with `assessFeasibility`).
- Default output: `.eristack/tickets/<id>.md`.
- Intent skills: `ai-ticket-bug`, `ai-ticket-suggest`.

## Public API

- `createBugTicket` / `createSuggestionTicket`
- `assessFeasibility` / `validateTicket` / `renderTicketMarkdown` / `writeTicketFile`
- `checkSubscriptions` / `loadSubscription` / `writeSubscription`
- CLI: `eristack-ticket check|subscribe|bug|suggest|render`

## Follow-ups

Promote this note into package docs (already drafted under `docs/`) and delete this folder when the user marks work finished.
