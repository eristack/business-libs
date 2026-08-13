import Decimal from "decimal.js";
import { BalanceEquationError } from "./errors.js";
import type { LedgerAmount } from "./types.js";

export function d(value: LedgerAmount | number | Decimal): Decimal {
  if (value instanceof Decimal) return value;
  return new Decimal(value);
}

export function amount(value: Decimal | LedgerAmount | number): LedgerAmount {
  return d(value).toFixed();
}

export function zeroAmount(): LedgerAmount {
  return "0";
}

/** closing = opening + in - out + adjustment */
export function computeClosing(input: {
  openingBalance: LedgerAmount;
  inAmount: LedgerAmount;
  outAmount: LedgerAmount;
  adjustment: LedgerAmount;
}): LedgerAmount {
  return amount(
    d(input.openingBalance)
      .plus(d(input.inAmount))
      .minus(d(input.outAmount))
      .plus(d(input.adjustment)),
  );
}

export function assertBalanceEquation(entry: {
  openingBalance: LedgerAmount;
  inAmount: LedgerAmount;
  outAmount: LedgerAmount;
  adjustment: LedgerAmount;
  closingBalance: LedgerAmount;
}): void {
  const expected = computeClosing(entry);
  if (!d(expected).eq(d(entry.closingBalance))) {
    throw new BalanceEquationError(
      `Balance equation failed: opening(${entry.openingBalance}) + in(${entry.inAmount}) - out(${entry.outAmount}) + adj(${entry.adjustment}) = ${expected}, got closing ${entry.closingBalance}`,
    );
  }
}
