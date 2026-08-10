import type { CurrencyUnit } from "../currency/currency-unit.js";
import type { MonetaryOperator, MonetaryQuery } from "../ops/types.js";
import type { RoundingMode } from "../rounding/modes.js";
import type { MonetaryContext } from "./monetary-context.js";
import type { NumberValue } from "./number-value.js";

/**
 * JSR 354–inspired monetary amount contract.
 */
export interface MonetaryAmount {
  readonly currency: CurrencyUnit;

  getNumber(): NumberValue;
  getContext(): MonetaryContext;

  with(operator: MonetaryOperator): MonetaryAmount;
  query<T>(query: MonetaryQuery<T>): T;
  roundTo(scale: number, mode?: RoundingMode): MonetaryAmount;

  isZero(): boolean;
  isPositive(): boolean;
  isNegative(): boolean;

  isGreaterThan(amount: MonetaryAmount): boolean;
  isGreaterThanOrEqualTo(amount: MonetaryAmount): boolean;
  isLessThan(amount: MonetaryAmount): boolean;
  isLessThanOrEqualTo(amount: MonetaryAmount): boolean;
  isEqualTo(amount: MonetaryAmount): boolean;
  compareTo(amount: MonetaryAmount): number;

  add(amount: MonetaryAmount): MonetaryAmount;
  subtract(amount: MonetaryAmount): MonetaryAmount;
  multiply(multiplicand: string | number | bigint): MonetaryAmount;
  divide(divisor: string | number | bigint): MonetaryAmount;
  remainder(divisor: string | number | bigint): MonetaryAmount;
  negate(): MonetaryAmount;
  abs(): MonetaryAmount;
  plus(): MonetaryAmount;

  /**
   * Split into n parts using largest-remainder so parts sum to this amount.
   * Amount should typically be currency-rounded first.
   */
  allocate(n: number): MonetaryAmount[];

  /**
   * Split by ratios using largest-remainder so parts sum to this amount.
   */
  allocateByRatios(ratios: readonly number[]): MonetaryAmount[];

  toString(): string;
  toJSON(): { currency: string; amount: string };
}
