import Decimal from "decimal.js";
import { FractionDomainError, FractionParseError } from "./errors.js";
import {
  gcd,
  normalizePair,
  parseBigIntField,
  toPair,
} from "./internal.js";
import type {
  ApproximateFractionOptions,
  CompareFraction,
  Fraction,
} from "./types.js";

const MIXED = /^(-?\d+)\s+(\d+)\/(\d+)$/;
const SLASH = /^(-?\d+)\/(\d+)$/;
const INTEGER = /^-?\d+$/;

/** Build a reduced fraction from integer strings (not JS number literals). */
export function fraction(num: string, den: string): Fraction {
  return normalizePair(parseBigIntField("numerator", num), parseBigIntField("denominator", den));
}

export function zeroFraction(): Fraction {
  return { num: "0", den: "1" };
}

export function oneFraction(): Fraction {
  return { num: "1", den: "1" };
}

/**
 * Parse `3/4`, `-2/5`, `7`, or mixed `1 1/2`.
 * Does not parse decimal strings — use {@link approximateFraction} for those.
 */
export function parseFraction(input: string): Fraction {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new FractionParseError("Fraction input cannot be empty");
  }

  const mixed = MIXED.exec(trimmed);
  if (mixed) {
    const whole = parseBigIntField("whole", mixed[1]!);
    const numPart = parseBigIntField("numerator", mixed[2]!);
    const den = parseBigIntField("denominator", mixed[3]!);
    const sign = whole < 0n || numPart < 0n ? -1n : 1n;
    const absWhole = whole < 0n ? -whole : whole;
    const absNum = numPart < 0n ? -numPart : numPart;
    const totalNum = absWhole * den + absNum;
    return normalizePair(sign * totalNum, den);
  }

  const slash = SLASH.exec(trimmed);
  if (slash) {
    return fraction(slash[1]!, slash[2]!);
  }

  if (INTEGER.test(trimmed)) {
    return normalizePair(parseBigIntField("numerator", trimmed), 1n);
  }

  throw new FractionParseError(
    `Invalid fraction "${input}" — use "n/d", mixed "w n/d", integer, or approximateFraction for decimals`,
  );
}

export function negateFraction(f: Fraction): Fraction {
  const { num, den } = toPair(f);
  return normalizePair(-num, den);
}

export function absFraction(f: Fraction): Fraction {
  const { num, den } = toPair(f);
  return normalizePair(num < 0n ? -num : num, den);
}

export function addFraction(a: Fraction, b: Fraction): Fraction {
  const pa = toPair(a);
  const pb = toPair(b);
  const num = pa.num * pb.den + pb.num * pa.den;
  const den = pa.den * pb.den;
  return normalizePair(num, den);
}

export function subtractFraction(a: Fraction, b: Fraction): Fraction {
  const pa = toPair(a);
  const pb = toPair(b);
  const num = pa.num * pb.den - pb.num * pa.den;
  const den = pa.den * pb.den;
  return normalizePair(num, den);
}

export function multiplyFraction(a: Fraction, b: Fraction): Fraction {
  const pa = toPair(a);
  const pb = toPair(b);
  return normalizePair(pa.num * pb.num, pa.den * pb.den);
}

export function divideFraction(a: Fraction, b: Fraction): Fraction {
  const pb = toPair(b);
  if (pb.num === 0n) {
    throw new FractionDomainError("Cannot divide by zero fraction");
  }
  const pa = toPair(a);
  return normalizePair(pa.num * pb.den, pa.den * pb.num);
}

export function compareFraction(a: Fraction, b: Fraction): CompareFraction {
  const pa = toPair(a);
  const pb = toPair(b);
  const left = pa.num * pb.den;
  const right = pb.num * pa.den;
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

export function fractionEquals(a: Fraction, b: Fraction): boolean {
  return compareFraction(a, b) === 0;
}

/** Human-readable `n/d` or integer when denominator is 1. */
export function formatFraction(f: Fraction): string {
  if (f.den === "1") return f.num;
  return `${f.num}/${f.den}`;
}

/** Decimal string for display or boundary conversion — may be repeating; use scale when rounding. */
export function toDecimal(f: Fraction, scale?: number): string {
  const { num, den } = toPair(f);
  const d = new Decimal(num.toString()).div(den.toString());
  return scale == null ? d.toFixed() : d.toFixed(scale);
}

/** Exact ratio string (same shape as @eristack/percent ratio, may exceed 0–1). */
export function toRatioString(f: Fraction): string {
  return toDecimal(f);
}

/**
 * Best rational with denominator ≤ maxDenominator for a decimal string.
 * Use for irrationals (√2, π) and repeating decimals when you need an exact fraction
 * for storage or further rational arithmetic — not for ledger rounding (use @eristack/money).
 */
export function approximateFraction(
  decimal: string,
  options: ApproximateFractionOptions = {},
): Fraction {
  const trimmed = decimal.trim();
  if (!trimmed) {
    throw new FractionParseError("Decimal input cannot be empty");
  }

  let target: Decimal;
  try {
    target = new Decimal(trimmed);
  } catch {
    throw new FractionParseError(`Invalid decimal "${decimal}"`);
  }
  if (!target.isFinite()) {
    throw new FractionParseError(`Decimal must be finite: "${decimal}"`);
  }

  const maxDen = parseBigIntField(
    "maxDenominator",
    options.maxDenominator ?? "10000",
  );
  if (maxDen < 1n) {
    throw new FractionDomainError("maxDenominator must be at least 1");
  }

  let bestNum = 0n;
  let bestDen = 1n;
  let bestErr = new Decimal(Infinity);

  for (let den = 1n; den <= maxDen; den++) {
    const rounded = target.times(den.toString()).toNearest(1, Decimal.ROUND_HALF_UP);
    const num = BigInt(rounded.toFixed(0));
    const approx = normalizePair(num, den);
    const err = target.minus(new Decimal(approx.num).div(approx.den)).abs();
    if (err.lt(bestErr)) {
      bestErr = err;
      bestNum = num;
      bestDen = den;
      if (err.isZero()) break;
    }
  }

  return normalizePair(bestNum, bestDen);
}

/** Continued-fraction convergent — often tighter than brute force for modest denominators. */
export function convergentFraction(
  decimal: string,
  maxDenominator = "10000",
): Fraction {
  const trimmed = decimal.trim();
  let x: Decimal;
  try {
    x = new Decimal(trimmed);
  } catch {
    throw new FractionParseError(`Invalid decimal "${decimal}"`);
  }
  const cap = parseBigIntField("maxDenominator", maxDenominator);
  if (cap < 1n) {
    throw new FractionDomainError("maxDenominator must be at least 1");
  }

  let hPrev = 0n;
  let hCurr = 1n;
  let kPrev = 1n;
  let kCurr = 0n;
  let value = x.abs();

  for (let i = 0; i < 64; i++) {
    if (!value.isFinite() || value.isZero()) break;
    const intPart = BigInt(value.floor().toFixed(0));
    const hNext = intPart * hCurr + hPrev;
    const kNext = intPart * kCurr + kPrev;
    if (kNext > cap) break;
    hPrev = hCurr;
    hCurr = hNext;
    kPrev = kCurr;
    kCurr = kNext;
    const frac = value.minus(intPart);
    if (frac.isZero()) break;
    value = new Decimal(1).div(frac);
  }

  let result = normalizePair(hCurr, kCurr);
  if (x.isNegative() && result.num !== "0") {
    result = normalizePair(-BigInt(result.num), BigInt(result.den));
  }
  return result;
}

export { gcd };
