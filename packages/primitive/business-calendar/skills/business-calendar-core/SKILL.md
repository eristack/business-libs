---
name: business-calendar-core
description: >
  @eristack/business-calendar createBusinessCalendar, isBusinessDay, addBusinessDays on
  YYYY-MM-DD wall dates (Wave 13 E2).
metadata:
  author: eristack
  version: "0.0"
sources:
  - packages/primitive/business-calendar/docs/getting-started.md
---

# @eristack/business-calendar

```ts
import { createBusinessCalendar } from "@eristack/business-calendar";

const cal = createBusinessCalendar({ weekendDays: [0, 6], holidays: [] });
cal.addBusinessDays("2026-01-02", 5);
```

## Checklist

1. Holidays and inputs use **`normalizeWallDate`** shape (`YYYY-MM-DD`).
2. `weekendDays` are 0=Sun … 6=Sat (UTC calendar math).
3. Compose with `@eristack/fiscal-calendar` in app — no hard dep.

## Do not

- Import `@eristack/timestamp` in core — pass wall date strings from adapters
