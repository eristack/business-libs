import type { Timestamp } from "../core/serialize/json.js";
import { timestampFromJSON } from "../core/serialize/json.js";
import type { TimestampJSON } from "../core/serialize/json.js";
import {
  isTimestampJSONShape,
  validateTimestampJSON,
} from "../core/validate/timestamp-json.js";
import {
  TimestampParseError,
  InvalidTimeZoneError,
} from "../core/errors/index.js";
import { RestTimestampFieldError } from "./errors.js";

export function isTimestampJSON(value: unknown): value is TimestampJSON {
  return isTimestampJSONShape(value);
}

export function serializeTimestamp(ts: Timestamp): TimestampJSON {
  if (ts.kind === "instant") {
    return {
      kind: "instant",
      instant: ts.instant,
      timezone: ts.timezone,
    };
  }
  return {
    kind: "wall",
    local: ts.local,
    timezone: ts.timezone,
  };
}

function wrapParseError(path: string, error: unknown): never {
  if (error instanceof TimestampParseError) {
    throw new RestTimestampFieldError(path, error.message);
  }
  if (error instanceof InvalidTimeZoneError) {
    throw new RestTimestampFieldError(path, error.message);
  }
  throw error;
}

export function parseTimestampJSON(value: unknown, path = "timestamp"): Timestamp {
  try {
    const json = validateTimestampJSON(value, path);
    return timestampFromJSON(json);
  } catch (error) {
    wrapParseError(path, error);
  }
}

export function parseTimestampFields(
  body: unknown,
  fields: readonly string[],
): Record<string, Timestamp> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new RestTimestampFieldError("body", "body must be an object");
  }
  const record = body as Record<string, unknown>;
  const out: Record<string, Timestamp> = {};
  for (const field of fields) {
    out[field] = parseTimestampJSON(record[field], field);
  }
  return out;
}

export function serializeTimestampFields(
  values: Record<string, Timestamp | undefined | null>,
): Record<string, TimestampJSON | null | undefined> {
  const out: Record<string, TimestampJSON | null | undefined> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value == null) {
      out[key] = value;
      continue;
    }
    out[key] = serializeTimestamp(value);
  }
  return out;
}

export { validateTimestampJSON } from "../core/validate/timestamp-json.js";
