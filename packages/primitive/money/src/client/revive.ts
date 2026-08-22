import { Money } from "../core/amount/money.js";
import type { MoneyJSON } from "../core/serialize/json.js";
import { moneyFromJSON } from "../core/serialize/json.js";
import { isMoneyJSONShape } from "../core/validate/money-json.js";

export function reviveMoney(value: unknown): Money {
  return moneyFromJSON(value);
}

export function reviveMoneyFields<T extends Record<string, unknown>>(
  value: T,
  fields: readonly (keyof T & string)[],
): T {
  const out = { ...value };
  for (const field of fields) {
    const raw = value[field];
    if (raw == null) continue;
    (out as Record<string, unknown>)[field] = reviveMoney(raw);
  }
  return out;
}

export function isMoneyJSON(value: unknown): value is MoneyJSON {
  return isMoneyJSONShape(value);
}
