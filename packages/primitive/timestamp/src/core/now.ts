import { currentInstant } from "./engine/clock.js";
import { instantOf } from "./instant/zoned-instant.js";
import type { TimeZoneId } from "./timezone/registry.js";

export function now(timezone: TimeZoneId = "UTC"): ReturnType<typeof instantOf> {
  return instantOf(currentInstant().toString(), timezone);
}
