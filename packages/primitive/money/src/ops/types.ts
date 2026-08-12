import type { MonetaryAmount } from "../amount/monetary-amount.js";

/**
 * Transforms a monetary amount (JSR 354 MonetaryOperator).
 */
export interface MonetaryOperator {
  apply(amount: MonetaryAmount): MonetaryAmount;
}

/**
 * Queries a monetary amount (JSR 354 MonetaryQuery).
 */
export interface MonetaryQuery<T> {
  queryFrom(amount: MonetaryAmount): T;
}

export function isMonetaryOperator(
  value: unknown,
): value is MonetaryOperator {
  return (
    typeof value === "object" &&
    value !== null &&
    "apply" in value &&
    typeof (value as MonetaryOperator).apply === "function"
  );
}
