# Suggestion: Catalog note: skip data-grid on tiny household registers

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260925-163614-suggestion-catalog-note-skip-data-grid-on-tiny-household-re-3812f9`
- **kind:** suggestion
- **package:** `@eristack/data-grid`
- **feasibility:** `possible`
- **created:** 2026-09-25T16:36:14.052Z
- **reporter:** household

## Summary

Agents over-reach and put data-grid on a 20-row journal. Catalog and skill should say when not to use it.

## User story

As an agent I want recommend() / data-grid-core to tell me a small register is just Query + a table.

## Proposed behavior

Skill and catalog include a do-not: household register, 20-row category board.

## Proposed API

Docs only

## Feasibility rationale

In-bounds for Catalog note: skip data-grid on tiny household registers; proceed with a concrete implementation sketch.

## Implementation sketch

- Add a Do not section to data-grid-core SKILL.md and catalog blurb

## Risks

_None yet._

## Alternatives

_None yet._

## Agent handoff

1. Load Intent skills for `@eristack/data-grid`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

_None yet._
