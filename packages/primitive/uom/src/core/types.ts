/** Canonical unit code (e.g. `kg`, `g`, `L`, `pcs`). */
export type UomCode = string;

export type UomDimension = "mass" | "volume" | "count" | "length";

export type UomQuantity = {
  /** Non-negative decimal string. */
  amount: string;
  unit: UomCode;
};

export type UomDefinition = {
  code: UomCode;
  dimension: UomDimension;
  /** Multiply amount in this unit by factor to reach the dimension base unit. */
  toBaseFactor: string;
  label?: string;
};
