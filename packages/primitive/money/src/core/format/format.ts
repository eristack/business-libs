import type { CurrencyUnit } from "../currency/currency-unit.js";
import { resolveCurrency } from "../currency/registry.js";
import { Money } from "../amount/money.js";
import { ParseError } from "../errors/index.js";

export interface FormatOptions {
  locale?: string;
  currencyDisplay?: "symbol" | "narrowSymbol" | "code" | "name";
  /** Override fraction digits; defaults to currency default when >= 0. */
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export function formatMoney(
  amount: Money,
  localeOrOptions: string | FormatOptions = "en-US",
): string {
  const options: FormatOptions =
    typeof localeOrOptions === "string"
      ? { locale: localeOrOptions }
      : localeOrOptions;

  const locale = options.locale ?? "en-US";
  const digits = amount.currency.defaultFractionDigits;
  const min =
    options.minimumFractionDigits ?? (digits >= 0 ? digits : undefined);
  const max =
    options.maximumFractionDigits ?? (digits >= 0 ? digits : undefined);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: amount.currency.currencyCode,
    currencyDisplay: options.currencyDisplay ?? "symbol",
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  }).format(Number(amount.amountString()));
}

/**
 * Strict parse of a localized currency string back to Money.
 * Prefer JSON / amount strings for machine interchange; use this for UI input.
 */
export function parseMoney(
  text: string,
  currency: string | CurrencyUnit,
  locale = "en-US",
): Money {
  const unit = resolveCurrency(currency);
  const trimmed = text.trim();
  if (!trimmed) {
    throw new ParseError("Cannot parse empty money string");
  }

  // Strip currency symbols / codes using locale parts, keep number-like chars.
  const example = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: unit.currencyCode,
  }).format(1.1);

  const numberingSystemDigits = "0123456789";
  let normalized = trimmed;

  // Remove the currency code if present.
  normalized = normalized.replace(new RegExp(unit.currencyCode, "ig"), "");

  // Remove common symbol characters by comparing against a formatted sample.
  const symbolOnly = example.replace(/[\d\s.,]/g, "");
  for (const ch of symbolOnly) {
    normalized = normalized.split(ch).join("");
  }

  normalized = normalized.trim();

  // Detect decimal & group separators from locale.
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
  const group = parts.find((p) => p.type === "group")?.value ?? ",";
  const decimal = parts.find((p) => p.type === "decimal")?.value ?? ".";

  normalized = normalized.split(group).join("");
  if (decimal !== ".") {
    normalized = normalized.split(decimal).join(".");
  }

  // Keep digits, sign, dot.
  normalized = normalized
    .split("")
    .filter(
      (ch) =>
        numberingSystemDigits.includes(ch) || ch === "." || ch === "-" || ch === "+",
    )
    .join("");

  if (!normalized || normalized === "-" || normalized === "+") {
    throw new ParseError(`Cannot parse money string: ${text}`);
  }

  try {
    return Money.of(normalized, unit);
  } catch (err) {
    throw new ParseError(
      `Cannot parse money string: ${text}${err instanceof Error ? ` (${err.message})` : ""}`,
    );
  }
}

export const MonetaryFormats = {
  format: formatMoney,
  parse: parseMoney,
};
