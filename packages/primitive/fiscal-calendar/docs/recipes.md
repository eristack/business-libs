# Recipes

## Journal post guard

```ts
import { findPeriodForDate, assertPeriodOpen, FiscalCalendarError } from "@eristack/fiscal-calendar";
import { wallOf } from "@eristack/timestamp";

function assertPostingAllowed(
  calendar: FiscalCalendarDefinition,
  postingLocalDate: string, // YYYY-MM-DD from form
) {
  const wall = wallOf(`${postingLocalDate}T00:00:00`, calendar.timezone);
  const period = findPeriodForDate(calendar, wall);
  if (!period) {
    throw new Error("POSTING_DATE_OUT_OF_RANGE");
  }
  assertPeriodOpen(period);
  return period;
}
```

Call before `@eristack/financial-ledger` post in the same transaction.

## Invoice posting date

Same pattern on invoice publish — use document posting date field, not `created_at`:

```ts
const period = findPeriodForDate(calendar, wallOf(`${invoice.postingDate}T00:00:00`, calendar.timezone));
assertPeriodOpen(period!);
```

## Period close with lockGraph

```ts
import { lockGraph, registerTransitionGraph } from "@eristack/doc-transitions";
import { createPbac } from "@eristack/pbac";

registerTransitionGraph(pbac, { entityKey: "fiscal-period", graph: lockGraph });

// Handler after authorize(lock):
await db.update(fiscalPeriods)
  .set({ status: "closed" })
  .where(eq(fiscalPeriods.id, periodId));
```

Reload calendar definition from DB before next post request.

## Open periods for date picker

```ts
import { listPeriods } from "@eristack/fiscal-calendar";

const open = listPeriods(calendar, { status: "open" });
const minDate = open.reduce((m, p) => (p.start < m ? p.start : m), open[0]!.start);
const maxDate = open.reduce((m, p) => (p.end > m ? p.end : m), open[0]!.end);
// constrain UI picker to [minDate, maxDate] union of open ranges — or per-period pick list
```

## Bootstrap 12 monthly periods (app generator)

Library does not generate — app script example:

```ts
function monthlyPeriods(fy: number): FiscalPeriod[] {
  return Array.from({ length: 12 }, (_, i) => {
    const month = String(i + 1).padStart(2, "0");
    const start = `${fy}-${month}-01`;
    const end = lastDayOfMonth(fy, i + 1); // app helper
    return {
      id: `${fy}-p${String(i + 1).padStart(2, "0")}`,
      fiscalYear: fy,
      periodNumber: i + 1,
      start,
      end,
      status: "open" as const,
    };
  });
}

const calendar = createFiscalCalendar({
  id: "co-a",
  timezone: "Asia/Jakarta",
  years: [{ year: 2026, periods: monthlyPeriods(2026) }],
});
```

## API validation pipeline

```ts
const def = fiscalCalendarSchema.parse(body);
const calendar = createFiscalCalendar(def);
await db.insert(fiscalCalendars).values({ id: def.id, payload: def });
```
