---
title: Getting started
description: Load holidays from a tenant table, build one calendar per request, compute due dates, and guard posting dates alongside fiscal periods.
---

# Getting started

## Install

```bash
pnpm add @eristack/business-calendar zod
```

## Holidays are data; the calendar is a function of that data

Do not hard-code holiday arrays. Store them per tenant (and per country if you operate in several), load, build:

```ts
// schema.ts (app-owned)
import { pgTable, text, date, uniqueIndex } from "drizzle-orm/pg-core";

export const holidays = pgTable(
  "holidays",
  {
    id: entityIdColumn("pgsql", "id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    day: date("day", { mode: "string" }).notNull(),     // "YYYY-MM-DD" — same shape as WallDate
    label: text("label"),
  },
  (t) => [uniqueIndex("holidays_tenant_day_uq").on(t.tenantId, t.day)],
);
```

```ts
// calendar.service.ts
import { createBusinessCalendar, type BusinessCalendar } from "@eristack/business-calendar";

export async function calendarFor(tenantId: string, year: number): Promise<BusinessCalendar> {
  const rows = await db.query.holidays.findMany({
    where: (t, { and, eq, gte, lte }) =>
      and(eq(t.tenantId, tenantId), gte(t.day, `${year - 1}-12-01`), lte(t.day, `${year + 1}-01-31`)),
  });
  const settings = await loadTenantSettings(tenantId);           // { weekendDays: [5, 6] } for Fri/Sat markets
  return createBusinessCalendar({
    weekendDays: settings.weekendDays,
    holidays: rows.map((r) => r.day),
  });
}
```

Loading a window around the year you compute in keeps `addBusinessDays` correct across New Year without loading every holiday ever. Cache the calendar per `(tenantId, year)` — it is immutable.

## Due dates

```ts
const cal = await calendarFor(tenantId, 2026);

const invoiceDate = "2026-12-24";
const dueDate = cal.addBusinessDays(invoiceDate, 5);   // "2027-01-04" (skips 25th, weekend, 1st)
```

For "N calendar days, but roll forward if it lands on a non-business day":

```ts
import { addWallDays } from "@eristack/business-calendar";

const raw = addWallDays(invoiceDate, 30);
const due = cal.isBusinessDay(raw) ? raw : cal.nextBusinessDay(raw);
```

## Posting-date guard (with fiscal periods)

```ts
import { BusinessCalendarParseError } from "@eristack/business-calendar";

async function assertPostable(tenantId: string, postingDate: string) {
  const cal = await calendarFor(tenantId, Number(postingDate.slice(0, 4)));
  if (!cal.isBusinessDay(postingDate)) {
    throw new BusinessPolicyDenied("POSTING_DATE_NOT_BUSINESS_DAY", { postingDate });
  }
  // @eristack/fiscal-calendar — same YYYY-MM-DD string, wrapped as a wall clock
  const period = findPeriodForDate(fiscal, wallOf(`${postingDate}T00:00:00`, tenantZone));
  if (!period) throw new BusinessPolicyDenied("NO_FISCAL_PERIOD", { postingDate });
  assertPeriodOpen(period);
}
```

Wrap this as a `@eristack/pbac` policy if postings go through document transitions; return the unified 409 envelope (`#http-errors`).

## From `@eristack/timestamp` and back

```ts
import { wallOf } from "@eristack/timestamp";

const wall = wallOf("2026-12-24T09:00:00", "Asia/Jakarta"); // { kind: "wall", local: "2026-12-24T09:00:00", timezone }
const due = cal.addBusinessDays(wall.local.slice(0, 10), 5); // string in, string out
```

Core never imports `@eristack/timestamp`; you pass the `YYYY-MM-DD` slice across.

## Validating input

```ts
import { z } from "zod";
import { wallDateSchema, businessCalendarOptionsSchema } from "@eristack/business-calendar/zod";

const body = z.object({ postingDate: wallDateSchema });        // trims + validates real calendar date
const tenantCalendarSettings = businessCalendarOptionsSchema;   // { weekendDays: int[0..6], holidays: string[] }
```

## Gotchas

- `nextBusinessDay` is **strictly after**: on a Friday it returns Monday, not Friday. Use `isBusinessDay ? date : nextBusinessDay(date)` for "today or next".
- `addBusinessDays(date, 0)` returns the input even if it is a weekend — it does not roll.
- Weekend and holiday are both "non-business"; a holiday on a Saturday costs nothing extra.
- A holiday list that ends in December will make January computations wrong. Load a window, not "this year".
- Day-of-week is UTC calendar math on the date string — correct for wall dates; do not feed it `Date.toISOString()` of a local midnight (that can shift a day).
- `weekendDays: []` is valid (7-day operations); `[0,1,2,3,4,5,6]` makes `nextBusinessDay` loop forever — validate tenant settings.

## Testing

```ts
import { createBusinessCalendar } from "@eristack/business-calendar";
import { expect, it } from "vitest";

const cal = createBusinessCalendar({ weekendDays: [0, 6], holidays: ["2026-12-25"] });

it("skips weekends and holidays", () => {
  expect(cal.addBusinessDays("2026-12-24", 1)).toBe("2026-12-28");
  expect(cal.addBusinessDays("2026-12-28", -1)).toBe("2026-12-24");
});
```
