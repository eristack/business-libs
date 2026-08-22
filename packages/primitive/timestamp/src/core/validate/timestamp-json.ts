import type { TimestampJSON } from "../serialize/json.js";
import { TimestampParseError } from "../errors/index.js";
import { Temporal } from "../engine/temporal.js";
import { normalizeInstantString } from "../instant/zoned-instant.js";
import {
  assertWallLocalString,
  normalizeWallLocalString,
} from "../wall/wall-clock.js";
import { assertTimeZoneId } from "../timezone/registry.js";

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

/**
 * Validate wire shape only — does not run full Temporal resolution.
 * Shared by `@eristack/timestamp/rest` and `@eristack/timestamp/zod`.
 */
export function validateTimestampJSON(
  value: unknown,
  path = "timestamp",
): TimestampJSON {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TimestampParseError(`${path} must be an object`);
  }

  const record = value as Record<string, unknown>;
  const kind = record.kind;

  if (kind !== "instant" && kind !== "wall") {
    throw new TimestampParseError(`${path}.kind must be "instant" or "wall"`);
  }

  if (typeof record.timezone !== "string") {
    throw new TimestampParseError(`${path}.timezone must be a string`);
  }
  assertTimeZoneId(record.timezone);

  if (kind === "instant") {
    if (typeof record.instant !== "string") {
      throw new TimestampParseError(`${path}.instant must be a string`);
    }
    let normalized: string;
    try {
      normalized = normalizeInstantString(
        Temporal.Instant.from(record.instant).toString(),
      );
    } catch {
      throw new TimestampParseError(`${path}.instant is invalid`);
    }
    return {
      kind: "instant",
      instant: normalized,
      timezone: record.timezone,
    };
  }

  if (typeof record.local !== "string") {
    throw new TimestampParseError(`${path}.local must be a string`);
  }
  assertWallLocalString(record.local);
  return {
    kind: "wall",
    local: normalizeWallLocalString(record.local),
    timezone: record.timezone,
  };
}
