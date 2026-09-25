# Suggestion: Currency-scale display string without Number()

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260925-163555-suggestion-currency-scale-display-string-without-number-f516d5`
- **kind:** suggestion
- **package:** `@eristack/money`
- **feasibility:** `possible`
- **created:** 2026-09-25T16:35:55.199Z
- **reporter:** household

## Summary

Money JSON serializes 2.50 as 2.5. Journals look wrong. Need formatFixed / toDisplayString using currency defaults, not Number().

## User story

As a household ledger I want posted amounts to print with currency fraction digits without converting to JS number.

## Proposed behavior

formatFixed(money) pads to the currency default scale. toDisplayString accepts minFractionDigits override. No Number() on the amount string.

## Proposed API

formatFixed(money: Money): string; toDisplayString(money: Money, opts?: { minFractionDigits?: number }): string

## Feasibility rationale

In-bounds for Currency-scale display string without Number(); proceed with a concrete implementation sketch.

## Implementation sketch

- Implement on Money using existing currency scale tables
- Tests: USD 2.5 → 2.50; JPY 100 → 100; never Number()
- Document in money-amounts skill under display

## Risks

_None yet._

## Alternatives

_None yet._

## Agent handoff

1. Load Intent skills for `@eristack/money`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

_None yet._
