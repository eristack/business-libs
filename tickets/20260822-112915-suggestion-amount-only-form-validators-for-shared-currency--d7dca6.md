# Suggestion: Amount-only form validators for shared-currency QUPS fields

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260822-112915-suggestion-amount-only-form-validators-for-shared-currency--d7dca6`
- **kind:** suggestion
- **package:** `@eristack/money`
- **feasibility:** `partial`
- **created:** 2026-08-22T11:29:15.255Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

money/react createMoneyFieldValidators expects MoneyJSON {currency,amount}. QUPS and ERP product forms store a flat amount string plus one row currency. Consumers hand-roll Money.of + Rounding.currencyDefault instead of using the official form adapter.

## User story

As a form author I want TanStack Form validators for a decimal amount string given an expected currency, without changing the field to nested MoneyJSON.

## Proposed behavior

Optional helpers validate and optionally round a flat amount string against a currency. MoneyJSON validators stay for nested wire objects. Aligns with money/zod moneyAmountOnlySchema and qups calculateLine strings.

## Proposed API

e.g. createAmountOnlyFieldValidators({ currency, required?, round? }) and/or parseRoundedAmount(amount, currency) in core or ./react

## Feasibility rationale

Likely doable as an additive / adapter-scoped change.

## Implementation sketch

- Reuse Money.of + Rounding.currencyDefault and the same errors as money/zod moneyAmountOnlySchema + currencyCodeSchema.
- Export from ./react (and document next to moneyFormValue). Do not put React in core.
- Docs: QUPS/product form uses amount-only; invoice MoneyJSON uses existing helpers.
- Tests: valid IDR string; reject numeric JSON amount; optional round at currency scale.
- Changeset + knowledge:sync for money-adapters skill.

## Risks

- Keep `./react` optional-peer; do not import React from core.
- Do not replace MoneyJSON validators — amount-only is an extra path for QUPS-style forms.

## Alternatives

- Force product/PO fields to `{ currency, amount }` (fights QUPS flat strings).
- Consumer one-liner `Money.of(amount, currency).with(Rounding.currencyDefault())` (current Tiga Sekawan helper).

## Agent handoff

1. Load Intent skills for `@eristack/money`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

Observed consumer: `@eristack/money@0.3.0`. `./zod` already has `moneyAmountOnlySchema`; `./react` does not expose an amount-only TanStack Form helper.

Sibling tickets: qups `20260822-112914-suggestion-export-qups-truth-modes-and-isqupstruthmode-5d16e3`; data-grid `20260822-112915-suggestion-decimal-or-money-field-type-so-lists-do-not-coer-014fcf`.

Consumer cut plan: `.eristack/plans/2026-08-22-cut-reinvented-eristack-wrappers.md`.
