import { TimestampParseError } from "../errors/index.js";
import { Temporal } from "../engine/temporal.js";
import type { LocalParts } from "../instant/local-parts.js";
import {
  assertTimeZoneId,
  type TimeZoneId,
} from "../timezone/registry.js";

export type WallClock = {
  readonly kind: "wall";
  /** Local ISO-8601 without offset or Z */
  readonly local: string;
  readonly timezone: TimeZoneId;
};

const HAS_OFFSET = /(?:[zZ]|[+-]\d{2}:\d{2})$/;

export function wallOf(
  local: string | LocalParts,
  timezone: TimeZoneId,
): WallClock {
  assertTimeZoneId(timezone);
  let localString: string;
  if (typeof local === "string") {
    assertWallLocalString(local);
    localString = normalizeWallLocalString(local);
  } else {
    const pdt = Temporal.PlainDateTime.from({
      year: local.year,
      month: local.month,
      day: local.day,
      hour: local.hour,
      minute: local.minute,
      second: local.second,
      millisecond: local.millisecond,
    });
    localString = pdt.toString();
  }
  return { kind: "wall", local: localString, timezone };
}

export function assertWallLocalString(local: string): void {
  if (typeof local !== "string" || local.length === 0) {
    throw new TimestampParseError("wall local must be a non-empty string");
  }
  if (HAS_OFFSET.test(local.trim())) {
    throw new TimestampParseError(
      "wall local must not include Z or UTC offset — use instant mode instead",
    );
  }
}

export function normalizeWallLocalString(local: string): string {
  const trimmed = local.trim();
  Temporal.PlainDateTime.from(trimmed);
  return trimmed;
}

export function isWallClock(value: unknown): value is WallClock {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as WallClock).kind === "wall" &&
    typeof (value as WallClock).local === "string" &&
    typeof (value as WallClock).timezone === "string"
  );
}

export function plainDateTimeFromWall(ts: WallClock): Temporal.PlainDateTime {
  return Temporal.PlainDateTime.from(ts.local);
}
