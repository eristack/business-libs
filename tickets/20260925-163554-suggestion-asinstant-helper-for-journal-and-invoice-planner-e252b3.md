# Suggestion: asInstant helper for journal and invoice planners

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260925-163554-suggestion-asinstant-helper-for-journal-and-invoice-planner-e252b3`
- **kind:** suggestion
- **package:** `@eristack/timestamp`
- **feasibility:** `possible`
- **created:** 2026-09-25T16:35:54.814Z
- **reporter:** household

## Summary

One function that turns TimestampJSON (wall or instant) into a ZonedInstant so consumers stop calling instantOf on wall local.

## User story

As a ledger author I want to persist posted_at as instantField while the UI sends a wall value date, without guessing which constructor to call.

## Proposed behavior

asInstant accepts TimestampJSON, a typed Timestamp, or undefined. Wall becomes wallToInstantOnce. Instant becomes instantOf. Missing uses now(timezone).

## Proposed API

asInstant(input: TimestampJSON | Timestamp | undefined, timezone: string): ZonedInstant

## Feasibility rationale

In-bounds for asInstant helper for journal and invoice planners; proceed with a concrete implementation sketch.

## Implementation sketch

- Add asInstant next to parseTimestamp in core
- Tests: wall Asia/Jakarta noon → 2026-09-24T05:00:00Z; instant Z passthrough; undefined → now
- Docs: recipes.md user-picked date recipe should lead with asInstant; skill first code block

## Risks

_None yet._

## Alternatives

_None yet._

## Agent handoff

1. Load Intent skills for `@eristack/timestamp`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

_None yet._
