# Gotchas

## Date vs time-of-day

`findPeriodForDate` matches the wall clock's **local calendar date** (`YYYY-MM-DD`), not time-of-day. A posting at `2026-01-31T23:59:59` belongs to January even though it is late in the day — fiscal periods are whole-day boundaries.

`createFiscalCalendar` rejects **start > end** and **overlapping** periods in the same fiscal year at bootstrap — fail fast before posting guards run in production.

`findPeriodForDate` throws if `date.timezone !== calendar.timezone`. Always build wall clocks with the calendar's IANA zone:

```ts
wallOf(`${localDate}T00:00:00`, calendar.timezone);
```

Do not pass UTC instants converted ad hoc — use `@eristack/timestamp` wall mode.

## Gaps in period coverage

Undefined return from `findPeriodForDate` means no period covers that date. Block posting; fix calendar seed data. The library does not infer 12-month calendars.

## Overlapping periods

Caught by `createFiscalCalendar` at load — overlapping `start`/`end` in the same fiscal year throws. Adjacent periods are fine (`end: "2026-01-31"`, next `start: "2026-02-01"`).

## status vs lockGraph vocabulary

Fiscal-calendar uses `open` / `closed`. Doc-transitions `lockGraph` uses `unlocked` / `locked`. Map in your PATCH handlers — do not store lockGraph status strings on `FiscalPeriod.status`.

## assertPeriodOpen on undefined

`assertPeriodOpen` does not check existence — call only when `findPeriodForDate` returned a period. Otherwise handle `undefined` as out-of-range first.

## Reload after close

In-memory calendar caches must refresh after period close. Stale `status: "open"` in cache allows posts that DB would reject — or the reverse if you only update memory.

## Multi-company timezones

Each `FiscalCalendarDefinition` has one `timezone`. Companies in different zones need separate calendar definitions (or app-level calendar pick by ledger).

## Zod vs createFiscalCalendar

`fiscalCalendarSchema` does not detect overlapping periods. Always run `createFiscalCalendar` after parse when loading production definitions.

## Not a substitute for @eristack/timestamp on documents

Invoice `transaction_date` may still use timestamp instant/wall types elsewhere — fiscal lookup needs a **wall date in calendar timezone** aligned with GL posting date policy.
