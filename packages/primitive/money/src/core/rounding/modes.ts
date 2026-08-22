import { Decimal } from "../engine/decimal.js";

export type RoundingMode =
  | "UP"
  | "DOWN"
  | "CEILING"
  | "FLOOR"
  | "HALF_UP"
  | "HALF_DOWN"
  | "HALF_EVEN"
  | "UNNECESSARY";

export function toDecimalRounding(mode: RoundingMode): Decimal.Rounding {
  switch (mode) {
    case "UP":
      return Decimal.ROUND_UP;
    case "DOWN":
      return Decimal.ROUND_DOWN;
    case "CEILING":
      return Decimal.ROUND_CEIL;
    case "FLOOR":
      return Decimal.ROUND_FLOOR;
    case "HALF_UP":
      return Decimal.ROUND_HALF_UP;
    case "HALF_DOWN":
      return Decimal.ROUND_HALF_DOWN;
    case "HALF_EVEN":
      return Decimal.ROUND_HALF_EVEN;
    case "UNNECESSARY":
      return Decimal.ROUND_HALF_EVEN; // validated separately
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}
