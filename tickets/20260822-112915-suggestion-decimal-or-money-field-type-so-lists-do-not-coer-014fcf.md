# Suggestion: Decimal or money field type so lists do not coerce via Number

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260822-112915-suggestion-decimal-or-money-field-type-so-lists-do-not-coer-014fcf`
- **kind:** suggestion
- **package:** `@eristack/data-grid`
- **feasibility:** `possible`
- **created:** 2026-08-22T11:29:15.064Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

Data-grid field type number plus applyInMemory accessors push consumers to Number(decimalString) for sort/filter. That violates @eristack/money string-first amounts and corrupts IDR-scale prices.

## User story

As an ERP list author I want to sort and filter decimal money columns without converting them to JS numbers.

## Proposed behavior

A documented field type or accessor contract that compares decimal strings (or Money) without Number(). Existing number fields stay for real numeric columns (qty counts, page size).

## Proposed API

New field type e.g. decimal or money, and/or applyInMemory compare hook that receives raw strings; docs show Money.compareTo for unitPrice.

## Feasibility rationale

In-bounds for Decimal or money field type so lists do not coerce via Number; proceed with a concrete implementation sketch.

## Implementation sketch

- Decide additive field type vs documented custom comparator on applyInMemory / drizzle columns.
- If new type: parse/sort/filter as decimal strings; never JSON-number amounts.
- Docs + example: product unitPrice as string + Money.compareTo; deprecate Number() in examples.
- Tests: IDR-scale strings like 4990000.00 sort correctly vs 300.00 without float.
- Changeset + knowledge:sync if the public schema changes.

## Risks

- A new field type is additive; changing default `number` behavior would be breaking.
- Drizzle/SQL numeric vs string-mode columns must stay documented separately from hash-chained decimal text.

## Alternatives

- Document only: accessor returns `Money` / compare via `compareTo` without a new type (weaker; `type: "number"` still invites `Number()`).
- Consumer keeps `type: "string"` and loses numeric ops until this ships.

## Agent handoff

1. Load Intent skills for `@eristack/data-grid`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

Observed consumer: `@eristack/data-grid@0.2.1`, `@eristack/money@0.3.0`. Current leak: `apps/web/src/data/products/product.schema.ts` `unitPrice` `type: "number"` and `apps/web/src/backseat/routes/products.ts` `Number(row.unitPrice)` in `applyInMemory`.

Sibling tickets: qups `20260822-112914-suggestion-export-qups-truth-modes-and-isqupstruthmode-5d16e3`; money `20260822-112915-suggestion-amount-only-form-validators-for-shared-currency--d7dca6`.

Consumer cut plan: `.eristack/plans/2026-08-22-cut-reinvented-eristack-wrappers.md`.
