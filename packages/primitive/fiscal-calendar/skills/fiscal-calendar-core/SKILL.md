---
name: fiscal-calendar-core
description: >
  @eristack/fiscal-calendar fiscal years and open/closed periods on @eristack/timestamp
  wall dates — findPeriodForDate, assertPeriodOpen, listPeriods. Pair with doc-transitions
  lockGraph for period close.
metadata:
  author: eristack
  version: "0.1"
sources:
  - packages/primitive/fiscal-calendar/docs/index.md
---

# @eristack/fiscal-calendar

Fiscal **years and posting periods** with `open` | `closed` status on **wall local dates** (`YYYY-MM-DD`) in an IANA timezone.

```ts
import { findPeriodForDate, assertPeriodOpen, createFiscalCalendar } from "@eristack/fiscal-calendar";
import { wallOf } from "@eristack/timestamp";

const cal = createFiscalCalendar({ id: "co-a", timezone: "Asia/Jakarta", years: [...] });
const period = findPeriodForDate(cal, wallOf("2026-01-15T00:00:00", "Asia/Jakarta"));
assertPeriodOpen(period!);
```

## Checklist

1. Store calendar definition in Drizzle — app seeds periods (monthly, 4-4-5, etc.).
2. `createFiscalCalendar` on load — catches overlapping periods per fiscal year.
3. Posting guard: `wallOf(localDate + "T00:00:00", calendar.timezone)` → `findPeriodForDate` → `assertPeriodOpen` before GL post.
4. Period close HTTP: `@eristack/doc-transitions` `lockGraph` + handler sets `status: "closed"` — map `locked`/`unlocked` to `closed`/`open`.
5. Validate API JSON with `@eristack/fiscal-calendar/zod` — then `createFiscalCalendar`.

## Exports

`createFiscalCalendar`, `findPeriodForDate`, `assertPeriodOpen`, `listPeriods`, `FiscalCalendarError`, types `FiscalCalendarDefinition`, `FiscalPeriod`, `PeriodStatus`.

## Do not

- Use raw `Date` timezone math — `@eristack/timestamp` wall mode only
- Confuse `lockGraph` statuses with `PeriodStatus` strings
- Expect auto-generated 12-month calendars — app owns period rows
- Replace `@eristack/financial-ledger` — this package gates dates only
