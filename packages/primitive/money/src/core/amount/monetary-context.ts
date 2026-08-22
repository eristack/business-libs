import type { AmountRepresentation } from "../engine/storage.js";

export interface MonetaryContext {
  readonly representation: AmountRepresentation;
  readonly precision: number;
  readonly maxScale: number;
}

export function createMonetaryContext(
  representation: AmountRepresentation,
  precision: number,
  maxScale: number,
): MonetaryContext {
  return { representation, precision, maxScale };
}
