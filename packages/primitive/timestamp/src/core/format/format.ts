import { Temporal } from "../engine/temporal.js";
import type { ZonedInstant } from "../instant/zoned-instant.js";
import type { WallClock } from "../wall/wall-clock.js";

export type FormatInstantOptions = {
  style?: "iso" | "date" | "datetime";
  locale?: string;
};

export function formatInstant(
  ts: ZonedInstant,
  options?: FormatInstantOptions,
): string {
  const zdt = Temporal.Instant.from(ts.instant).toZonedDateTimeISO(ts.timezone);
  const style = options?.style ?? "iso";

  if (style === "iso") {
    return ts.instant;
  }
  if (style === "date") {
    return zdt.toPlainDate().toString();
  }
  return zdt.toPlainDateTime().toString();
}

export function formatWall(ts: WallClock): string {
  return ts.local;
}
