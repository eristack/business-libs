---
title: Drizzle adapter
description: "@eristack/timestamp/drizzle — SQL columns, pack/unpack for instant and wall"
sidebar_position: 11
---

# Drizzle adapter

`@eristack/timestamp/drizzle` injects timestamp columns into **app-owned** tables (same pattern as `@eristack/money/drizzle`).

```bash
pnpm add @eristack/timestamp drizzle-orm
```

```ts
import {
  instantField,
  wallField,
  timeZoneField,
} from "@eristack/timestamp/drizzle";
```

Peer: `drizzle-orm` (optional). Dialect: `"pgsql" | "mysql" | "sqlite"` — production default **`"pgsql"`**.

Overview: [Adapters](./adapters.md).

## Field bindings

Prefer **`instantField()`** / **`wallField()`** — one binding for columns, pack, unpack, and data-grid SQL field names.

```ts
import { pgTable, text } from "drizzle-orm/pg-core";
import { instantOf } from "@eristack/timestamp";
import { instantField } from "@eristack/timestamp/drizzle";

const postedAt = instantField("pgsql", "posted");

export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(),
  ...postedAt.columns,
});

// insert
postedAt.pack(instantOf("2026-08-22T02:30:00Z", "Asia/Jakarta"));

// select
postedAt.unpack(row);
```

Default SQL suffixes: `{logical}_at` + `{logical}_timezone` for instants; `{logical}_local` + `{logical}_timezone` for wall.

| Dialect | Instant storage | Wall local | Zone |
| --- | --- | --- | --- |
| `pgsql` | `timestamptz` (string mode) | `text` | `varchar(64)` |
| `mysql` | `datetime(3)` string | `varchar(64)` | `varchar(64)` |
| `sqlite` | `text` ISO UTC | `text` | `text` |

**Never** write wall `local` into `timestamptz` via implicit cast.

## Wall paired columns

```ts
import { wallField } from "@eristack/timestamp/drizzle";

const dueAt = wallField("pgsql", "due", {
  timezoneColumn: "dueTimezone", // optional override
});
```

## Shared document timezone

```ts
const docZone = timeZoneField("pgsql", "timezone");
// one zone column; instant fields can reference shared zone via timezoneColumn option
```

## Low-level pack/unpack

```ts
import { packInstant, unpackInstant, packWall, unpackWall } from "@eristack/timestamp/drizzle";
```

Use when you already resolved column names; bindings are preferred for new tables.

## Options

`TimestampAdapterOptions`:

- `naming` — override suffixes (`instantSuffix`, `wallLocalSuffix`, `timezoneSuffix`)
- `timezoneColumn` — SQL/property name for zone when not using default `{logical}_timezone`

Nullability: instant and zone columns must be **both null or both set** — mismatched pairs throw on unpack.
