import type { RoundingMode } from "@eristack/money";

export type CurrencyRoundingOverride = {
  scale?: number;
  mode?: RoundingMode;
};

export type RoundingPolicyDefinition = {
  id: string;
  label?: string;
  /** Used when no currency override matches */
  scale?: number;
  mode?: RoundingMode;
  currencyOverrides?: Record<string, CurrencyRoundingOverride>;
};
