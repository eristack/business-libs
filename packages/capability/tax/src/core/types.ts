export type TaxCode = {
  code: string;
  label?: string;
};

export type TaxRateScheduleEntry = {
  code: string;
  /** Wall calendar date YYYY-MM-DD (inclusive effective from) */
  effectiveFrom: string;
  /** Percent string for @eristack/money Tax ops, e.g. "10" or "10%" */
  ratePercent: string;
};

export type ResolvedTaxRate = {
  code: string;
  effectiveFrom: string;
  ratePercent: string;
};
