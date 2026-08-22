import { Temporal } from "../engine/temporal.js";
import type { ZonedInstant } from "./zoned-instant.js";

export type LocalParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
};

export function toLocalParts(ts: ZonedInstant): LocalParts {
  const zdt = Temporal.Instant.from(ts.instant).toZonedDateTimeISO(ts.timezone);
  return {
    year: zdt.year,
    month: zdt.month,
    day: zdt.day,
    hour: zdt.hour,
    minute: zdt.minute,
    second: zdt.second,
    millisecond: zdt.millisecond,
  };
}

/** `YYYY-MM-DD` in `ts.timezone` — typical transaction_date label. */
export function toLocalDateString(ts: ZonedInstant): string {
  const zdt = Temporal.Instant.from(ts.instant).toZonedDateTimeISO(ts.timezone);
  return zdt.toPlainDate().toString();
}
