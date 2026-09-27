import Decimal from "decimal.js";

import { DimensionParseError } from "./errors.js";
import type { Dimension, DimensionVolumeOptions } from "./types.js";

function trimOptional(value: string | undefined): string | undefined {
  const t = value?.trim();
  return t ? t : undefined;
}

function parsePositiveDecimal(value: string, field: string): Decimal {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new DimensionParseError(`${field} is required`);
  }
  let dec: Decimal;
  try {
    dec = new Decimal(trimmed);
  } catch {
    throw new DimensionParseError(`${field} must be a decimal string`);
  }
  if (!dec.isFinite() || dec.lte(0)) {
    throw new DimensionParseError(`${field} must be a positive finite number`);
  }
  return dec;
}

export function normalizeDimension(input: Dimension): Dimension {
  const length = parsePositiveDecimal(input.length, "length").toFixed();
  const width = parsePositiveDecimal(input.width, "width").toFixed();
  const height = parsePositiveDecimal(input.height, "height").toFixed();
  const unit = trimOptional(input.unit);
  return { length, width, height, unit };
}

export function dimensionVolume(
  dimension: Dimension,
  options: DimensionVolumeOptions = {},
): string {
  const d = normalizeDimension(dimension);
  const scale = options.scale ?? 6;
  const volume = new Decimal(d.length)
    .mul(d.width)
    .mul(d.height)
    .toDecimalPlaces(scale, Decimal.ROUND_HALF_UP);
  return volume.toFixed(scale);
}

export function formatDimension(dimension: Dimension): string {
  const d = normalizeDimension(dimension);
  const base = `${d.length} × ${d.width} × ${d.height}`;
  return d.unit ? `${base} ${d.unit}` : base;
}
