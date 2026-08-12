import type { ResetPeriod } from "./types.js";

function utcParts(at: Date) {
  return {
    year: at.getUTCFullYear(),
    month: at.getUTCMonth() + 1,
    day: at.getUTCDate(),
  };
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Period bucket key for sequence rows. Uses UTC calendar parts. */
export function periodKeyFor(reset: ResetPeriod, at: Date): string {
  const { year, month, day } = utcParts(at);
  switch (reset) {
    case "never":
      return "*";
    case "yearly":
      return String(year);
    case "monthly":
      return `${year}-${pad2(month)}`;
    case "daily":
      return `${year}-${pad2(month)}-${pad2(day)}`;
    default: {
      const _exhaustive: never = reset;
      throw new Error(`Unsupported reset: ${String(_exhaustive)}`);
    }
  }
}

export function datePartsUtc(at: Date): {
  YYYY: string;
  YY: string;
  MM: string;
  DD: string;
} {
  const { year, month, day } = utcParts(at);
  return {
    YYYY: String(year),
    YY: String(year).slice(-2),
    MM: pad2(month),
    DD: pad2(day),
  };
}
