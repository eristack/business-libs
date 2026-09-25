import { TimestampParseError } from "./errors/index.js";
import { instantOf, isZonedInstant, type ZonedInstant } from "./instant/zoned-instant.js";
import { now } from "./now.js";
import {
  isTimestampJSONShape,
  timestampFromJSON,
  type Timestamp,
  type TimestampJSON,
} from "./serialize/json.js";
import { assertTimeZoneId, type TimeZoneId } from "./timezone/registry.js";
import { isWallClock } from "./wall/wall-clock.js";
import { wallToInstantOnce } from "./wall/to-instant-once.js";

/**
 * Turn wire JSON, a typed Timestamp, or undefined into a UTC fact (ZonedInstant).
 * Prefer this at API boundaries when the UI may send wall `postedAt` JSON.
 */
export function asInstant(
  input: TimestampJSON | Timestamp | undefined,
  timezone: TimeZoneId,
): ZonedInstant {
  assertTimeZoneId(timezone);
  if (input === undefined) {
    return now(timezone);
  }
  if (isZonedInstant(input)) {
    return input;
  }
  if (isWallClock(input)) {
    return wallToInstantOnce(input);
  }
  if (isTimestampJSONShape(input)) {
    const ts = timestampFromJSON(input);
    if (ts.kind === "wall") {
      return wallToInstantOnce(ts);
    }
    return instantOf(ts.instant, ts.timezone);
  }
  throw new TimestampParseError(
    "asInstant expected TimestampJSON, ZonedInstant, WallClock, or undefined",
  );
}
