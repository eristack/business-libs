import { TimestampParseError } from "../core/errors/index.js";
import { wallOf, type WallClock } from "../core/wall/wall-clock.js";

/** Parse a wall local string from a query param (list filters, due-date ranges). */
export function parseWallQueryValue(
  value: unknown,
  timezone: string,
  path = "query",
): WallClock {
  if (typeof value !== "string" || !value.trim()) {
    throw new TimestampParseError(
      `${path} must be a non-empty local datetime string`,
    );
  }
  return wallOf(value.trim(), timezone);
}

export function readWallQuery(
  query: Record<string, unknown>,
  name: string,
  timezone: string,
): WallClock {
  return parseWallQueryValue(query[name], timezone, name);
}
