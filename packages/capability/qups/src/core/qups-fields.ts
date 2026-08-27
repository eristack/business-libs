import type { CalculatedLine } from "./calculate.js";

/** Snake_case keys aligned with `QUPS_LINE_SQL_COLUMNS` / Drizzle SQL names. */
export type QupsPersistedFields = {
  truth: string;
  quantity: string;
  quantity_ratio_numerator: string | null;
  quantity_ratio_denominator: string | null;
  currency: string;
  unit_price_amount: string;
  subtotal_amount: string;
  tax_rate_percent: string | null;
  tax_mode: string | null;
  tax_amount: string | null;
  net_amount: string;
  gross_amount: string;
};

/** Plain-object pricing fields for Backseat / IndexedDB — same names as SQL columns. */
export function withQupsFields(line: CalculatedLine): QupsPersistedFields {
  const c = line.columns;
  return {
    truth: c.truth,
    quantity: c.quantity,
    quantity_ratio_numerator: c.quantityRatioNumerator,
    quantity_ratio_denominator: c.quantityRatioDenominator,
    currency: c.currency,
    unit_price_amount: c.unitPriceAmount,
    subtotal_amount: c.subtotalAmount,
    tax_rate_percent: c.taxRatePercent,
    tax_mode: c.taxMode,
    tax_amount: c.taxAmount,
    net_amount: c.netAmount,
    gross_amount: c.grossAmount,
  };
}

export function withQupsFieldsRow<T extends Record<string, unknown>>(
  row: T,
  line: CalculatedLine,
): T & QupsPersistedFields {
  return { ...row, ...withQupsFields(line) };
}
