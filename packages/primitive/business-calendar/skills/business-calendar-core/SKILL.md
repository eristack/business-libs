---
name: business-calendar-core
description: >
  @eristack/business-calendar createBusinessCalendar → isBusinessDay / nextBusinessDay /
  addBusinessDays on YYYY-MM-DD wall dates, plus normalizeWallDate/addWallDays. Use for
  due dates, SLA deadlines, and posting-date guards; holidays come from an app table.
  Not instants (@eristack/timestamp) or fiscal periods (@eristack/fiscal-calendar).
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/business-calendar"
sources:
  - packages/primitive/business-calendar/docs/getting-started.md
---

# @eristack/business-calendar

Pure wall-date arithmetic over a set of non-working days. Same answer in browser, API, and SQL because there is no zone.

```ts
import { createBusinessCalendar, addWallDays, normalizeWallDate } from "@eristack/business-calendar";

const cal = createBusinessCalendar({ weekendDays: [0, 6], holidays: rows.map(r => r.day) });
cal.isBusinessDay("2026-12-25");        // false
cal.nextBusinessDay("2026-12-25");      // "2026-12-28" — strictly after
cal.addBusinessDays("2026-12-24", 5);   // "2027-01-04"; negative walks back; 0 = input unchanged
addWallDays("2026-12-24", 30);          // plain calendar days
// errors: BusinessCalendarParseError (code "BUSINESS_CALENDAR_PARSE_ERROR")
```

## Checklist

1. Holidays in an app table `(tenant_id, day date)`; build the calendar per `(tenant, year)` with a window into adjacent years; cache — it is immutable.
2. Weekend days from tenant settings (`[0,6]` Sat/Sun, `[5,6]` Fri/Sat). Reject all-7 (infinite loop).
3. Posting guard: `cal.isBusinessDay(date)` **and** `assertPeriodOpen(findPeriodForDate(fiscal, wallOf(date+"T00:00:00", zone)))` → 409 `BUSINESS_POLICY_DENIED` via `@eristack/pbac`.
4. From `@eristack/timestamp`, pass `wallOf(...).local.slice(0, 10)` across; core never imports timestamp.
5. Validate bodies with `wallDateSchema` from `./zod`.

## Do not

- Hard-code holiday arrays or recurring rules in the library call — precompute dates in the app.
- Use `Date` objects or `toISOString()` slices of local midnights as input.
- Expect `nextBusinessDay` to return the same day; use `isBusinessDay ? d : nextBusinessDay(d)`.
