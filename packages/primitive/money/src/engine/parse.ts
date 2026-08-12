import { ParseError } from "../errors/index.js";
import { MoneyDecimal, type MoneyDecimalInstance } from "./decimal.js";

const AMOUNT_RE = /^([+-])?(\d+)(?:\.(\d+))?$/;

export interface ParsedAmount {
  sign: 1 | -1;
  integer: string;
  fraction: string;
  scale: number;
}

export function parseAmountString(input: string): ParsedAmount {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new ParseError("Amount string is empty");
  }
  const match = AMOUNT_RE.exec(trimmed);
  if (!match) {
    throw new ParseError(`Invalid amount string: ${input}`);
  }
  const sign: 1 | -1 = match[1] === "-" ? -1 : 1;
  const integer = match[2] ?? "0";
  const fraction = match[3] ?? "";
  return { sign, integer, fraction, scale: fraction.length };
}

export function parsedToDecimal(parsed: ParsedAmount): MoneyDecimalInstance {
  const raw = `${parsed.sign < 0 ? "-" : ""}${parsed.integer}.${parsed.fraction || "0"}`;
  return new MoneyDecimal(raw);
}

export function parsedToMinorUnits(
  parsed: ParsedAmount,
  scale: number,
): bigint {
  if (parsed.scale > scale) {
    throw new ParseError(
      `Amount has ${parsed.scale} fractional digits but target scale is ${scale}`,
    );
  }
  const padded = parsed.fraction.padEnd(scale, "0");
  const digits = `${parsed.integer}${padded}`.replace(/^0+(?=\d)/, "");
  const minor = BigInt(digits === "" ? "0" : digits);
  return parsed.sign < 0 ? -minor : minor;
}

export function isIntegerString(input: string): boolean {
  return /^-?\d+$/.test(input.trim());
}
