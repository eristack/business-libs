---
name: qups-line
description: >
  @eristack/qups calculateLine/patchLine/withQupsColumns for form recalculation
  and BE insert; PricingLine when you already have Money. Use for invoice/order
  lines in the business layer — not float math in React.
metadata:
  type: core
  library: '@eristack/qups'
  library_version: '0.0.0'
sources:
  - 'eristack/business-libs:packages/capability/qups/docs/recipes.md'
  - 'eristack/business-libs:packages/capability/qups/src/core/calculate.ts'
---

# Line pricing (business layer)

```ts
import { calculateLine, patchLine, withQupsColumns } from "@eristack/qups";

const line = calculateLine({
  truth: "quantity+unitPrice",
  currency: "USD",
  quantity: "2",
  unitPrice: "50",
  modifiers: [{ kind: "discount", type: "percent", percent: "5" }],
  taxRatePercent: "11",
  round: true,
});

patchLine(line, { unitPrice: nextValue }); // TanStack Form onChange
withQupsColumns({ itemId }, line);         // BE insert payload
```
