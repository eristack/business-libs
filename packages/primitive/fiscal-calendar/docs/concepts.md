# Concepts

## FiscalDate

```ts
type FiscalDate = string; // YYYY-MM-DD wall local date, no time component
```

Period `start` and `end` are **inclusive** wall dates. No `Date` objects in the domain model — same string-first style as `@eristack/money` amounts.

## FiscalPeriod

```ts
type FiscalPeriod = {
  id: string;
  fiscalYear: number;
  periodNumber: number;
  start: FiscalDate;
  end: FiscalDate;
  status: PeriodStatus; // "open" | "closed"
};
```

- **id** — stable key for Drizzle rows and doc-transitions entity ids
- **fiscalYear** / **periodNumber** — reporting labels (`2026-P1`)
- **status** — posting guard via `assertPeriodOpen`; not the same string as doc-transitions `locked` (see [Periods & status](./periods-and-status.md))

## FiscalCalendarDefinition

```ts
type FiscalCalendarDefinition = {
  id: string;
  timezone: string; // IANA, e.g. "Asia/Jakarta"
  years: readonly FiscalYearDefinition[];
};
```

One calendar per company (or per ledger book). All period lookups require a `WallClock` in **the same timezone** as the calendar.

## Wall dates from @eristack/timestamp

Posting dates in ERP are usually **wall intent** (user picks "2026-01-15" in company timezone):

```ts
import { wallOf } from "@eristack/timestamp";

const date = wallOf("2026-01-15T00:00:00", calendar.timezone);
findPeriodForDate(calendar, date);
```

`findPeriodForDate` uses `isWallInRange` from timestamp plus a string fallback on `local` date slice — boundaries are inclusive.

## createFiscalCalendar

Validates structure at load time:

- Periods within each fiscal year must not overlap (sorted by `start`, `curr.start > prev.end`)
- Returns the same definition object (identity) when valid

Does **not** auto-fill gaps between periods or generate 12 months — app seeds period rows from admin config or migration scripts.

## Errors

`FiscalCalendarError` — timezone mismatch, overlapping periods, closed period on `assertPeriodOpen`, or structural validation failures.
