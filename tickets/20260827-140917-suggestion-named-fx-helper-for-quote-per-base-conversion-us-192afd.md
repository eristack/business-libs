# Suggestion: Named FX helper for quote-per-base conversion (USD to IDR snapshots)

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260827-140917-suggestion-named-fx-helper-for-quote-per-base-conversion-us-192afd`
- **kind:** suggestion
- **package:** `@eristack/money`
- **feasibility:** `possible`
- **created:** 2026-08-27T14:09:17.596Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

Cost sheet lines convert USD totals to IDR with an app-supplied rate (16250 IDR per 1 USD) and snapshot total_idr. IMPLEMENTATION.md cannot name the Conversion.of argument shape without guessing. A named helper plus a worked IDR example would stop agents inventing float multiply.

## User story

As a forwarding ERP I want Money.of('1500.00','USD') converted to IDR at 16250 with Rounding.currencyDefault without calling Number.

## Proposed behavior

convertAtQuotePerBase(money, quotePerBase: string, quoteCurrency) returns Money in quote currency. 1500 USD * 16250 => 24375000 IDR. Rejects JS numbers for the rate.

## Proposed API

convertAtQuotePerBase(amount: Money, quotePerBase: string, quote: CurrencyCode): Money — thin named wrapper over Conversion.of if that already exists

## Feasibility rationale

In-bounds for Named FX helper for quote-per-base conversion (USD to IDR snapshots); proceed with a concrete implementation sketch.

## Implementation sketch

- If Conversion.of already does this, export an alias and a getting-started FX recipe with IDR
- Tests pin 1500.00 USD at 16250 -> 24375000 IDR
- money-ledger skill: one copy-paste snippet for cost-sheet snapshots

## Risks

- Must not fetch FX from the network. App-supplied rate only.
- Rounding: IDR 0 dp, USD 2 — use Rounding.currencyDefault, not Math.round.

## Alternatives

- `Number(amount)*Number(rate)` — forbidden.
- Consumer `convertLineToIdr` wrapper (IMPLEMENTATION §8.5 currently guesses Conversion.of shape).

## Agent handoff

1. Load Intent skills for `@eristack/money`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

Sprint: `2026-08-27-backseat-sea-job-cost-sheet-mockup` model-line-math. Golden §8.6 / §25: 1500.00 USD × 16250 → 24375000 IDR.

### Consumer evidence (Tiga Sekawan)

IMPLEMENTATION.md §8.5 literally says:

```
// Conversion.of(total, { quotePerBase: fxToIdr, quote: "IDR" }) — use the real money API
```

The argument shape is guessed. Pinning `convertAtQuotePerBase` (or documenting Conversion.of with this IDR example) unblocks Horizon A tests.

Sheet-level optional `fx_usd_idr` prefills new lines; each line still snapshots `fx_to_idr` so history does not move.

### Sibling tickets (2026-08-27 batch)

See `.eristack/tickets/20260827-index-tiga-sekawan-horizon-a-eristack-gaps.md`.
