import { Money, Rounding } from "../core/index.js";
import type { MoneyJSON } from "../core/serialize/json.js";
import { validateMoneyJSON } from "../core/validate/money-json.js";
import { ParseError } from "../core/errors/index.js";

export function moneyFormValue(money: Money): MoneyJSON {
  return money.toJSON();
}

export function parseMoneyFormValue(
  value: unknown,
  path = "money",
): Money {
  const json = validateMoneyJSON(value, path);
  return Money.fromJSON(json);
}

export type MoneyFieldValidatorOptions = {
  required?: boolean;
  currency?: string;
  round?: boolean;
};

export function createMoneyFieldValidators(
  options: MoneyFieldValidatorOptions = {},
) {
  return {
    onChange: ({ value }: { value: unknown }) => {
      if (value == null || value === "") {
        if (options.required) return "Amount is required";
        return undefined;
      }
      try {
        const json = validateMoneyJSON(value, "money");
        if (options.currency && json.currency !== options.currency) {
          return `Currency must be ${options.currency}`;
        }
        return undefined;
      } catch (error) {
        return error instanceof ParseError ? error.message : "Invalid money";
      }
    },
    onSubmit: ({ value }: { value: unknown }) => {
      if (value == null || value === "") {
        if (options.required) return "Amount is required";
        return undefined;
      }
      try {
        parseMoneyFormValue(value);
        return undefined;
      } catch (error) {
        return error instanceof ParseError ? error.message : "Invalid money";
      }
    },
  };
}

export function submitMoneyFormValue(
  value: unknown,
  options?: { round?: boolean },
): Money {
  const money = parseMoneyFormValue(value);
  if (options?.round === false) return money;
  return money.with(Rounding.currencyDefault());
}

export { moneyFormValueSchema } from "../zod/schemas.js";
