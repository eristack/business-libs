# Suggestion: Ledger-first architecture recipe and recommend() routes

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260925-163607-suggestion-ledger-first-architecture-recipe-and-recommend-r-63d850`
- **kind:** suggestion
- **package:** `@eristack/ai-knowledge`
- **feasibility:** `partial`
- **created:** 2026-09-25T16:36:07.042Z
- **reporter:** household

## Summary

recommend() knows invoices/login, not household ledger or cashbook. Add a second spine: chart headers → masters create posting leaves → journal intents → buildBalancedPostingPair → hash chain. Documents optional.

## User story

As an agent briefing a cashbook I want recommend(['household ledger','journals']) to route to financial-ledger + timestamp + money + fiscal-calendar, not qups.

## Proposed behavior

Recipes household-ledger, cashbook, multi-currency-reports. Skill says do not start from qups. Guided COA, instrument kinds, satellite P&L leaves, journal intents, value-date asInstant, Express 5 dispatch, portaled popovers.

## Proposed API

recommend(['household ledger']); loadPlan; new knowledge/*.md + recipes.yaml entries

## Feasibility rationale

Likely doable as an additive / adapter-scoped change.

## Implementation sketch

- Add knowledge/ledger-first.md and recipes.yaml keys
- Wire recommend() aliases: household-ledger, cashbook, multi-currency-reports
- Cross-link timestamp asInstant and rest Express 5
- State journal-intents and master-graph stay recipes until a second consumer

## Risks

_None yet._

## Alternatives

_None yet._

## Agent handoff

1. Load Intent skills for `@eristack/ai-knowledge`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

_None yet._
