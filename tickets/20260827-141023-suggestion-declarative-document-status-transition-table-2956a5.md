# Suggestion: Declarative document status transition table

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260827-141023-suggestion-declarative-document-status-transition-table-2956a5`
- **kind:** suggestion
- **package:** `@eristack/pbac`
- **feasibility:** `possible`
- **created:** 2026-08-27T14:10:23.264Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

Tiga Sekawan job/cost-sheet/invoice statuses are tables of from-command-to. PBAC has documents.statusIn for a single allowed set. A transitions({ draft: ['submit'], submitted: ['approve','reject'] }) helper would encode illegal jumps once instead of a policy per command.

## User story

As a document ERP I want one transition map shared by PBAC authorize and UI button enablement.

## Proposed behavior

documents.transition({ field, command, table }) allows iff table[current].includes(command). Deny message names the illegal jump.

## Proposed API

documents.transitions(field, table: Record<string, string[]>); evaluate(doc, { command })

## Feasibility rationale

In-bounds for Declarative document status transition table; proceed with a concrete implementation sketch.

## Implementation sketch

- Add next to documents.statusIn in pbac-core
- Do not invent a full workflow engine or persistence

## Risks

- Commands are strings; do not import HTTP verbs.
- Parallel PBAC policies (cost sheet approved before invoice.issue) still exist — transitions are not the only gate.

## Alternatives

- One statusIn policy per command (current PO: poEdit/poSubmit/poApprove). Fine for 3 states; painful for job+sheet+invoice tables in IMPLEMENTATION §9.

## Agent handoff

1. Load Intent skills for `@eristack/pbac`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

IMPLEMENTATION §9.2–9.4 transition tables. Sprints sea-job (submit) and invoices (issue/void/close).

### Consumer evidence (Tiga Sekawan)

Job: draft→open→completed→closed, cancel from draft/open.
Cost sheet: draft→submitted→approved→closed, reject submitted→draft.
Invoice: draft→issued→partially_paid→paid, void from draft/issued unpaid.

`partially_paid` is domain-computed from outstanding, not a user command — transition helper should allow derived statuses or document that some statuses are not commands.

PO Backseat already uses documents.statusIn. Jobs will multiply policies unless we get a table helper.

### Sibling tickets (2026-08-27 batch)

See `.eristack/tickets/20260827-index-tiga-sekawan-horizon-a-eristack-gaps.md`.
