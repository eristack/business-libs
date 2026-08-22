import type { Timestamp } from "../core/serialize/json.js";
import type { TimestampJSON } from "../core/serialize/json.js";
import { timestampToJSON } from "../core/serialize/json.js";
import { parseTimestamp } from "../core/parse/parse.js";
import { TimestampParseError } from "../core/errors/index.js";

export function timestampFormValue(ts: Timestamp): TimestampJSON {
  return timestampToJSON(ts);
}

export function parseTimestampFormValue(
  value: unknown,
  path = "timestamp",
): Timestamp {
  try {
    return parseTimestamp(value);
  } catch (error) {
    if (error instanceof TimestampParseError) {
      throw error;
    }
    throw new TimestampParseError(
      error instanceof Error ? error.message : `${path}: invalid timestamp`,
    );
  }
}

export type TimestampFieldValidatorOptions = {
  required?: boolean;
  kind?: "instant" | "wall";
};

export function createTimestampFieldValidators(
  options: TimestampFieldValidatorOptions = {},
) {
  return {
    onChange: ({ value }: { value: unknown }) => {
      if (value == null || value === "") {
        if (options.required) return "Timestamp is required";
        return undefined;
      }
      try {
        const ts = parseTimestampFormValue(value);
        if (options.kind && ts.kind !== options.kind) {
          return `Expected ${options.kind} timestamp`;
        }
        return undefined;
      } catch (error) {
        return error instanceof TimestampParseError
          ? error.message
          : "Invalid timestamp";
      }
    },
    onSubmit: ({ value }: { value: unknown }) => {
      if (value == null || value === "") {
        if (options.required) return "Timestamp is required";
        return undefined;
      }
      try {
        parseTimestampFormValue(value);
        return undefined;
      } catch (error) {
        return error instanceof TimestampParseError
          ? error.message
          : "Invalid timestamp";
      }
    },
  };
}

export function submitTimestampFormValue(value: unknown): Timestamp {
  return parseTimestampFormValue(value);
}

export {
  timestampJSONSchema,
  instantJSONSchema,
  wallJSONSchema,
} from "../zod/schemas.js";
