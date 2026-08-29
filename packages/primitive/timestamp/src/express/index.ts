import { parseTimestampJSON, serializeTimestamp } from "../rest/index.js";
import { RestTimestampFieldError } from "../rest/errors.js";
import type { Timestamp } from "../core/serialize/json.js";
import { parseWallQueryValue, readWallQuery } from "./parse-wall-query.js";

export { RestTimestampFieldError };
export { parseWallQueryValue, readWallQuery };

export function readTimestamp(value: unknown, path = "timestamp") {
  return parseTimestampJSON(value, path);
}

export function readWallQueryParam(
  query: Record<string, unknown>,
  name: string,
  timezone: string,
) {
  return readWallQuery(query, name, timezone);
}

export function readTimestampField(body: unknown, field: string): Timestamp {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new RestTimestampFieldError(field, "body must be an object");
  }
  return parseTimestampJSON((body as Record<string, unknown>)[field], field);
}

export function sendTimestamp(ts: Timestamp) {
  return serializeTimestamp(ts);
}
