---
name: qups-core
description: >
  Pure @eristack/qups business calculator: calculateLine / patchLine (plain
  strings for TanStack Form + BE), Qups 2-of-3 SoT, PricingLine, modifiers, tax.
  Prefer calculateLine over inventing float qty/price math in UI or SQL.
metadata:
  type: core
  library: '@eristack/qups'
  library_version: '0.0.0'
sources:
  - 'eristack/business-libs:packages/capability/qups/docs/index.md'
  - 'eristack/business-libs:packages/capability/qups/docs/recipes.md'
  - 'eristack/business-libs:packages/capability/qups/docs/concepts.md'
  - 'eristack/business-libs:packages/capability/qups/src/core/calculate.ts'
---

# QUPS core

Primary API — same function in React forms and on the server:

```ts
import { calculateLine, patchLine, withQupsColumns } from "@eristack/qups";

let line = calculateLine({
  truth: "quantity+unitPrice",
  currency: "USD",
  quantity: "2",
  unitPrice: "50",
  taxRatePercent: "11",
  round: true,
});

line = patchLine(line, { unitPrice: "55" });
await db.insert(t).values(withQupsColumns({ itemId }, line));
```

Lower-level: `Qups`, `PricingLine`, `AdjustedAmount`, `LineTax` when you already hold `Money`.
Truth mode registry: `QUPS_TRUTH_MODES`, `isQupsTruthMode` — do not copy the three strings in consumers. UI roles: `qupsRolesFor(truth)`.
Drizzle column injection: `@eristack/qups/drizzle` → `qupsLineColumns`.
