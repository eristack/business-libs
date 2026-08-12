# @eristack/qups

Business-layer line pricing: **quantity · unit price · subtotal** (2-of-3 SoT),
modifiers, and tax — same calculator in TanStack Form and on the BE.

```ts
import { calculateLine, patchLine, withQupsColumns } from "@eristack/qups";

// Form listener / BE handler — plain strings in, plain strings out
let line = calculateLine({
  truth: "quantity+unitPrice",
  currency: "USD",
  quantity: "2",
  unitPrice: "50",
  modifiers: [{ kind: "discount", type: "percent", percent: "5" }],
  taxRatePercent: "11",
  round: true,
});

line = patchLine(line, { unitPrice: "55" }); // user typed a new price
line.subtotal; // derived
line.total;    // payable

// Persist next to itemId
await db.insert(invoiceLines).values(
  withQupsColumns({ invoiceId, itemId: "SKU-1" }, line),
);
```

Optional: spread `qupsLineColumns("pgsql")` into your detail table — see docs.
