# Suggestion: Dated Conversion asOf and rate pick/invert/pivot

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260925-163555-suggestion-dated-conversion-asof-and-rate-pick-invert-pivot-9ac934`
- **kind:** suggestion
- **package:** `@eristack/money`
- **feasibility:** `possible`
- **created:** 2026-09-25T16:35:55.384Z
- **reporter:** household

## Summary

Conversion.of still wants a Date timestamp. Consumers invent dummy UTC noon and rewrite invertFactor + latest-rate-on-or-before + pivot. Either grow Conversion or add fx-book helpers next to it.

## User story

As a multi-currency reporter I want convertAt(amount, term, asOf, rates) without Date and without copying invert/pivot.

## Proposed behavior

Conversion accepts asOf wall date + IANA zone. Helpers pick the latest rate on or before asOf, invert the quote, and pivot via a third currency. Missing rate throws a typed error.

## Proposed API

Conversion.of({ base, term, factor, asOf, timezone }); pickRate(rates, base, term, asOf); invertFactor(factor); convertAt(amount, term, asOf, rates); MissingFxRateError

## Feasibility rationale

In-bounds for Dated Conversion asOf and rate pick/invert/pivot; proceed with a concrete implementation sketch.

## Implementation sketch

- Decide: grow @eristack/money vs new @eristack/fx-book (needs-decision on new package)
- If money: add asOf to Conversion.of; add pickRate/invertFactor/convertAt; tests from consumer fx.ts
- If fx-book: keep Conversion dumb (one factor, one moment); book owns store + pick

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
