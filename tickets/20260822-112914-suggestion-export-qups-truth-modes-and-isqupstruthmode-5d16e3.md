# Suggestion: Export QUPS_TRUTH_MODES and isQupsTruthMode

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260822-112914-suggestion-export-qups-truth-modes-and-isqupstruthmode-5d16e3`
- **kind:** suggestion
- **package:** `@eristack/qups`
- **feasibility:** `possible`
- **created:** 2026-08-22T11:29:14.882Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

Consumers re-copy the three QupsTruthMode strings into runtime arrays and type aliases. Export a const tuple plus a type guard so draft parsers and selects do not invent a fourth copy.

## User story

As an ERP consumer I want to validate and list QUPS truth modes from the library so I do not maintain PurchaseOrderLineTruth, TRUTH_MODES, and UI option values by hand.

## Proposed behavior

Import QUPS_TRUTH_MODES and isQupsTruthMode from @eristack/qups. The tuple is the runtime source of QupsTruthMode. isQupsTruthMode narrows unknown wire input. calculateLine / InvalidTruthError stay the math authority. No UI labels in the package.

## Proposed API

export const QUPS_TRUTH_MODES = ["quantity+unitPrice", "quantity+subtotal", "unitPrice+subtotal"] as const; export function isQupsTruthMode(value: unknown): value is QupsTruthMode

## Feasibility rationale

In-bounds for Export QUPS_TRUTH_MODES and isQupsTruthMode; proceed with a concrete implementation sketch.

## Implementation sketch

- Add QUPS_TRUTH_MODES next to QupsTruthMode and derive the type from typeof QUPS_TRUTH_MODES[number] if that is non-breaking.
- Add isQupsTruthMode using the tuple; do not silently default unknown strings.
- Unit tests: all three modes accepted; garbage rejected; type of QUPS_TRUTH_MODES[number] equals QupsTruthMode.
- Document in getting-started / concepts; mention qupsRolesFor for required SoT fields instead of consumer needsQty flags.
- Changeset + knowledge:sync if the skill lists new exports.

## Risks

- Deriving `QupsTruthMode` from the tuple is a type-only change if the three strings stay identical.
- UI labels must stay out of this package (consumer chrome).

## Alternatives

- Consumers keep a local `as const` copy (current Tiga Sekawan workaround; drifts).
- Validate only by catching `InvalidTruthError` from `calculateLine` (no list for `<select>`).

## Agent handoff

1. Load Intent skills for `@eristack/qups`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

Observed consumer: `@eristack/qups@0.3.0`. Tiga Sekawan currently copies the triad in `packages/contracts` (`PurchaseOrderLineTruth`), `packages/domain/src/purchase-orders/draft.ts` (`TRUTH_MODES` + `needsQty`/`needsUnitPrice`/`needsSubtotal`), and `apps/web/.../po-line-grid.ts` (`QUPS_TRUTH_OPTIONS` values).

Sibling tickets (same audit): data-grid decimal field `20260822-112915-suggestion-decimal-or-money-field-type-so-lists-do-not-coer-014fcf`; money amount-only validators `20260822-112915-suggestion-amount-only-form-validators-for-shared-currency--d7dca6`.

Consumer cut plan (do not implement in this ticket): `.eristack/plans/2026-08-22-cut-reinvented-eristack-wrappers.md`.
