import { Money } from "@eristack/money";
import type { MoneyAmountJson } from "./types.js";

export function toMoneyAmountJson(input: Money | MoneyAmountJson): MoneyAmountJson {
  if (input instanceof Money) {
    return input.toJSON();
  }
  if (
    typeof input.amount !== "string" ||
    !input.amount.trim() ||
    typeof input.currency !== "string" ||
    !input.currency.trim()
  ) {
    throw new Error("amount must be { currency, amount } strings");
  }
  Money.of(input.amount, input.currency);
  return { currency: input.currency.trim(), amount: input.amount.trim() };
}

export function moneyJsonEqual(a: MoneyAmountJson, b: MoneyAmountJson): boolean {
  return a.currency === b.currency && a.amount === b.amount;
}
