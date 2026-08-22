import { Money } from "../core/amount/money.js";
import type { MoneyJSON } from "../core/serialize/json.js";
import {
  isMoneyJSONShape,
  validateMoneyJSON,
} from "../core/validate/money-json.js";
import { ParseError } from "../core/errors/index.js";
import { RestMoneyFieldError } from "./errors.js";

export function isMoneyJSON(value: unknown): value is MoneyJSON {
  return isMoneyJSONShape(value);
}

export function serializeMoney(amount: Money): MoneyJSON {
  return amount.toJSON();
}

export function parseMoneyJSON(value: unknown, path = "money"): Money {
  try {
    const json = validateMoneyJSON(value, path);
    return Money.fromJSON(json);
  } catch (error) {
    if (error instanceof ParseError) {
      throw new RestMoneyFieldError(path, error.message);
    }
    throw error;
  }
}

export function parseMoneyFields(
  body: unknown,
  fields: readonly string[],
): Record<string, Money> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new RestMoneyFieldError("body", "body must be an object");
  }
  const record = body as Record<string, unknown>;
  const out: Record<string, Money> = {};
  for (const field of fields) {
    out[field] = parseMoneyJSON(record[field], field);
  }
  return out;
}

export function serializeMoneyFields(
  values: Record<string, Money | undefined | null>,
): Record<string, MoneyJSON | null | undefined> {
  const out: Record<string, MoneyJSON | null | undefined> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value == null) {
      out[key] = value;
      continue;
    }
    out[key] = serializeMoney(value);
  }
  return out;
}

export { validateMoneyJSON } from "../core/validate/money-json.js";
