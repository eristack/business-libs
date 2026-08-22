import type { Timestamp } from "../core/serialize/json.js";
import { parseTimestamp } from "../core/parse/parse.js";
import { isTimestampJSONShape } from "../core/serialize/json.js";

export function reviveTimestamp(value: unknown): Timestamp {
  return parseTimestamp(value);
}

export function reviveTimestampFields<T extends Record<string, unknown>>(
  value: T,
  fields: readonly (keyof T & string)[],
): T {
  const out = { ...value };
  for (const field of fields) {
    const raw = value[field];
    if (raw == null) continue;
    (out as Record<string, unknown>)[field] = reviveTimestamp(raw);
  }
  return out;
}

export function isTimestampJSON(value: unknown): boolean {
  return isTimestampJSONShape(value);
}
