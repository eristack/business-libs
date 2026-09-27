# Getting started

```bash
pnpm add @eristack/business-calendar
```

```ts
import { createBusinessCalendar } from "@eristack/business-calendar";

const cal = createBusinessCalendar({
  weekendDays: [0, 6],
  holidays: ["2026-01-01", "2026-12-25"],
});

cal.isBusinessDay("2026-01-02"); // true (Fri)
cal.addBusinessDays("2026-01-02", 1); // "2026-01-05" (Mon)
```

Recipe **`posting-date-guard`** — fiscal period + business day + `@eristack/timestamp` wall clocks at the app boundary.
