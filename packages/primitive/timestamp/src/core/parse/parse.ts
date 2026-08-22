import { TimestampParseError } from "../errors/index.js";
import { isZonedInstant } from "../instant/zoned-instant.js";
import { isWallClock } from "../wall/wall-clock.js";
import {
  timestampFromJSON,
  type Timestamp,
} from "../serialize/json.js";
import { validateTimestampJSON } from "../validate/timestamp-json.js";

export function parseTimestamp(input: unknown): Timestamp {
  if (isZonedInstant(input) || isWallClock(input)) {
    return input;
  }
  const json = validateTimestampJSON(input);
  return timestampFromJSON(json);
}

export function isTimestamp(value: unknown): value is Timestamp {
  return isZonedInstant(value) || isWallClock(value);
}

export function equalTimestamp(a: Timestamp, b: Timestamp): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === "instant" && b.kind === "instant") {
    return a.instant === b.instant && a.timezone === b.timezone;
  }
  if (a.kind === "wall" && b.kind === "wall") {
    return a.local === b.local && a.timezone === b.timezone;
  }
  return false;
}

export function tryParseTimestamp(input: unknown): Timestamp | null {
  try {
    return parseTimestamp(input);
  } catch {
    return null;
  }
}

export function parseTimestampOrThrow(
  input: unknown,
  message = "Invalid timestamp",
): Timestamp {
  try {
    return parseTimestamp(input);
  } catch (error) {
    if (error instanceof TimestampParseError) {
      throw error;
    }
    throw new TimestampParseError(message);
  }
}
