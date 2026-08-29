# API reference

## Types

| Export | Description |
| --- | --- |
| `FiscalDate` | Wall local date string `YYYY-MM-DD` |
| `PeriodStatus` | `"open"` \| `"closed"` |
| `FiscalPeriod` | Period with id, year, number, start, end, status |
| `FiscalYearDefinition` | `{ year, periods }` |
| `FiscalCalendarDefinition` | `{ id, timezone, years }` |

## Calendar API

| Export | Description |
| --- | --- |
| `createFiscalCalendar(definition)` | Validate non-overlapping periods per year; return definition |
| `findPeriodForDate(calendar, date)` | Lookup period for `WallClock`; `undefined` if none |
| `assertPeriodOpen(period)` | Throw if `status === "closed"` |
| `listPeriods(calendar, options?)` | Filter by `fiscalYear` and/or `status` |
| `FiscalCalendarError` | Error class |

## Dependencies

Uses `@eristack/timestamp`:

- `wallOf` — construct wall clocks for lookup input
- `isWallInRange` — inclusive period boundaries (internal)

## Zod (`@eristack/fiscal-calendar/zod`)

| Export | Description |
| --- | --- |
| `fiscalDateSchema` | Date string |
| `periodStatusSchema` | Open/closed enum |
| `fiscalPeriodSchema` | Period object |
| `fiscalCalendarSchema` | Full calendar |

## Related packages

| Package | Role |
| --- | --- |
| `@eristack/timestamp` | Wall posting dates |
| `@eristack/doc-transitions` | `lockGraph` for period close HTTP |
| `@eristack/financial-ledger` | GL post after period guard |
| `@eristack/pbac` | Authorize lock/unlock transitions |
