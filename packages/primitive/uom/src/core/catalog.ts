import type { UomDefinition } from "./types.js";

/** Built-in SI-ish units with fixed ratios (extensible via registerUom in app bootstrap). */
export const BUILTIN_UOM: readonly UomDefinition[] = [
  { code: "mg", dimension: "mass", toBaseFactor: "0.001", label: "Milligram" },
  { code: "g", dimension: "mass", toBaseFactor: "1", label: "Gram" },
  { code: "kg", dimension: "mass", toBaseFactor: "1000", label: "Kilogram" },
  { code: "t", dimension: "mass", toBaseFactor: "1000000", label: "Metric ton" },
  { code: "mL", dimension: "volume", toBaseFactor: "1", label: "Millilitre" },
  { code: "L", dimension: "volume", toBaseFactor: "1000", label: "Litre" },
  { code: "pcs", dimension: "count", toBaseFactor: "1", label: "Pieces" },
  { code: "ea", dimension: "count", toBaseFactor: "1", label: "Each" },
  { code: "mm", dimension: "length", toBaseFactor: "1", label: "Millimetre" },
  { code: "m", dimension: "length", toBaseFactor: "1000", label: "Metre" },
];
