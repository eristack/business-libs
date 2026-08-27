import { TimestampParseError } from "../errors/index.js";
import { Temporal } from "../engine/temporal.js";
import type { WallClock } from "./wall-clock.js";
import { plainDateTimeFromWall } from "./wall-clock.js";

function assertSameWallTimezone(a: WallClock, b: WallClock): void {
  if (a.timezone !== b.timezone) {
    throw new TimestampParseError(
      `compareWall requires the same timezone (got ${a.timezone} and ${b.timezone})`,
    );
  }
}

/** Timeline order of two wall clocks in the same IANA zone (-1 | 0 | 1). */
export function compareWall(a: WallClock, b: WallClock): -1 | 0 | 1 {
  assertSameWallTimezone(a, b);
  return Temporal.PlainDateTime.compare(
    plainDateTimeFromWall(a),
    plainDateTimeFromWall(b),
  ) as -1 | 0 | 1;
}

/** Inclusive range check — start and end must share `w.timezone`. */
export function isWallInRange(
  w: WallClock,
  start: WallClock,
  end: WallClock,
): boolean {
  if (w.timezone !== start.timezone || w.timezone !== end.timezone) {
    throw new TimestampParseError(
      "isWallInRange requires start, end, and value in the same timezone",
    );
  }
  return compareWall(w, start) >= 0 && compareWall(w, end) <= 0;
}
