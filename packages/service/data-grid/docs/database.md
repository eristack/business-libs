---
title: Database (Drizzle)
description: Projections, joins, aggregates, and executeDrizzleList
sidebar_position: 6
---

# Database (Drizzle)

SQL lists are where most ERP screens live. The design rule is simple:

> **Your app owns the projection. The library owns filter, sort, count, and page.**

That split keeps `@eristack/data-grid` out of your schema migrations while still eliminating the boilerplate that used to sit in every list handler.

## Installation surface

```ts
import {
  columnsFromSource,
  executeDrizzleList,
  buildDrizzleQuery,
  buildWhere,
  buildOrderBy,
} from "@eristack/data-grid/drizzle";
```

Peer: `drizzle-orm` (and your driver). Dialect: `"sqlite"` | `"pgsql"` | `"mysql"`.

## The projection

A **projection** is the flat row the grid can see — often a subquery with joins and aggregates:

```ts
function orderGridSource(db: AppDb) {
  const lineAgg = db
    .select({
      orderId: orderLines.orderId,
      lineCount: sql<number>`cast(count(*) as integer)`.as("line_count"),
      totalMinor: sql<number>`cast(coalesce(sum(${orderLines.qty} * ${orderLines.unitPriceMinor}), 0) as integer)`.as(
        "total_minor",
      ),
    })
    .from(orderLines)
    .groupBy(orderLines.orderId)
    .as("order_line_agg");

  return db
    .select({
      id: orders.id,
      number: orders.number,
      status: orders.status,
      orderedAt: orders.orderedAt,
      customerName: customers.name,
      customerRegion: customers.region,
      lineCount: sql<number>`coalesce(${lineAgg.lineCount}, 0)`.as("line_count"),
      totalMinor: sql<number>`coalesce(${lineAgg.totalMinor}, 0)`.as("total_minor"),
      // …
    })
    .from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .leftJoin(lineAgg, eq(orders.id, lineAgg.orderId))
    .as("order_grid");
}
```

Name selected columns to match your `DataGridSchema` field names. Relation fields and aggregates are first-class filter/sort columns once they appear on the projection.

## `executeDrizzleList`

```ts
const source = orderGridSource(db);

const result = await executeDrizzleList({
  dialect: "sqlite",
  db,
  source,
  columns: columnsFromSource(source, orderGridSchema),
  query, // DataGridQuery from parse / middleware
  schema: orderGridSchema,
  map: (row) => ({
    ...row,
    total: formatMoney(Money.ofMinor(row.totalMinor, "USD")),
  }),
});
```

What it does for you:

1. Builds `WHERE` from advanced filters or search `q`
2. Builds `ORDER BY` from `sorts`
3. Runs `SELECT count(*)` (offset mode) for `pageInfo.total`
4. Runs the page `SELECT` with `LIMIT` / `OFFSET`
5. Maps rows and returns `buildDataGridResult({ items, query, total })`

What you still own:

- Tables, migrations, indexes
- Join graph and aggregate definitions
- Authorization (`WHERE tenant_id = ?` — apply before or compose with `buildWhere`)
- DTO mapping (`map`)
- Money formatting, enums, date serialization

## `columnsFromSource`

```ts
columnsFromSource(source, schema)
```

Walks `schema.fields` and picks matching properties off the subquery/table. Fields missing on the source are skipped (they simply cannot be filtered until you add them to the projection).

You can also build a `ColumnMap` by hand when names differ:

```ts
const columns = {
  customerName: source.customerName,
  totalMinor: source.totalMinor,
  // …
};
```

`ColumnMap` values may be table columns **or** SQL aliases (`sql\`…\`.as("…")`).

## Lower-level builders

When you need a custom path (extra predicates, keyset cursors, `HAVING`):

```ts
const { where, orderBy, limit, offset } = buildDrizzleQuery({
  dialect: "pgsql",
  columns,
  query,
  schema,
});

const tenantSafe = and(eq(source.tenantId, tenantId), where);

// run your own select / count
```

`buildWhere` and `buildOrderBy` are also exported.

## Authorization

`executeDrizzleList` does **not** know your tenancy model. Typical pattern:

```ts
const source = orderGridSource(db); // already scoped, or
// wrap with a view that includes tenant_id and add a mandatory clause:

const { where, orderBy, limit, offset } = buildDrizzleQuery({ /* … */ });
const scoped = and(eq(source.tenantId, tenantId), where);
```

For many apps, baking `tenantId` into the projection subquery (parameterized CTE / filtered view) is cleaner than remembering to `and()` it on every call.

## In-memory vs SQL

| Path | Use when |
| --- | --- |
| `applyInMemory` | Small, already-scoped collections (sessions for one user) |
| `executeDrizzleList` | Tables that should not be loaded whole |

Do not load 50k orders into Node to filter them. Push predicates to SQL.

## Full example

See `examples/express/src/orders` — customers, products, order lines, assignee users, `SUM`/`COUNT`, Express middleware, and a React grid against the same schema.
