import {
  precisionOf,
  scaleOf,
  storageToDecimal,
  storageToPlainString,
} from "../engine/amount-math.js";
import { MoneyDecimal } from "../engine/decimal.js";
import type { AmountStorage } from "../engine/storage.js";
import { ArithmeticError } from "../errors/index.js";

/**
 * Numeric view of a monetary amount (JSR 354 NumberValue–inspired).
 */
export class NumberValue {
  /** @internal */
  readonly _storage: AmountStorage;

  constructor(storage: AmountStorage) {
    this._storage = storage;
  }

  toString(): string {
    return storageToPlainString(this._storage);
  }

  precision(): number {
    return precisionOf(this._storage);
  }

  scale(): number {
    return scaleOf(this._storage);
  }

  /**
   * Exact number when safe for IEEE doubles; otherwise throws.
   */
  numberValueExact(): number {
    const text = this.toString();
    const n = Number(text);
    const dec = storageToDecimal(this._storage);
    if (!Number.isFinite(n) || !dec.equals(n)) {
      throw new ArithmeticError(
        `Amount ${text} cannot be represented exactly as a JavaScript number`,
      );
    }
    return n;
  }

  /**
   * Minor units when exact at the amount's scale.
   */
  bigintValue(): bigint {
    if (this._storage.representation === "bigint") {
      return this._storage.minorUnits;
    }
    const dec = storageToDecimal(this._storage);
    const scale = this.scale();
    const scaled = dec.mul(new MoneyDecimal(10).pow(scale));
    if (!scaled.isInteger()) {
      throw new ArithmeticError(
        "Amount is not an integer number of minor units at its scale",
      );
    }
    return BigInt(scaled.toFixed(0));
  }

  signum(): -1 | 0 | 1 {
    const cmp = storageToDecimal(this._storage).cmp(0);
    if (cmp < 0) return -1;
    if (cmp > 0) return 1;
    return 0;
  }
}
