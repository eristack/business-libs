import { Money } from "./money.js";
import { ParseError } from "../errors/index.js";
import { Rounding } from "../rounding/rounding.js";

export type ParseRoundedAmountOptions = {
  round?: boolean;
  path?: string;
};

/**
 * Parse a flat decimal amount string + expected currency (QUPS / ERP line pattern).
 * Does not accept JSON numbers or nested MoneyJSON.
 */
export function parseRoundedAmount(
  amount: unknown,
  currency: string,
  options: ParseRoundedAmountOptions = {},
): Money {
  const path = options.path ?? "amount";
  if (typeof amount !== "string") {
    throw new ParseError(`${path} must be a string`);
  }
  const trimmed = amount.trim();
  if (trimmed === "") {
    throw new ParseError(`${path} is required`);
  }
  try {
    const money = Money.of(trimmed, currency);
    if (options.round === false) return money;
    return money.with(Rounding.currencyDefault());
  } catch (error) {
    if (error instanceof ParseError) throw error;
    throw new ParseError(
      error instanceof Error ? error.message : `${path}: invalid amount`,
    );
  }
}
