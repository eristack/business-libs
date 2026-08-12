import { Decimal } from "decimal.js";

/** Shared Decimal config for monetary math. */
export const MoneyDecimal = Decimal.clone({
  precision: 40,
  rounding: Decimal.ROUND_HALF_EVEN,
  toExpNeg: -20,
  toExpPos: 40,
});

export type MoneyDecimalInstance = InstanceType<typeof MoneyDecimal>;

export { Decimal };
