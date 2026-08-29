/** Stored as decimal ratio string (0.11 = 11%). Never use JS float literals. */
export type PercentValue = string;

export type Percent = {
  readonly ratio: PercentValue;
};

export type PercentInput =
  | { kind: "ratio"; value: string }
  | { kind: "percent"; value: string }
  | { kind: "basisPoints"; value: string };
