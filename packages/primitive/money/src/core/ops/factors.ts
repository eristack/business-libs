import { MoneyDecimal } from "../engine/decimal.js";
import { ArithmeticError, ParseError } from "../errors/index.js";

type FactorInput = string | number | bigint;

function toDecimal(value: FactorInput): InstanceType<typeof MoneyDecimal> {
  try {
    if (typeof value === "number") {
      if (!Number.isFinite(value)) {
        throw new ParseError("Factor number must be finite");
      }
      if (!Number.isInteger(value)) {
        throw new ParseError(
          'Fractional number factors are not accepted; pass a string like "7.5"',
        );
      }
      return new MoneyDecimal(value);
    }
    return new MoneyDecimal(typeof value === "bigint" ? value.toString() : value);
  } catch (error) {
    if (error instanceof ParseError) throw error;
    throw new ParseError(
      `Invalid numeric factor: ${String(value)}${
        error instanceof Error ? ` (${error.message})` : ""
      }`,
    );
  }
}

/** Factor for `amount * (percent / 100)`. */
export function percentFactor(percent: FactorInput): string {
  const value = toDecimal(percent);
  if (!value.isFinite()) {
    throw new ArithmeticError("Percent must be finite");
  }
  return value.div(100).toFixed();
}

/** Factor for `amount * (1 + percent / 100)`. */
export function plusPercentFactor(percent: FactorInput): string {
  return new MoneyDecimal(1).plus(toDecimal(percent).div(100)).toFixed();
}

/** Factor for `amount * (1 - percent / 100)`. */
export function minusPercentFactor(percent: FactorInput): string {
  return new MoneyDecimal(1).minus(toDecimal(percent).div(100)).toFixed();
}

/** Divisor for inclusive → net: `1 + rate/100` (divide gross by this). */
export function inclusiveGrossDivisor(ratePercent: FactorInput): string {
  return new MoneyDecimal(1).plus(toDecimal(ratePercent).div(100)).toFixed();
}
