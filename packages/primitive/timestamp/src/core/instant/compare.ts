import { Temporal } from "../engine/temporal.js";
import type { ZonedInstant } from "./zoned-instant.js";

export function compareInstant(
  a: ZonedInstant,
  b: ZonedInstant,
): -1 | 0 | 1 {
  const left = Temporal.Instant.from(a.instant);
  const right = Temporal.Instant.from(b.instant);
  return Temporal.Instant.compare(left, right);
}
