import { FractionDomainError, FractionParseError } from "./errors.js";
import type { Fraction } from "./types.js";

export function parseBigIntField(label: string, raw: string): bigint {
  const trimmed = raw.trim();
  if (!/^-?\d+$/.test(trimmed)) {
    throw new FractionParseError(`Invalid ${label} "${raw}" — expected integer string`);
  }
  return BigInt(trimmed);
}

export function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

export function normalizePair(num: bigint, den: bigint): Fraction {
  if (den === 0n) {
    throw new FractionDomainError("Fraction denominator cannot be zero");
  }
  if (den < 0n) {
    num = -num;
    den = -den;
  }
  const g = gcd(num, den);
  return {
    num: (num / g).toString(),
    den: (den / g).toString(),
  };
}

export function toPair(f: Fraction): { num: bigint; den: bigint } {
  return {
    num: parseBigIntField("numerator", f.num),
    den: parseBigIntField("denominator", f.den),
  };
}
