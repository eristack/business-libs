---
title: Recipes
description: Transfers, adjustments, stocktake, multi-dimension locations
---

# Recipes

## Transfer between locations

Post **out** at source and **in** at destination with the same `entryTypeId` so
you can reconcile the transfer document later.

```ts
await stock.append({
  locationId: fromLoc,
  lotId,
  outAmount: qty,
  entryType: "transfer-out",
  entryTypeId: transferId,
});
await stock.append({
  locationId: toLoc,
  lotId,
  inAmount: qty,
  entryType: "transfer-in",
  entryTypeId: transferId,
  openingBalance: "0", // only if the destination chain is new
});
```

## Count adjustment

```ts
await stock.append({
  locationId,
  lotId,
  adjustment: "-2",
  entryType: "count",
  entryTypeId: countId,
});
```

Use signed `adjustment` for variances; keep receipt/issue magnitudes in
`inAmount` / `outAmount`.

## Stocktake close

1. `await stock.verify({ locationId, lotId, ownerId })`
2. Compare `snapshot` balance to physical count
3. Post a count adjustment if needed
4. Optionally record a closing entry type for audit

## Multi-dimension location

```ts
const locationId = await locationIdFromParts([
  { key: "warehouseId", value: "WH-A" },
  { key: "zoneId", value: "Z-2" },
  { key: "binId", value: "B-14" },
]);
```

Persist both the parts (UI) and `locationId` (ledger). Rebuilding from parts must
match the stored id.
