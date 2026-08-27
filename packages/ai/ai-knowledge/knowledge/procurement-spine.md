# Procurement spine (compose before feature packages)

End-to-end **procure-to-receive** using today's 0.x packages — no `@eristack/feature-procurement` yet. App owns schema; libraries own math, ledgers, policies, and list/query.

## Minimal path

```text
jwt-auth (login)
  → doc-number (PO-, GR- formats)
  → qups (PO lines)
  → pbac (approve PO, post GR)     ← knowledge/pbac-transitions.md
  → stock-movement (receive qty)   ← idempotencyKey on append
  → data-grid (PO / GR lists)
```

Financial accrual and valuations are optional in v1 spine; add `@eristack/financial-ledger` when invoice posting starts.

## Minimal path

```ts
import { calculateLine } from "@eristack/qups";

const line = calculateLine({
  truth: "quantity+unitPrice",
  currency: "USD",
  quantity: "10",
  unitPrice: "12.50",
});
```

Persist `line` snapshot on the PO line row — recalc on edit with `patchLine`.

## GR post (stock)

```ts
import { createStockMovement, locationIdFromParts } from "@eristack/stock-movement";
import { createDrizzleLedgerStore, createHashChainedLedgerTables } from "@eristack/stock-movement/drizzle";

const stock = createStockMovement({ store: createDrizzleLedgerStore({ db, tables }) });

const locationId = await locationIdFromParts([
  { key: "warehouseId", value: warehouseId },
]);

await stock.append({
  locationId,
  lotId,
  ownerId: itemId,
  inAmount: qty,
  entryType: "goods_receipt",
  entryTypeId: grLineId,
  idempotencyKey: `gr-${grId}-line-${lineNo}`,
});

const ok = await stock.verify({ locationId, lotId, ownerId: itemId });
```

Production: Drizzle Postgres. Memory / Backseat: prototypes and `examples/erp-spine` only.

## Runnable reference

| Example | Proves |
| --- | --- |
| `examples/express` + `examples/react` | jwt-auth + data-grid |
| `examples/erp-spine` | qups + stock append + idempotency (skeleton — grow over sessions) |

## Roadmap gate

From `roadmap/erp.md` — before first `@eristack/feature-*` alpha:

- [ ] PO → GR → stock snapshot demo (example or Backseat)
- [ ] PBAC recipes for PO / GR states
- [ ] Partner/product schema sketch (app-owned until feature-partner)

This guide satisfies the **compose** instruction until feature packages exist.
