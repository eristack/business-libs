import type { CurrencyUnit } from "../currency/currency-unit.js";
import { resolveCurrency } from "../currency/registry.js";
import {
  absStorage,
  addStorage,
  compareStorage,
  createStorageFromMinor,
  createStorageFromString,
  createZeroStorage,
  divideStorage,
  getRepresentation,
  maybeDemote,
  multiplyStorage,
  negateStorage,
  precisionOf,
  remainderStorage,
  roundStorage,
  scaleOf,
  storageToDecimal,
  storageToPlainString,
  subtractStorage,
} from "../engine/amount-math.js";
import type { AmountStorage } from "../engine/storage.js";
import {
  ArithmeticError,
  CurrencyMismatchError,
  ParseError,
} from "../errors/index.js";
import {
  allocateMinorUnits,
  minorUnitsToStorage,
} from "../ops/allocate.js";
import type { MonetaryOperator, MonetaryQuery } from "../ops/types.js";
import { toDecimalRounding, type RoundingMode } from "../rounding/modes.js";
import {
  createMonetaryContext,
  type MonetaryContext,
} from "./monetary-context.js";
import type { MonetaryAmount } from "./monetary-amount.js";
import { NumberValue } from "./number-value.js";

export type MoneyInput = string | number | bigint;

export class Money implements MonetaryAmount {
  readonly currency: CurrencyUnit;

  /** @internal */
  readonly _storage: AmountStorage;

  private constructor(storage: AmountStorage, currency: CurrencyUnit) {
    this._storage = storage;
    this.currency = currency;
  }

  /** @internal */
  static _fromStorage(storage: AmountStorage, currency: CurrencyUnit): Money {
    return new Money(storage, currency);
  }

  static of(amount: MoneyInput, currency: string | CurrencyUnit): Money {
    const unit = resolveCurrency(currency);
    if (typeof amount === "number") {
      if (!Number.isFinite(amount)) {
        throw new ParseError("Amount number must be finite");
      }
      if (!Number.isInteger(amount)) {
        // Prefer string for fractional numbers to avoid binary float surprises.
        throw new ParseError(
          "Fractional number amounts are not accepted; pass a string like \"19.99\"",
        );
      }
      return new Money(createStorageFromString(String(amount), unit), unit);
    }
    if (typeof amount === "bigint") {
      return new Money(createStorageFromString(amount.toString(), unit), unit);
    }
    return new Money(createStorageFromString(amount, unit), unit);
  }

  static ofMinor(
    minorUnits: bigint | number | string,
    currency: string | CurrencyUnit,
  ): Money {
    const unit = resolveCurrency(currency);
    const minor =
      typeof minorUnits === "bigint" ? minorUnits : BigInt(minorUnits);
    return new Money(createStorageFromMinor(minor, unit), unit);
  }

  static zero(currency: string | CurrencyUnit): Money {
    const unit = resolveCurrency(currency);
    return new Money(createZeroStorage(unit), unit);
  }

  static fromJSON(json: { currency: string; amount: string }): Money {
    return Money.of(json.amount, json.currency);
  }

  getNumber(): NumberValue {
    return new NumberValue(this._storage);
  }

  getContext(): MonetaryContext {
    return createMonetaryContext(
      getRepresentation(this._storage),
      precisionOf(this._storage),
      scaleOf(this._storage),
    );
  }

  with(operator: MonetaryOperator): Money {
    const result = operator.apply(this);
    if (!(result instanceof Money)) {
      throw new ArithmeticError("Operator must return a Money instance");
    }
    return result;
  }

  query<T>(query: MonetaryQuery<T>): T {
    return query.queryFrom(this);
  }

  roundTo(scale: number, mode: RoundingMode = "HALF_EVEN"): Money {
    if (mode === "UNNECESSARY") {
      const decimal = storageToDecimal(this._storage);
      if (decimal.decimalPlaces() > scale) {
        throw new ArithmeticError(
          `Rounding unnecessary but amount has more than ${scale} decimal places`,
        );
      }
      return this;
    }
    const rounded = roundStorage(
      this._storage,
      scale,
      toDecimalRounding(mode),
    );
    return new Money(maybeDemote(rounded, this.currency), this.currency);
  }

  isZero(): boolean {
    return compareStorage(this._storage, createZeroStorage(this.currency)) === 0;
  }

  isPositive(): boolean {
    return compareStorage(this._storage, createZeroStorage(this.currency)) > 0;
  }

  isNegative(): boolean {
    return compareStorage(this._storage, createZeroStorage(this.currency)) < 0;
  }

  private asMoney(other: MonetaryAmount): Money {
    if (this.currency.currencyCode !== other.currency.currencyCode) {
      throw new CurrencyMismatchError(
        this.currency.currencyCode,
        other.currency.currencyCode,
      );
    }
    if (other instanceof Money) {
      return other;
    }
    return Money.of(other.getNumber().toString(), other.currency);
  }

  compareTo(amount: MonetaryAmount): number {
    const other = this.asMoney(amount);
    return compareStorage(this._storage, other._storage);
  }

  isGreaterThan(amount: MonetaryAmount): boolean {
    return this.compareTo(amount) > 0;
  }

  isGreaterThanOrEqualTo(amount: MonetaryAmount): boolean {
    return this.compareTo(amount) >= 0;
  }

  isLessThan(amount: MonetaryAmount): boolean {
    return this.compareTo(amount) < 0;
  }

  isLessThanOrEqualTo(amount: MonetaryAmount): boolean {
    return this.compareTo(amount) <= 0;
  }

  isEqualTo(amount: MonetaryAmount): boolean {
    return this.compareTo(amount) === 0;
  }

  add(amount: MonetaryAmount): Money {
    const other = this.asMoney(amount);
    return new Money(addStorage(this._storage, other._storage), this.currency);
  }

  subtract(amount: MonetaryAmount): Money {
    const other = this.asMoney(amount);
    return new Money(
      subtractStorage(this._storage, other._storage),
      this.currency,
    );
  }

  multiply(multiplicand: MoneyInput): Money {
    return new Money(
      multiplyStorage(this._storage, multiplicand),
      this.currency,
    );
  }

  divide(divisor: MoneyInput): Money {
    return new Money(divideStorage(this._storage, divisor), this.currency);
  }

  remainder(divisor: MoneyInput): Money {
    return new Money(remainderStorage(this._storage, divisor), this.currency);
  }

  negate(): Money {
    return new Money(negateStorage(this._storage), this.currency);
  }

  abs(): Money {
    return new Money(absStorage(this._storage), this.currency);
  }

  plus(): Money {
    return this;
  }

  allocate(n: number): Money[] {
    if (!Number.isInteger(n) || n <= 0) {
      throw new ArithmeticError("allocate(n) requires a positive integer");
    }
    return this.allocateByRatios(Array.from({ length: n }, () => 1));
  }

  allocateByRatios(ratios: readonly number[]): Money[] {
    const minors = allocateMinorUnits(this._storage, this.currency, ratios);
    return minors.map(
      (minor) => new Money(minorUnitsToStorage(minor, this.currency), this.currency),
    );
  }

  toString(): string {
    return `${storageToPlainString(this._storage)} ${this.currency.currencyCode}`;
  }

  toJSON(): { currency: string; amount: string } {
    return {
      currency: this.currency.currencyCode,
      amount: storageToPlainString(this._storage),
    };
  }

  /**
   * Amount string without currency code.
   */
  amountString(): string {
    return storageToPlainString(this._storage);
  }
}
