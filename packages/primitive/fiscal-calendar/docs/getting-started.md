# Getting started

Define a fiscal calendar, resolve posting dates to periods, and guard closed periods.

## Install

```bash
pnpm add @eristack/fiscal-calendar @eristack/timestamp
```

## Minimal calendar

```ts
import {
  createFiscalCalendar,
  findPeriodForDate,
  assertPeriodOpen,
} from "@eristack/fiscal-calendar";
import { wallOf } from "@eristack/timestamp";

const calendar = createFiscalCalendar({
  id: "co-a",
  timezone: "Asia/Jakarta",
  years: [
    {
      year: 2026,
      periods: [
        {
          id: "2026-p01",
          fiscalYear: 2026,
          periodNumber: 1,
          start: "2026-01-01",
          end: "2026-01-31",
          status: "open",
        },
        {
          id: "2026-p02",
          fiscalYear: 2026,
          periodNumber: 2,
          start: "2026-02-01",
          end: "2026-02-28",
          status: "closed",
        },
      ],
    },
  ],
});

const postingDate = wallOf("2026-01-15T10:00:00", "Asia/Jakarta");
const period = findPeriodForDate(calendar, postingDate);
assertPeriodOpen(period!); // throws FiscalCalendarError if closed
```

`createFiscalCalendar` validates **non-overlapping** periods within each fiscal year. Overlaps throw `FiscalCalendarError` at bootstrap.

## List open periods

```ts
import { listPeriods } from "@eristack/fiscal-calendar";

const openIn2026 = listPeriods(calendar, { fiscalYear: 2026, status: "open" });
```

## Zod on APIs

```ts
import { fiscalCalendarSchema } from "@eristack/fiscal-calendar/zod";

const body = fiscalCalendarSchema.parse(req.body);
const calendar = createFiscalCalendar(body);
```

## Production path

1. Store `FiscalCalendarDefinition` (or per-year rows) in Drizzle — app owns migrations and period close UI.
2. Load calendar at request time or cache per company; call `createFiscalCalendar` once after load to validate structure.
3. On journal/invoice post: `wallOf(postingDateLocal + "T00:00:00", calendar.timezone)` → `findPeriodForDate` → `assertPeriodOpen`.
4. Period **close** HTTP action: `@eristack/doc-transitions` `lockGraph` on a `fiscal-period` entity; handler sets `status: "closed"` in DB. See [Periods & status](./periods-and-status.md).

## Next

- [Concepts](./concepts.md) — FiscalDate and wall boundaries
- [Periods & status](./periods-and-status.md) — close workflow with lockGraph
- [Recipes](./recipes.md) — posting guard and admin close
