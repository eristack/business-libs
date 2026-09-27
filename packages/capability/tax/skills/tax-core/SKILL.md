---
name: tax-core
description: >
  @eristack/tax createTaxRegistry, resolveTaxRate, applyTaxToAmount — Wave 13 F3; math via money Tax ops.
metadata:
  author: eristack
  version: "0.0"
sources:
  - packages/capability/tax/docs/getting-started.md
---

# @eristack/tax

1. Register codes + rate schedules (effectiveFrom wall dates, inclusive).
2. `resolveTaxRate({ code, asOf })` before line or document post.
3. `applyTaxToAmount(netMoney, ratePercent)` or feed rate into qups.

Do not duplicate percent math — use `@eristack/money` Tax operators.
