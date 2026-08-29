import Decimal from "decimal.js";
import type { Percent, PercentInput } from "./types.js";

export class PercentParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PercentParseError";
  }
}

function normalizeRatio(ratio: Decimal): Percent {
  if (ratio.isNegative()) {
    throw new PercentParseError("Percent ratio cannot be negative");
  }
  return { ratio: ratio.toFixed() };
}

/** Parse "11%", "0.11", or basis points via PercentInput. */
export function parsePercent(input: PercentInput | string): Percent {
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) {
      throw new PercentParseError("Percent input cannot be empty");
    }
    try {
      if (trimmed.endsWith("%")) {
        const n = trimmed.slice(0, -1).trim();
        if (!n) throw new PercentParseError('Percent symbol missing value before "%"');
        return normalizeRatio(new Decimal(n).div(100));
      }
      return normalizeRatio(new Decimal(trimmed));
    } catch (err) {
      if (err instanceof PercentParseError) throw err;
      throw new PercentParseError(`Invalid percent "${input}"`);
    }
  }
  switch (input.kind) {
    case "ratio":
      return normalizeRatio(new Decimal(input.value));
    case "percent":
      return normalizeRatio(new Decimal(input.value).div(100));
    case "basisPoints":
      return normalizeRatio(new Decimal(input.value).div(10_000));
    default: {
      const _exhaustive: never = input;
      throw new PercentParseError(`Unknown percent input ${String(_exhaustive)}`);
    }
  }
}

export function fromBasisPoints(bps: string): Percent {
  return parsePercent({ kind: "basisPoints", value: bps });
}

export function fromPercentSymbol(value: string): Percent {
  return parsePercent({ kind: "percent", value });
}

export function toBasisPoints(p: Percent): string {
  return new Decimal(p.ratio).times(10_000).toFixed(0);
}

export function toPercentSymbol(p: Percent): string {
  return `${new Decimal(p.ratio).times(100).toFixed()}%`;
}

/** amount * ratio — both decimal strings. */
export function percentOf(amount: string, percent: Percent): string {
  return new Decimal(amount).times(percent.ratio).toFixed();
}

export function plusPercent(amount: string, percent: Percent): string {
  return new Decimal(amount).times(new Decimal(1).plus(percent.ratio)).toFixed();
}

export function minusPercent(amount: string, percent: Percent): string {
  return new Decimal(amount).times(new Decimal(1).minus(percent.ratio)).toFixed();
}

export function addPercents(a: Percent, b: Percent): Percent {
  return { ratio: new Decimal(a.ratio).plus(b.ratio).toFixed() };
}
