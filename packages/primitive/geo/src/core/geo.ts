import Decimal from "decimal.js";

import { GeoParseError } from "./errors.js";
import type { GeoPoint, GeoDistanceOptions } from "./types.js";

const EARTH_RADIUS_KM = new Decimal("6371");

function parseCoordinate(value: string, field: string, min: Decimal, max: Decimal): Decimal {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new GeoParseError(`${field} is required`);
  }
  let dec: Decimal;
  try {
    dec = new Decimal(trimmed);
  } catch {
    throw new GeoParseError(`${field} must be a decimal string`);
  }
  if (!dec.isFinite()) {
    throw new GeoParseError(`${field} must be finite`);
  }
  if (dec.lt(min) || dec.gt(max)) {
    throw new GeoParseError(`${field} out of range`);
  }
  return dec;
}

export function normalizeGeoPoint(input: GeoPoint): GeoPoint {
  const latitude = parseCoordinate(
    input.latitude,
    "latitude",
    new Decimal("-90"),
    new Decimal("90"),
  ).toFixed();
  const longitude = parseCoordinate(
    input.longitude,
    "longitude",
    new Decimal("-180"),
    new Decimal("180"),
  ).toFixed();
  return { latitude, longitude };
}

function toRadians(deg: Decimal): Decimal {
  return deg.mul(Math.PI).div(180);
}

export function geoDistanceKm(
  a: GeoPoint,
  b: GeoPoint,
  options: GeoDistanceOptions = {},
): string {
  const p1 = normalizeGeoPoint(a);
  const p2 = normalizeGeoPoint(b);
  const scale = options.scale ?? 3;

  const lat1 = toRadians(new Decimal(p1.latitude));
  const lat2 = toRadians(new Decimal(p2.latitude));
  const dLat = lat2.minus(lat1);
  const dLon = toRadians(new Decimal(p2.longitude)).minus(
    toRadians(new Decimal(p1.longitude)),
  );

  const sinHalfLat = dLat.div(2).sin().pow(2);
  const sinHalfLon = dLon.div(2).sin().pow(2);
  const h = sinHalfLat.plus(lat1.cos().mul(lat2.cos()).mul(sinHalfLon));
  const c = new Decimal(2).mul(h.sqrt().asin());
  const km = EARTH_RADIUS_KM.mul(c).toDecimalPlaces(scale, Decimal.ROUND_HALF_UP);
  return km.toFixed(scale);
}

export function formatGeoPoint(point: GeoPoint): string {
  const p = normalizeGeoPoint(point);
  return `${p.latitude}, ${p.longitude}`;
}
