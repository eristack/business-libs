import {
  TimestampGapError,
  TimestampOverlapError,
  TimestampParseError,
} from "../errors/index.js";
import { instantOf } from "../instant/zoned-instant.js";
import type { ZonedInstant } from "../instant/zoned-instant.js";
import {
  plainDateTimeFromWall,
  type WallClock,
} from "./wall-clock.js";

export type Disambiguation = "earlier" | "later";

function classifyWallAmbiguity(
  local: string,
  timezone: string,
): "gap" | "overlap" {
  const pdt = plainDateTimeFromWall({ kind: "wall", local, timezone });
  const earlier = pdt.toZonedDateTime(timezone, { disambiguation: "earlier" });
  const later = pdt.toZonedDateTime(timezone, { disambiguation: "later" });
  const matchesEarlier = earlier.toPlainDateTime().toString() === local;
  const matchesLater = later.toPlainDateTime().toString() === local;
  if (matchesEarlier && matchesLater) {
    return "overlap";
  }
  return "gap";
}

/**
 * Resolve a single wall-clock occurrence to UTC instant mode.
 * DST gap/overlap throws unless `disambiguation` is provided.
 */
export function wallToInstantOnce(
  ts: WallClock,
  options?: { disambiguation?: Disambiguation },
): ZonedInstant {
  const pdt = plainDateTimeFromWall(ts);
  const disambiguation = options?.disambiguation ?? "reject";

  try {
    const zdt = pdt.toZonedDateTime(ts.timezone, { disambiguation });
    return instantOf(zdt.toInstant().toString(), ts.timezone);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (disambiguation === "reject" && /multiple instant/i.test(message)) {
      const kind = classifyWallAmbiguity(ts.local, ts.timezone);
      if (kind === "overlap") {
        throw new TimestampOverlapError(
          `Local time ${ts.local} is ambiguous in ${ts.timezone}`,
        );
      }
      throw new TimestampGapError(
        `Local time ${ts.local} does not exist in ${ts.timezone}`,
      );
    }
    if (/non-existent|does not exist|gap/i.test(message)) {
      throw new TimestampGapError(
        `Local time ${ts.local} does not exist in ${ts.timezone}: ${message}`,
      );
    }
    if (/ambiguous|overlap|multiple instant/i.test(message)) {
      throw new TimestampOverlapError(
        `Local time ${ts.local} is ambiguous in ${ts.timezone}: ${message}`,
      );
    }
    throw new TimestampParseError(message);
  }
}
