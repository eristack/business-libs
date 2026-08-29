import Decimal from "decimal.js";
import { assertKnownUom } from "./registry.js";
import type { UomCode, UomQuantity } from "./types.js";

export class UomConversionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UomConversionError";
  }
}

/** Construct a quantity — amount must be a decimal string (not JS number literal). */
export function uomQty(amount: string, unit: UomCode): UomQuantity {
  if (!amount.trim() || Number.isNaN(Number(amount))) {
    throw new UomConversionError(`Invalid quantity amount "${amount}"`);
  }
  assertKnownUom(unit);
  return { amount: new Decimal(amount).toFixed(), unit };
}

/** Convert between units in the same dimension using fixed ratios. */
export function convertUom(qty: UomQuantity, targetUnit: UomCode): UomQuantity {
  const from = assertKnownUom(qty.unit);
  const to = assertKnownUom(targetUnit);
  if (from.dimension !== to.dimension) {
    throw new UomConversionError(
      `Cannot convert ${qty.unit} (${from.dimension}) to ${targetUnit} (${to.dimension})`,
    );
  }
  const baseAmount = new Decimal(qty.amount).times(from.toBaseFactor);
  const converted = baseAmount.div(to.toBaseFactor);
  return { amount: converted.toFixed(), unit: targetUnit };
}

export function sameDimension(a: UomCode, b: UomCode): boolean {
  return assertKnownUom(a).dimension === assertKnownUom(b).dimension;
}
