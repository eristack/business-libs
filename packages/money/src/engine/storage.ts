import type { MoneyDecimalInstance } from "./decimal.js";

export type AmountRepresentation = "bigint" | "decimal";

export type AmountStorage =
  | {
      representation: "bigint";
      /** Integer amount in units of 10^-scale */
      minorUnits: bigint;
      scale: number;
    }
  | {
      representation: "decimal";
      value: MoneyDecimalInstance;
    };

/** Max significant digits allowed on the bigint fast path before promoting. */
export const BIGINT_MAX_DIGITS = 28;
