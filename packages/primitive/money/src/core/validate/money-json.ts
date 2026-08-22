import type { MoneyJSON } from "../serialize/json.js";
import { ParseError } from "../errors/index.js";

export function isMoneyJSONShape(value: unknown): value is MoneyJSON {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.currency === "string" && typeof record.amount === "string"
  );
}

/**
 * Validate wire shape only — does not construct Money or resolve currency.
 * Shared by `@eristack/money/rest` and `@eristack/money/zod`.
 */
export function validateMoneyJSON(value: unknown, path = "money"): MoneyJSON {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ParseError(`${path} must be an object`);
  }

  const record = value as Record<string, unknown>;

  if (!("currency" in record)) {
    throw new ParseError(`${path}.currency is required`);
  }
  if (typeof record.currency !== "string") {
    throw new ParseError(`${path}.currency must be a string`);
  }

  if (!("amount" in record)) {
    throw new ParseError(`${path}.amount is required`);
  }
  if (typeof record.amount === "number") {
    throw new ParseError(
      `${path}.amount must be a string, not a JSON number`,
    );
  }
  if (typeof record.amount !== "string") {
    throw new ParseError(`${path}.amount must be a string`);
  }

  return {
    currency: record.currency,
    amount: record.amount,
  };
}

export function validateMoneyAmountOnly(
  value: unknown,
  path = "amount",
): { amount: string } {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ParseError(`${path} must be an object`);
  }
  const record = value as Record<string, unknown>;
  if (typeof record.amount === "number") {
    throw new ParseError(
      `${path}.amount must be a string, not a JSON number`,
    );
  }
  if (typeof record.amount !== "string") {
    throw new ParseError(`${path}.amount must be a string`);
  }
  return { amount: record.amount };
}
