---
title: Recipes
description: ERP field naming, mode choice, doc-number and ledger patterns
sidebar_position: 9
---

# Recipes

Copy-paste patterns for common ERP fields. Each recipe states **mode**, **storage**, and **display**.

## Decision table

| Product language | Mode | Store | Display |
| --- | --- | --- | --- |
| Posted / occurred / received | instant | `TimestampJSON` or UTC + zone | `formatInstant` or local parts |
| Transaction date (from post time) | instant | same as posted | `toLocalDateString(posted)` |
| Transaction date (user-picked date) | wall | `local` @ start of day + zone | `formatWall` |
| Due date / pay by | wall | wall JSON | local date in UI |
| Appointment start | wall | wall JSON | local datetime |
| Sequence / doc number date tokens | N/A | `@eristack/doc-number` UTC | pass adjusted `at` if needed |

## Recipe: Invoice posted + transaction date

```ts
import { instantOf, toLocalDateString, timestampToJSON } from "@eristack/timestamp";

const entityTimezone = "Asia/Jakarta";

const posted = instantOf(req.body.postedAt, entityTimezone);

await db.insert(invoices).values({
  postedInstant: timestampToJSON(posted).instant,
  postedTimezone: posted.timezone,
  transactionDate: toLocalDateString(posted),
});
```

Single source of truth: posting instant. Transaction date is **derived** unless legal requires independent date entry.

## Recipe: User-picked transaction date (date-only)

When legal requires the user to choose the date independent of server post time:

```ts
import { wallOf, toLocalDateString, wallToInstantOnce } from "@eristack/timestamp";

const txnDate = wallOf("2026-08-22T00:00:00", entityTimezone);

// Optional: sort key / index
const sortInstant = wallToInstantOnce(txnDate);
```

Persist wall JSON for editing; use instant only for indexes if needed.

## Recipe: Payment due local midnight

```ts
import { wallOf, timestampToJSON } from "@eristack/timestamp";

const due = wallOf("2026-10-15T00:00:00", "Europe/Paris");

await db.insert(invoices).values({
  dueAt: timestampToJSON(due),
});
```

Reminder job:

```ts
import { wallToInstantOnce } from "@eristack/timestamp";

const fireAt = wallToInstantOnce(due);
// enqueue at fireAt.instant — keep due as wall in DB
```

## Recipe: GL posting time

Align with `@eristack/financial-ledger` today (ISO in hash) + zone on SQL:

```ts
const occurred = instantOf(input.occurredAt, entityTimezone);

await ledger.post({
  occurredAt: occurred.instant, // hash payload — ISO UTC string
  // app SQL: occurred_timezone column
});
```

Future hydrate helper may return `ZonedInstant` directly.

## Recipe: Valuations receivedAt

FIFO sort order is timeline order:

```ts
import { compareInstant, instantOf } from "@eristack/timestamp";

const a = instantOf(rowA.receivedAt, "UTC");
const b = instantOf(rowB.receivedAt, "UTC");
compareInstant(a, b);
```

## Recipe: doc-number with entity-local period intent

Doc-number stays UTC internally. To allocate in entity-local **month** bucket:

```ts
import { instantOf, toLocalParts } from "@eristack/timestamp";

const posted = instantOf(new Date(), "Asia/Jakarta");
const parts = toLocalParts(posted);

// App constructs Date at local month boundary if you intentionally
// want sequence bucket to follow entity calendar — document policy.
await docNumber.next({
  entityKey: "invoice",
  at: new Date(posted.instant), // still UTC instant; adjust deliberately if needed
});
```

Prefer explicit product policy doc over implicit server TZ.

## Recipe: API contract (OpenAPI-ish)

```yaml
PostedAt:
  type: object
  required: [kind, instant, timezone]
  properties:
    kind: { const: instant }
    instant: { type: string, format: date-time }
    timezone: { type: string, example: Asia/Jakarta }

DueAt:
  type: object
  required: [kind, local, timezone]
  properties:
    kind: { const: wall }
    local: { type: string, example: "2026-10-15T00:00:00" }
    timezone: { type: string, example: Europe/Paris }
```

Validate with `validateTimestampJSON` until `./zod` ships.

## Recipe: TanStack Form (strings until submit)

Until `./react`:

```ts
// field value shape mirrors TimestampJSON
const defaultPosted = {
  kind: "instant" as const,
  instant: "2026-08-22T12:00:00Z",
  timezone: branch.timezone,
};

onSubmit: ({ value }) => {
  const posted = parseTimestamp(value.postedAt);
};
```

## Related

- [Getting started](./getting-started.md)
- [Instant mode](./instant.md)
- [Wall mode](./wall.md)
