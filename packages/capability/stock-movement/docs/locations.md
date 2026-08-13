---
title: Locations
description: Dynamic location parts → stable locationId
---

# Locations

Stock lives at a **location**. ERP locations are rarely a single FK — they are
aggregates (warehouse + aisle + bin, or plant + machine).

## locationIdFromParts

```ts
await locationIdFromParts([
  { key: "warehouseId", value: "WH-A" },
  { key: "machineId", value: "M-9" },
]);
```

Rules:

1. Trim keys/values; drop empty keys.
2. Sort by key (stable across call sites).
3. SHA-256 → `loc_` + first 32 hex chars.

Same parts in any order → same `locationId`. Different apps can add new
dimensions without changing the stock API.

## What apps store

Persist the **parts** (for UI) and the **locationId** (for the ledger). Rebuilding
the id from parts must match the stored id or you open a parallel chain by
mistake.
