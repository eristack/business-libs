import type { CurrencyUnit } from "../currency/currency-unit.js";
import { resolveCurrency } from "../currency/registry.js";
import { ArithmeticError } from "../errors/index.js";
import type { MonetaryAmount } from "../amount/monetary-amount.js";
import type { MonetaryOperator } from "../ops/types.js";
import type { RoundingMode } from "./modes.js";

export interface RoundingContext {
  readonly scale: number;
  readonly mode: RoundingMode;
}

/**
 * Rounding operator. Implementation is delegated to MonetaryAmount.roundTo
 * to keep ESM modules free of circular imports.
 */
export class MonetaryRounding implements MonetaryOperator {
  readonly scale: number;
  readonly mode: RoundingMode;

  constructor(scale: number, mode: RoundingMode = "HALF_EVEN") {
    if (!Number.isInteger(scale) || scale < 0) {
      throw new ArithmeticError(`Invalid rounding scale: ${scale}`);
    }
    this.scale = scale;
    this.mode = mode;
  }

  apply(amount: MonetaryAmount): MonetaryAmount {
    return amount.roundTo(this.scale, this.mode);
  }
}

export const Rounding = {
  of(scale: number, mode: RoundingMode = "HALF_EVEN"): MonetaryRounding {
    return new MonetaryRounding(scale, mode);
  },

  /** Round to the currency's default fraction digits (HALF_EVEN by default). */
  currencyDefault(
    currency?: string | CurrencyUnit,
    mode: RoundingMode = "HALF_EVEN",
  ): MonetaryOperator {
    if (currency !== undefined) {
      const unit = resolveCurrency(currency);
      if (unit.defaultFractionDigits < 0) {
        throw new ArithmeticError(
          `Currency ${unit.currencyCode} has no default fraction digits`,
        );
      }
      return new MonetaryRounding(unit.defaultFractionDigits, mode);
    }

    return {
      apply(amount: MonetaryAmount): MonetaryAmount {
        const digits = amount.currency.defaultFractionDigits;
        if (digits < 0) {
          throw new ArithmeticError(
            `Currency ${amount.currency.currencyCode} has no default fraction digits`,
          );
        }
        return amount.roundTo(digits, mode);
      },
    };
  },
};
