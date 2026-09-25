import type { Money } from "../amount/money.js";

/** Pad a decimal amount string to `scale` fraction digits — no `Number()` on the amount. */
export function padAmountString(raw: string, scale: number): string {
  if (scale < 0) {
    return raw;
  }
  const trimmed = raw.trim();
  const negative = trimmed.startsWith("-");
  const unsigned = negative ? trimmed.slice(1) : trimmed;
  const [intPart = "0", fracPart = ""] = unsigned.split(".");
  if (scale === 0) {
    return `${negative ? "-" : ""}${intPart}`;
  }
  const frac = fracPart.padEnd(scale, "0").slice(0, scale);
  return `${negative ? "-" : ""}${intPart}.${frac}`;
}

/** Fixed-scale decimal string using the currency's default fraction digits. */
export function formatFixed(amount: Money): string {
  const scale = amount.currency.defaultFractionDigits;
  return padAmountString(amount.amountString(), scale >= 0 ? scale : 0);
}

export type ToDisplayStringOptions = {
  minFractionDigits?: number;
};

/**
 * Amount-only display string with explicit scale (defaults to currency fraction digits).
 * Prefer over `Number(amountString())` for journal lines and API logs.
 */
export function toDisplayString(
  amount: Money,
  options?: ToDisplayStringOptions,
): string {
  const scale =
    options?.minFractionDigits ?? amount.currency.defaultFractionDigits;
  return padAmountString(amount.amountString(), scale >= 0 ? scale : 0);
}
