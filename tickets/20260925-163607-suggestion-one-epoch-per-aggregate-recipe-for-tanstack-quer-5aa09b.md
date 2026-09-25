# Suggestion: One-epoch-per-aggregate recipe for TanStack Query

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260925-163607-suggestion-one-epoch-per-aggregate-recipe-for-tanstack-quer-5aa09b`
- **kind:** suggestion
- **package:** `@eristack/epoch`
- **feasibility:** `partial`
- **created:** 2026-09-25T16:36:07.598Z
- **reporter:** household

## Summary

Consumers bump household.accounts and household.transactions on every create. Need a recipe: one epoch per aggregate, bump on write, client invalidates Query keys. Do not add a React Query adapter.

## User story

As a Query app I want to know when to bump epoch vs invalidate query keys without a new hook package.

## Proposed behavior

Docs show epoch keys per aggregate and a client invalidation list. No useEpochQuery.

## Proposed API

Docs only; existing bump / current

## Feasibility rationale

Likely doable as an additive / adapter-scoped change.

## Implementation sketch

- Add recipe to epoch-core or ai-knowledge stack-defaults

## Risks

_None yet._

## Alternatives

_None yet._

## Agent handoff

1. Load Intent skills for `@eristack/epoch`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

_None yet._
