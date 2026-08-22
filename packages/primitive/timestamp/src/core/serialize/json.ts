import { normalizeInstantString } from "../instant/zoned-instant.js";
import type { ZonedInstant } from "../instant/zoned-instant.js";
import {
  assertWallLocalString,
  normalizeWallLocalString,
  type WallClock,
} from "../wall/wall-clock.js";
import { assertTimeZoneId } from "../timezone/registry.js";

export type InstantJSON = {
  kind: "instant";
  instant: string;
  timezone: string;
};

export type WallJSON = {
  kind: "wall";
  local: string;
  timezone: string;
};

export type TimestampJSON = InstantJSON | WallJSON;

export type Timestamp = ZonedInstant | WallClock;

export function timestampToJSON(ts: Timestamp): TimestampJSON {
  if (ts.kind === "instant") {
    return {
      kind: "instant",
      instant: normalizeInstantString(ts.instant),
      timezone: ts.timezone,
    };
  }
  return {
    kind: "wall",
    local: normalizeWallLocalString(ts.local),
    timezone: ts.timezone,
  };
}

export function timestampFromJSON(json: TimestampJSON): Timestamp {
  assertTimeZoneId(json.timezone);
  if (json.kind === "instant") {
    return {
      kind: "instant",
      instant: normalizeInstantString(json.instant),
      timezone: json.timezone,
    };
  }
  assertWallLocalString(json.local);
  return {
    kind: "wall",
    local: normalizeWallLocalString(json.local),
    timezone: json.timezone,
  };
}

export function isTimestampJSONShape(value: unknown): value is TimestampJSON {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  if (record.kind === "instant") {
    return (
      typeof record.instant === "string" &&
      typeof record.timezone === "string"
    );
  }
  if (record.kind === "wall") {
    return (
      typeof record.local === "string" && typeof record.timezone === "string"
    );
  }
  return false;
}
