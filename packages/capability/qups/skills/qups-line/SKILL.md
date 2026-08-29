---
name: qups-line
description: >
  @eristack/qups calculateLine/patchLine/withQupsColumns for form recalculation
  and BE insert; PricingLine when you already have Money. Use for invoice/order
  lines in the business layer — not float math in React.
metadata:
  type: core
  library: '@eristack/qups'
  library_version: '0.3.0'
sources:
  - 'eristack/business-libs:packages/capability/qups/docs/recipes.md'
  - 'eristack/business-libs:packages/capability/qups/src/core/calculate.ts'
---

# Line pricing (business layer)

```ts
import { calculateLine, patchLine, applyCellPatch, withQupsColumns } from "@eristack/qups";

const line = calculateLine({
  truth: "quantity+unitPrice",
  currency: "USD",
  quantity: "2",
  unitPrice: "50",
  modifiers: [{ kind: "discount", type: "percent", percent: "5" }],
  taxRatePercent: "11",
  round: true,
});

applyCellPatch(line, "unitPrice", "12"); // spreadsheet cell commit → patchLine
patchLine(line, { unitPrice: nextValue }); // TanStack Form onChange
withQupsColumns({ itemId }, line);         // BE insert payload
```

## Recalc: blur vs onChange

| Trigger | Use when | API |
| --- | --- | --- |
| **onChange** | Spreadsheet / live grid — every cell edit recalculates immediately | `patchLine(line, { field: value })` on TanStack Form `onChange` |
| **onBlur** | Heavy lines (many modifiers) — recalc when user leaves the field | Store draft string locally; call `patchLine` in `onBlur` only |
| **Commit row** | Batch paste / import | `applyCellPatch` then single `patchLine` before save |

Keep **one** truth mode per screen (`quantity+unitPrice` vs `quantity+lineTotal`). Do not mix blur-only and onChange on the same field — users will see stale totals until blur.

Server insert always uses the last committed line object (`withQupsColumns`), not in-flight draft strings.
