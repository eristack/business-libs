---
title: Collection declaration (Horizon B)
description: defineErpCollection manifests for Backseat and Drizzle, CollectionDocumentStore port, and dual-target routesSnapshot mirror CI for 3ss B4.
---

# Collection declaration (3ss B4 — Horizon B)

One **manifest per ERP collection** ties together Backseat, Drizzle, and Express. Full codegen is not shipped yet; **`defineErpCollection`** in `@eristack/drizzle/schema` is the contract apps and future generators share.

## Manifest

```ts
import { defineErpCollection, erpCollectionManifests } from "@eristack/drizzle/schema";

export const erpCollections = erpCollectionManifests([
  defineErpCollection({
    collection: "invoices",
    row: {
      toRow: (doc) => ({ id: doc.id, number: doc.number, version: doc.version, payload: doc }),
      fromRow: (row) => row.payload as InvoiceDoc,
    },
  }),
  defineErpCollection({ collection: "jobs", idField: "id" }),
]);
```

- **JSON blob path (workshop):** omit `row` — use `createDrizzleBackseatStore` + `backseat_documents` (`@eristack/backseat/drizzle`).
- **Normalized tables:** implement `row.toRow` / `row.fromRow`; keep migrations in app `schema.ts` using `dialectText`, `dialectJsonMap`, etc.
- **Domain port:** depend on `CollectionDocumentStore` from `@eristack/backseat` (same as `BackseatStore` pick).

## Wire Backseat

```ts
import { createBackseat } from "@eristack/backseat";
import { backseatCollectionsFromManifests } from "@eristack/drizzle/schema";

const api = createBackseat({
  store,
  collections: backseatCollectionsFromManifests(erpCollections),
});
```

Reference: `examples/express/src/db/collections.ts`.

Custom routes stay `registerRoute` — manifests do not replace handlers.

## Acceptance: dual-target mirror

1. Export `routesSnapshot()` from workshop Backseat and from Express boot.
2. Compare with `@eristack/backseat/testing` — `assertRoutesSnapshotsEqual` / `routesSnapshotsMatch`.
3. Template: `examples/express/scripts/api-mirror-smoke.template.mjs`.
4. Safe GET probes + `assertDataGridEnvelope` on list routes.

CI fails when Express drops a Backseat route or list shape drifts — not when handler bodies differ.

## What ships later

- SQL DDL + dual-dialect migrations from manifests.
- Shared list projection wiring to `@eristack/data-grid`.
- Idempotent create flag → `@eristack/idempotency` + domain UNIQUE.

Until then, manifests + manual mappers + mirror smoke are the supported path.

## Do not

- Open a second Drizzle pool inside generated code — inject `db` from `openDrizzle`.
- Start codegen before B3 column helpers are in the app schema.
