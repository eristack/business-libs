---
title: Concepts
description: Two sources of truth; Money everywhere
sidebar_position: 2
---

# Concepts

## Two of three

In any tightly coupled triad, **exactly two** values are authoritative; the
third is **derived**. That prevents float loss (subtotal 10 ÷ unit price 3 must
remain the true quantity `10/3`, not a rounded `3.33` that no longer multiplies
back to 10).

## Money only for currency

Unit price, subtotals, discounts, tax, and totals are `@eristack/money` amounts
(string/minor constructors). Quantity is dimensionless (decimal string + optional
exact ratio).

## Layers

```text
QUPS (qty · unit price · subtotal)
   │
   ▼
Adjusted (base ± discounts/surcharges → net)
   │
   ▼
Tax (net/gross + rate → payable total)
```
