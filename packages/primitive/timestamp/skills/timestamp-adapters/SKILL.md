---
name: timestamp-adapters
description: >
  @eristack/timestamp adapters (mirror money): Drizzle SQL columns, REST wire codec,
  Zod 4, Express/Nest HTTP, client revive, React form helpers. Use when persisting
  instants or wall times in SQL or validating API bodies.
metadata:
  type: adapter
  library: '@eristack/timestamp'
  library_version: '0.0.0'
sources:
  - 'eristack/business-libs:packages/primitive/timestamp/docs/adapters.md'
---

# @eristack/timestamp — Adapters

Hub: `packages/primitive/timestamp/docs/adapters.md`.

## Subpath map

| Subpath | Use |
| --- | --- |
| `./drizzle` | `instantField`, `wallField`, `timeZoneField`, pack/unpack |
| `./rest` | `parseTimestampJSON` / `serializeTimestamp` |
| `./zod` | Zod **4** only (peer `^4.0.0`) — `timestampSchemaDefault`, `instantSchema`, `wallSchema` |
| `./express` | `readTimestamp` / `readTimestampField` → `/rest` |
| `./nest` | `ParseTimestampPipe` |
| `./client` | `reviveTimestamp` / `reviveTimestampFields` after fetch |
| `./react` | `timestampFormValue`, `submitTimestampFormValue`, validators |

## Three representations

| Layer | Instant | Wall |
| --- | --- | --- |
| Wire | `{ kind: "instant", instant, timezone }` | `{ kind: "wall", local, timezone }` |
| SQL | `timestamptz` + zone varchar | `local text` + zone varchar |

## Corruption rules

1. instant wire → UTC `Z`.
2. wall wire → no offset on `local`.
3. Never silently store wall `local` in `timestamptz`.
4. IANA only in `timezone` columns.
5. `/express` and `/nest` call `/rest` — no duplicate ISO validation.

## Drizzle quick wire

```ts
import { instantField, wallField } from "@eristack/timestamp/drizzle";

const postedAt = instantField("pgsql", "postedAt");
const dueAt = wallField("pgsql", "dueAt");

// table: ...postedAt.columns, ...dueAt.columns
postedAt.pack(instantOf("2026-08-22T02:30:00Z", "Asia/Jakarta"));
postedAt.unpack(row);
```

## REST quick wire

```ts
import { parseTimestampJSON, serializeTimestamp } from "@eristack/timestamp/rest";

const posted = parseTimestampJSON(body.postedAt, "postedAt");
res.json({ postedAt: serializeTimestamp(posted) });
```
