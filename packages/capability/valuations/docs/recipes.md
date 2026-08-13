---
title: Recipes
description: FEFO, specific ID, averages, verify before close
---

# Recipes

## FEFO with expiry

```ts
const engine = createValuationEngine({
  method: "fefo",
  ledger: { store },
  layers,
});

await engine.receive({
  key,
  qty: "5",
  unitCost: "2",
  entryTypeId: "po-a",
  expiresAt: "2026-06-01T00:00:00.000Z",
  layerId: "layer-a",
});
```

Issues drain earliest `expiresAt` first (then `receivedAt`).

## Specific identification

```ts
await engine.issue({
  key,
  qty: "2",
  layerId: "layer-exact",
  entryTypeId: "so-x",
});
```

`method: "specificIdentification"` requires `layerId` on issue.

## FIFO receive → issue

```ts
await engine.receive({
  key,
  qty: "10",
  unitCost: "5",
  entryTypeId: "po-1",
  layerId: "layer-1",
});
const issued = await engine.issue({
  key,
  qty: "4",
  entryTypeId: "so-1",
});
// issued.result.totalCost === "20" under fifo @ 5
```

## Period / stocktake gate

```ts
const ok = await engine.verify(key);
if (!ok.qty || !ok.value) {
  // investigate before closing COGS
}
```

## Switch method carefully

Changing method mid-life for the same key is an accounting policy decision —
usually open a new valuation key / period rather than mixing layer orders.
