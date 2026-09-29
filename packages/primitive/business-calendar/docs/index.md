---
title: Overview
description: Business-day math on YYYY-MM-DD wall dates — weekends, holidays, next/add business days — with no time zones and no Date objects leaking into your domain.
---

# @eristack/business-calendar

"Net 30 business days", "deliver next working day", "posting date must be a business day" — all of it is date arithmetic over a **set of non-working days**. This package does exactly that on plain `YYYY-MM-DD` strings.

Wall dates on purpose: a due date of `2026-10-05` is the same in Jakarta and New York. There is no instant, no zone, no DST — so the answer is the same in the browser, the API, and SQL.

## Use it when

- Computing due dates, SLA deadlines, delivery promises in business days.
- Guarding a posting/transaction date ("must be a working day") — pair with `@eristack/fiscal-calendar` period checks.
- Rolling a weekend/holiday date forward to the next business day.

## Not for

- Instants or time-of-day (`posted_at`) — `@eristack/timestamp`.
- Fiscal periods and period close — `@eristack/fiscal-calendar` (compose in the app; neither imports the other).
- Recurring holiday rules ("first Monday of May") — precompute the dates per year in the app and pass them in.
- Per-country holiday data — bring your own list (a `holidays` table keyed by country/tenant).

## Install

```bash
pnpm add @eristack/business-calendar
pnpm add zod            # only for @eristack/business-calendar/zod
```

## 30-second example

```ts
import { createBusinessCalendar } from "@eristack/business-calendar";

const cal = createBusinessCalendar({
  weekendDays: [0, 6],                          // Sun, Sat
  holidays: ["2026-01-01", "2026-12-25"],
});

cal.isBusinessDay("2026-01-01");        // false — holiday
cal.isBusinessDay("2026-01-03");        // false — Saturday
cal.nextBusinessDay("2026-01-01");      // "2026-01-02"
cal.addBusinessDays("2026-12-24", 1);   // "2026-12-28" (skips 25th holiday + weekend)
cal.addBusinessDays("2026-01-05", -1);  // "2026-01-02" — negative walks backward
```

## API

| Export | Signature | Notes |
| --- | --- | --- |
| `createBusinessCalendar` | `(opts: { weekendDays: number[]; holidays: string[] }) => BusinessCalendar` | Validates `weekendDays` (integers 0–6) and each holiday (normalized). Holidays are a `Set` — duplicates fine. |
| `BusinessCalendar.isBusinessDay` | `(date: string) => boolean` | Not a holiday and not a weekend day. |
| `BusinessCalendar.nextBusinessDay` | `(date: string) => WallDate` | Strictly after `date` — if `date` is itself a business day you still get the next one. |
| `BusinessCalendar.addBusinessDays` | `(date: string, days: number) => WallDate` | `days` must be an integer; `0` returns the normalized input unchanged (even on a weekend); negative counts backward. |
| `normalizeWallDate` | `(value: string) => WallDate` | Trims, requires `YYYY-MM-DD`, rejects impossible dates (`2026-02-30`). |
| `addWallDays` | `(date: WallDate, days: number) => WallDate` | Plain calendar days (no weekend/holiday logic). |
| `wallDateDayOfWeek` | `(date: WallDate) => number` | 0=Sun … 6=Sat. |
| `WallDate` | `string` | Alias for documentation; same shape as `@eristack/timestamp` wall dates. |
| `BusinessCalendarParseError` | `Error` with `code: "BUSINESS_CALENDAR_PARSE_ERROR"` | Bad date shape, bad weekday index, non-integer `days`. |
| `wallDateSchema`, `businessCalendarOptionsSchema` | Zod, from `./zod` | `wallDateSchema` transforms via `normalizeWallDate`. |

## Works with

- `@eristack/timestamp` — take `wallOf(...).local.slice(0, 10)` (or the local date of an instant in the tenant zone), feed the string here, hand the result back. Core never imports timestamp.
- `@eristack/fiscal-calendar` — `assertPeriodOpen(findPeriodForDate(cal, wall))` **and** `cal.isBusinessDay(date)` in the same posting guard.
- `@eristack/pbac` — wrap the guard as a business policy on document transitions.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/business-calendar#business-calendar-core`
- Recipe: `posting-date-guard`.

## Next

- [Getting started](./getting-started.md) — tenant holiday table, due-date service, posting guard, and Zod.
