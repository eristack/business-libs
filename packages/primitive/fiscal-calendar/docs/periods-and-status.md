# Periods & status

## PeriodStatus

```ts
type PeriodStatus = "open" | "closed";
```

| Status | Posting |
| --- | --- |
| `open` | Allowed — `assertPeriodOpen` is a no-op |
| `closed` | Blocked — `assertPeriodOpen` throws `FiscalCalendarError` |

Status lives on each `FiscalPeriod` row. Update it when finance completes period close — typically in the same transaction that runs final GL reconciliation.

## assertPeriodOpen

Call **after** `findPeriodForDate` on every posting path:

```ts
const period = findPeriodForDate(calendar, postingWall);
if (!period) {
  throw new BusinessError("POSTING_DATE_OUT_OF_RANGE");
}
assertPeriodOpen(period);
```

Message includes period id and `fiscalYear-P{periodNumber}` for support logs.

## Posting date out of range

When `findPeriodForDate` returns **`undefined`**, the wall date falls in a **gap** between defined periods or outside the calendar entirely. Treat as a business error — do not default to the nearest period:

```ts
const period = findPeriodForDate(calendar, postingWall);
if (!period) {
  return { status: 400, body: jsonError("BUSINESS_POLICY_DENIED", "No fiscal period for posting date") };
}
assertPeriodOpen(period);
```

Gap detection is why `createFiscalCalendar` rejects overlapping periods but **allows gaps** — apps may run 4-4-5 calendars with deliberate spacing during year-end setup.

## listPeriods filters

```ts
listPeriods(calendar);                              // all periods, flat order = year order then definition order
listPeriods(calendar, { fiscalYear: 2026 });        // one FY
listPeriods(calendar, { status: "open" });          // open only
listPeriods(calendar, { fiscalYear: 2026, status: "open" });
```

Use open periods for:

- Posting date picker max/min hints
- Admin "periods awaiting close" dashboards
- Batch jobs that must skip closed FY buckets

## Pair with doc-transitions lockGraph

`@eristack/doc-transitions` `lockGraph` models **reversible** lock transitions for HTTP/API:

| lockGraph status | Typical fiscal mapping |
| --- | --- |
| `unlocked` | `status: "open"` |
| `locked` | `status: "closed"` |

```ts
import { lockGraph, registerTransitionGraph } from "@eristack/doc-transitions";

registerTransitionGraph(pbac, { entityKey: "fiscal-period", graph: lockGraph });
// PATCH /fiscal-periods/:id/lock   → handler sets status closed in DB
// PATCH /fiscal-periods/:id/unlock → handler sets status open (admin only)
```

**Division of labor:**

- **fiscal-calendar** — pure lookup + `assertPeriodOpen` on wall dates (core, tests, BE guards)
- **doc-transitions** — which PATCH actions are allowed (`lock` / `unlock`) via `@eristack/pbac`
- **App Drizzle** — source of truth for `status`; reload calendar definition after transition

Do not rely on PBAC alone without updating `FiscalPeriod.status` — handlers must persist closed state so `findPeriodForDate` + `assertPeriodOpen` stay consistent.

## Close workflow (sketch)

1. Admin lists open periods: `listPeriods(cal, { status: "open" })`
2. Pre-close checks (app): unposted journals, draft invoices in period date range
3. `PATCH …/lock` authorized by pbac → transaction updates period row `status: "closed"`
4. Subsequent posts: `assertPeriodOpen` throws; map to `409` / `BUSINESS_POLICY_DENIED` with `@eristack/pbac` or app error envelope

## Reopen

Rare and policy-heavy. `lockGraph` allows `unlock` → set `status: "open"` in handler. Audit log in app — fiscal-calendar does not track history.

## Gaps between periods

If a posting date falls in a gap (no period covers that wall date), `findPeriodForDate` returns `undefined`. Treat as configuration error — do not post. Seed contiguous periods per fiscal year in migrations.
