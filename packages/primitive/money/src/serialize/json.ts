import { Money } from "../amount/money.js";
import { ParseError } from "../errors/index.js";

export interface MoneyJSON {
  currency: string;
  amount: string;
}

export function moneyToJSON(amount: Money): MoneyJSON {
  return amount.toJSON();
}

export function moneyFromJSON(json: unknown): Money {
  if (
    typeof json !== "object" ||
    json === null ||
    typeof (json as MoneyJSON).currency !== "string" ||
    typeof (json as MoneyJSON).amount !== "string"
  ) {
    throw new ParseError(
      'Money JSON must be { currency: string, amount: string }',
    );
  }
  return Money.fromJSON(json as MoneyJSON);
}
