---
title: Gotchas
description: Common QUPS mistakes and how to avoid them
sidebar_position: 4
---

# Gotchas

## Floating quantity on U+S lines

**Symptom:** `10 / 3` becomes `3.333333` in the DB; later `qty × unit` ≠ subtotal.

**Fix:** Persist `quantityRatio` (numerator/denominator) when truth is
`unitPrice+subtotal`. Display may round; math must not.

## Different math in form vs API

**Symptom:** UI shows 99.00; insert stores 98.99.

**Fix:** Both call `calculateLine` / `patchLine` with the same truth, modifiers,
tax, and rounding flags. Do not reimplement with `Number`.

## Editing derived fields

**Symptom:** User types into a derived subtotal while Q+U is SoT; values fight.

**Fix:** Use `roles` from `calculateLine` — only SoT inputs are editable, or
explicitly switch truth when the user chooses “lock subtotal”.

## Tax before discount

**Symptom:** Finance rejects invoices; discount applied on tax-inclusive figures
incorrectly.

**Fix:** Pipeline is QUPS → modifiers → tax. Exclusive tax on discounted net is
the default story.

## Partial SQL updates

**Symptom:** Update `unit_price` column only; `subtotal` and tax stale.

**Fix:** Recompute full line, then `withQupsColumns` the whole pricing slice.

## JS number literals for money

**Symptom:** `0.1 + 0.2` style drift.

**Fix:** Strings into `calculateLine`, or `Money.of` / `Money.ofMinor` in class
APIs — never `50.1` as a JS number for currency.

## Mixing inclusive and exclusive on one doc

**Symptom:** Header tax ≠ sum of lines.

**Fix:** One tax story per document type. Document in your domain model.

## Treating PBAC/RBAC as pricing

Access control packages do not compute lines. Keep pricing in `@eristack/qups`
(+ money); gate actions with rbac/abac/pbac separately.
