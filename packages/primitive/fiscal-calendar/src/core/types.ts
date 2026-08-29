/** Wall local date boundary YYYY-MM-DD (no time). */
export type FiscalDate = string;

export type PeriodStatus = "open" | "closed";

export type FiscalPeriod = {
  id: string;
  fiscalYear: number;
  periodNumber: number;
  /** Inclusive start date (wall local). */
  start: FiscalDate;
  /** Inclusive end date (wall local). */
  end: FiscalDate;
  status: PeriodStatus;
};

export type FiscalYearDefinition = {
  year: number;
  periods: readonly FiscalPeriod[];
};

export type FiscalCalendarDefinition = {
  id: string;
  /** IANA timezone for interpreting fiscal dates. */
  timezone: string;
  years: readonly FiscalYearDefinition[];
};
