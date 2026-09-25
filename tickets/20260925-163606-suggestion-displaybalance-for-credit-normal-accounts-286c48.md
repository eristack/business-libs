# Suggestion: displayBalance for credit-normal accounts

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260925-163606-suggestion-displaybalance-for-credit-normal-accounts-286c48`
- **kind:** suggestion
- **package:** `@eristack/financial-ledger`
- **feasibility:** `possible`
- **created:** 2026-09-25T16:36:06.438Z
- **reporter:** household

## Summary

Ledger streams are debit-positive. Household and GL UIs flip credit-normal types. Every consumer writes displayBalance(raw, accountType). Canon helper so agents stop flipping the wrong side.

## User story

As a ledger UI I want signed display balances from debit-positive snapshots without inventing negate rules.

## Proposed behavior

displayBalance(raw, type) returns raw for asset/expense and negated for liability/equity/income. signedBalances(pairs, chart) applies it after trialBalance.

## Proposed API

displayBalance(raw: Money, type: 'asset'|'liability'|'equity'|'income'|'expense'): Money; signedBalances?(fin, pairs, chart)

## Feasibility rationale

In-bounds for displayBalance for credit-normal accounts; proceed with a concrete implementation sketch.

## Implementation sketch

- Add displayBalance next to trialBalance
- Tests: asset 100 stays 100; liability 40 displays -40 or credit-normal convention documented
- Opening-balance recipe: debit asset / credit opening equity; reverse for liabilities
- Update financial-ledger-core skill

## Risks

_None yet._

## Alternatives

_None yet._

## Agent handoff

1. Load Intent skills for `@eristack/financial-ledger`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

_None yet._
