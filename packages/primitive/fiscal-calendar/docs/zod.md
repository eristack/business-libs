# Zod

Peer dependency `zod ^4`.

```bash
pnpm add @eristack/fiscal-calendar @eristack/fiscal-calendar/zod zod @eristack/timestamp
```

## Schemas

```ts
import {
  fiscalCalendarSchema,
  fiscalPeriodSchema,
  fiscalDateSchema,
  periodStatusSchema,
} from "@eristack/fiscal-calendar/zod";

const period = fiscalPeriodSchema.parse({
  id: "2026-p01",
  fiscalYear: 2026,
  periodNumber: 1,
  start: "2026-01-01",
  end: "2026-01-31",
  status: "open",
});

const calendar = fiscalCalendarSchema.parse({
  id: "co-a",
  timezone: "Asia/Jakarta",
  years: [{ year: 2026, periods: [period] }],
});
```

| Schema | Validates |
| --- | --- |
| `fiscalDateSchema` | `YYYY-MM-DD` string |
| `periodStatusSchema` | `"open"` \| `"closed"` |
| `fiscalPeriodSchema` | Full period object |
| `fiscalCalendarSchema` | Calendar with ≥1 period per year |

## REST handler

```ts
import { createFiscalCalendar } from "@eristack/fiscal-calendar";
import { fiscalCalendarSchema } from "@eristack/fiscal-calendar/zod";

const raw = fiscalCalendarSchema.parse(req.body);
const calendar = createFiscalCalendar(raw); // overlap check
await db.insert(fiscalCalendars).values({ id: calendar.id, definition: calendar });
```

Zod validates shape and date format — call `createFiscalCalendar` for **non-overlapping** periods within each year.

## Drizzle JSON column

Store parsed definition as JSONB; on read:

```ts
const row = await db.query.fiscalCalendars.findFirst({ where: eq(id, companyId) });
const calendar = createFiscalCalendar(fiscalCalendarSchema.parse(row.definition));
```

## Partial updates

For PATCH on a single period status, use `periodStatusSchema` or a narrow app schema — full `fiscalCalendarSchema` is for bootstrap/replace.
