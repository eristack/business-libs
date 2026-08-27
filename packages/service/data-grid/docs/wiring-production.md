---
title: Production wiring
description: End-to-end Drizzle + Express + React path for data-grid lists
sidebar_position: 3
---

# Production wiring — `@eristack/data-grid`

Complete path from schema definition to Drizzle SQL list endpoint and React URL-synced query. The schema is an **allow-list** — unknown filter fields fail at parse time.

Skills: `@eristack/data-grid#data-grid-adapters` · Example: `examples/express` orders router.

---

## Install and peers

```bash
pnpm add @eristack/data-grid
pnpm add drizzle-orm postgres
pnpm add @eristack/timestamp   # when using type: "wall" columns
pnpm add express react @tanstack/react-query @tanstack/react-router
```

| Entry | Peer |
| --- | --- |
| `@eristack/data-grid` | — |
| `@eristack/data-grid/drizzle` | `drizzle-orm` + driver |
| `@eristack/data-grid/express` | `express` |
| `@eristack/data-grid/nest` | `@nestjs/common` |
| `@eristack/data-grid/client` | — |
| `@eristack/data-grid/react` | `react`, `@tanstack/react-query` |
| `@eristack/data-grid/backseat` | `@eristack/backseat` |

---

## 1. Schema (list row shape)

```ts
// src/grids/order-grid.ts
import { createDataGrid, type DataGridSchema } from "@eristack/data-grid";

export const orderGridSchema = {
  fields: [
    { name: "number", type: "string", filterable: true, sortable: true, searchable: true },
    {
      name: "status",
      type: "enum",
      filterable: true,
      sortable: true,
      enumValues: ["draft", "open", "fulfilled", "cancelled"],
    },
    {
      name: "orderedAt",
      type: "wall",
      filterable: true,
      sortable: true,
      timezone: "Asia/Jakarta",
    },
    { name: "customerName", type: "string", filterable: true, sortable: true, searchable: true },
    { name: "totalAmount", type: "decimal", filterable: true, sortable: true },
    { name: "lineCount", type: "number", filterable: true, sortable: true },
  ],
  defaultSorts: [{ field: "orderedAt", dir: "desc" }],
  defaultPageSize: 20,
  maxPageSize: 100,
  defaultMode: "advanced",
} satisfies DataGridSchema;

export const orderGrid = createDataGrid(orderGridSchema);
```

`type: "wall"` requires `@eristack/timestamp` compare at SQL layer. `type: "decimal"` for money strings — never `Number()`.

---

## 2. Drizzle projection (you own joins)

```ts
// src/grids/order-source.ts
import { sql } from "drizzle-orm";
import { orders, customers, orderLines } from "../db/schema.js";

export function orderGridSource(db: AppDb) {
  return db
    .select({
      id: orders.id,
      number: orders.number,
      status: orders.status,
      orderedAt: orders.orderedAt,
      customerName: customers.name,
      totalAmount: sql<string>`sum(${orderLines.lineTotal})`.as("total_amount"),
      lineCount: sql<number>`count(${orderLines.id})`.as("line_count"),
    })
    .from(orders)
    .innerJoin(customers, eq(customers.id, orders.customerId))
    .leftJoin(orderLines, eq(orderLines.orderId, orders.id))
    .groupBy(orders.id, customers.name);
}
```

---

## 3. Execute list

```ts
import {
  columnsFromSource,
  executeDrizzleList,
} from "@eristack/data-grid/drizzle";

export async function listOrders(db: AppDb, query: DataGridQuery) {
  const source = orderGridSource(db);
  return executeDrizzleList({
    dialect: "pgsql",
    db,
    source,
    columns: columnsFromSource(source, orderGridSchema),
    query,
    schema: orderGridSchema,
    map: (row) => ({
      id: row.id,
      number: row.number,
      status: row.status,
      orderedAt: row.orderedAt,
      customerName: row.customerName,
      totalAmount: row.totalAmount,
      lineCount: Number(row.lineCount),
    }),
  });
}
```

Response shape always:

```ts
{ items: T[]; pageInfo: PageInfo; query: DataGridQuery }
```

---

## 4. Express route

```ts
import {
  createDataGridMiddleware,
  toDataGridBody,
  toDataGridErrorResponse,
  applyRestResponse,
} from "@eristack/data-grid/express";

app.get(
  "/orders",
  requireAuth,
  createDataGridMiddleware(orderGridSchema),
  async (req, res) => {
    try {
      const result = await listOrders(db, req.dataGridQuery!);
      res.json(toDataGridBody(result));
    } catch (error) {
      applyRestResponse(res, toDataGridErrorResponse(error));
    }
  },
);
```

Invalid query → **400** `VALIDATION_ERROR`. See [@eristack/ai-knowledge http-errors](/docs/ai-knowledge/http-errors).

---

## 5. React + TanStack Router

```tsx
import { useDataGridQuery, useDataGridList } from "@eristack/data-grid/react";
import { createDataGridClient } from "@eristack/data-grid/client";

const gridClient = createDataGridClient({
  baseUrl: () => import.meta.env.VITE_API_URL,
  getHeaders: async () => ({
    Authorization: `Bearer ${await auth.ensureAccessToken()}`,
  }),
});

function OrderListRoute() {
  const { query, setQuery } = useDataGridQuery(orderGridSchema);
  const { data } = useDataGridList(gridClient, "/orders", query);
  // URL search params stay in sync via useDataGridQuery
}
```

Pair with `@eristack/epoch` — refetch when `resolveCachePolicy` returns `refetch`.

---

## 6. NestJS

```ts
import { DataGridModule, ParseDataGridPipe } from "@eristack/data-grid/nest";

@Get()
list(@Query(ParseDataGridPipe.forSchema(orderGridSchema)) query: DataGridQuery) {
  return listOrders(this.db, query);
}
```

---

## 7. Epoch cache invalidation

After order mutations:

```ts
await epoch.bumpMany(["orders", "dashboard"]);
```

Client lists keyed by scope + client epoch — stale → refetch, not version merge.

---

## 8. Testing subpath note

- **Core**: `grid.applyInMemory(rows, query)` — no SQL
- **Unit tests**: memory rows with wall/decimal fields
- **Integration gap (audit)**: `executeDrizzleList` sqlite test harness planned — run manual SQL tests until shared harness lands

Do not use `executeBackseatList` in production — Horizon A only.

---

## 9. Horizon A → B

| A | B |
| --- | --- |
| `executeBackseatList` + IndexedDB | `executeDrizzleList` + same schema |
| `prefilter` for ABAC | SQL `WHERE` scope predicates |
| Backseat collection name | SQL projection |

Keep **identical** `orderGridSchema` so React query params survive graduation.

---

## Related

- [Getting started](./getting-started.md) — parse + in-memory
- [Database](./database.md) — projections and aggregates
- [Querying](./querying.md) — operators
- [URL & TanStack Router](./url-search.md) — search param sync
