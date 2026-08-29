---
title: "@eristack/fiscal-calendar"
description: Fiscal years and periods with open/closed flags on wall dates
sidebar_position: 1
---

# @eristack/fiscal-calendar

`@eristack/fiscal-calendar` models **fiscal years and posting periods** with **open/closed** status. Period boundaries are **wall local dates** (`YYYY-MM-DD`) interpreted in an IANA timezone via `@eristack/timestamp` — no raw `Date` timezone math.

## When to use it

Use this package when you need:

- Resolve which fiscal period a journal or invoice **posting date** falls in
- Block GL posting when a period is **closed**
- List open periods for date pickers and admin close workflows
- Validate calendar JSON from Drizzle/API with Zod 4 schemas
- Pair period **close** with `@eristack/doc-transitions` `lockGraph` for HTTP transitions

## What it is not

- **Not a GL engine** — journal posting stays in `@eristack/financial-ledger`; this package gates **when** dates are allowed
- **Not calendar generation** — you define years and periods (12× monthly, 4-4-5, etc.) in app data; the library validates and queries
- **Not instant/UTC facts** — posting dates are **wall** local dates in the calendar timezone

## Subpaths

```text
@eristack/fiscal-calendar              core — createFiscalCalendar, findPeriodForDate, assertPeriodOpen
        └── /zod                       fiscalCalendarSchema, fiscalPeriodSchema (peer zod ^4)
```

## Next steps

- [Getting started](./getting-started.md) — define a calendar and find a period
- [Concepts](./concepts.md) — FiscalDate, wall dates, calendar definition
- [Periods & status](./periods-and-status.md) — open/closed, close workflow, lockGraph
- [Zod](./zod.md) — API and Drizzle JSON validation
- [Gotchas](./gotchas.md) — timezone mismatch, gaps, status vs lockGraph
- [Recipes](./recipes.md) — journal post guard, period close, list open periods
- [API reference](./api-reference.md) — exports cheat-sheet
