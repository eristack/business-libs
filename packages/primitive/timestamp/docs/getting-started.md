---
title: Getting started
description: End-to-end wiring — install, modes, wire JSON, tests, production path
sidebar_position: 2
---

# Getting started

Complete first integration path for `@eristack/timestamp`. Read [Concepts](./concepts.md) if you need the why; this page is the how.

## Install

```bash
pnpm add @eristack/timestamp
```

No peer dependencies for core.

## Imports

```ts
import {
  compareInstant,
  equalTimestamp,
  instantOf,
  now,
  parseTimestamp,
  timestampFromJSON,
  timestampToJSON,
  toLocalDateString,
  toLocalParts,
  validateTimestampJSON,
  wallOf,
  wallToInstantOnce,
} from "@eristack/timestamp";
```

---

## Step 1 — Pick the mode

```text
Did the event already occur at a definite instant on the timeline?
  YES → instant mode (see instant.md)
  NO  → Is the user specifying a calendar clock in a place?
          YES → wall mode (see wall.md)
          NO  → Revisit — often instant + display zone is enough
```

| Your field | Mode | Guide |
| --- | --- | --- |
| `posted_at`, `occurred_at`, `received_at` | instant | [Instant mode](./instant.md) |
| `transaction_date` from post time | instant + derive | [Recipes](./recipes.md) |
| `due_at`, `scheduled_at`, appointments | wall | [Wall mode](./wall.md) |

---

## Step 2 — Construct values

### Instant (when it happened)

```ts
const posted = instantOf("2026-08-22T02:30:00.000Z", "Asia/Jakarta");

// Offset input — normalized to Z
const fromOffice = instantOf("2026-08-22T09:30:00+07:00", "Asia/Jakarta");
// fromOffice.instant === "2026-08-22T02:30:00Z"

// Interop only — prefer ISO strings at API edge
const fromDate = instantOf(new Date(), "Europe/Paris");
```

`timezone` is **reporting context** — not a second source of when the event happened.

### Wall (when it will happen)

```ts
const due = wallOf("2026-09-15T00:00:00", "Europe/Paris");

const standup = wallOf(
  {
    year: 2026,
    month: 6,
    day: 15,
    hour: 9,
    minute: 0,
    second: 0,
    millisecond: 0,
  },
  "Europe/Paris",
);
```

Rejected: `2026-09-15T00:00:00Z` (that is instant semantics).

---

## Step 3 — Use in domain logic

### Transaction date label

```ts
const transactionDate = toLocalDateString(posted);
// "YYYY-MM-DD" in posted.timezone
```

### Sort / compare events

```ts
compareInstant(eventA, eventB); // -1 | 0 | 1
```

### Fire a one-shot reminder from due wall time

```ts
const fireAt = wallToInstantOnce(due);
// use fireAt.instant for job queue — keep due as wall in DB
```

### Display helpers

```ts
import { formatInstant, formatWall } from "@eristack/timestamp";

formatInstant(posted, { style: "datetime" });
formatWall(due);
```

---

## Step 4 — Wire JSON (APIs and JSON columns)

Canonical shape — full rules in [Serialization](./serialization.md).

```ts
const payload = {
  postedAt: timestampToJSON(posted),
  dueAt: timestampToJSON(due),
};

const revivedPosted = parseTimestamp(payload.postedAt);
const revivedDue = parseTimestamp(payload.dueAt);
```

Validate untrusted input:

```ts
validateTimestampJSON(req.body.postedAt, "postedAt");
```

---

## Step 5 — Tests

```ts
import { setClock, resetClock, now } from "@eristack/timestamp";
import { Temporal } from "@js-temporal/polyfill";

beforeEach(() => {
  setClock(() => Temporal.Instant.from("2026-01-15T12:00:00Z"));
});

afterEach(() => resetClock());

expect(now("UTC").instant).toBe("2026-01-15T12:00:00Z");
```

---

## Step 6 — HTTP handler (REST adapter)

```ts
import {
  parseTimestampJSON,
  serializeTimestamp,
  RestTimestampFieldError,
} from "@eristack/timestamp/rest";

app.post("/invoices", (req, res) => {
  try {
    const postedAt = parseTimestampJSON(req.body.postedAt, "postedAt");
    const dueAt = parseTimestampJSON(req.body.dueAt, "dueAt");
    // persist via drizzle instantField / wallField pack()
    res.json({
      postedAt: serializeTimestamp(postedAt),
      dueAt: serializeTimestamp(dueAt),
    });
  } catch (error) {
    if (error instanceof RestTimestampFieldError) {
      return res.status(400).json({ issues: error.issues });
    }
    throw error;
  }
});
```

Express/Nest thin wrappers: [Express](./express.md) · [Nest](./nest.md).

---

## Production path

| Layer | Subpath | Guide |
| --- | --- | --- |
| SQL | `./drizzle` | [Drizzle](./drizzle.md) |
| Wire / contracts | `./rest`, `./zod` | [REST](./rest.md) · [Zod](./zod.md) |
| HTTP | `./express`, `./nest` | [Express](./express.md) · [Nest](./nest.md) |
| Browser | `./client`, `./react` | [Client](./client.md) · [React](./react.md) |

Overview: [Adapters](./adapters.md).

---

## Read next

- [Instant mode](./instant.md) — deep dive
- [Wall mode](./wall.md) — DST
- [Recipes](./recipes.md) — ERP copy-paste
- [Gotchas](./gotchas.md) — before prod
