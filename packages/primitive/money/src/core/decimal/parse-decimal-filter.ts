import { ParseError } from "../errors/index.js";

const DECIMAL_STRING = /^-?\d+(?:\.\d+)?$/;

/**
 * Normalize a decimal filter operand — rejects JSON numbers (use strings in forms/API).
 */
export function parseDecimalFilter(value: unknown, path = "value"): string {
  if (typeof value === "number") {
    throw new ParseError(
      `${path} must be a decimal string, not a JSON number`,
    );
  }
  if (typeof value !== "string") {
    throw new ParseError(`${path} must be a decimal string`);
  }
  const trimmed = value.trim();
  if (!DECIMAL_STRING.test(trimmed)) {
    throw new ParseError(`${path} is not a valid decimal string`);
  }
  return trimmed;
}
