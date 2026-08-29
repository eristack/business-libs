const DECIMAL_STRING = /^-?\d+(?:\.\d+)?$/;

function parseDecimalParts(value: string): {
  negative: boolean;
  int: string;
  frac: string;
} | null {
  const trimmed = value.trim();
  if (!DECIMAL_STRING.test(trimmed)) return null;
  const negative = trimmed.startsWith("-");
  const unsigned = negative ? trimmed.slice(1) : trimmed;
  const [int = "0", frac = ""] = unsigned.split(".");
  const normalizedInt = int.replace(/^0+(?=\d)/, "") || "0";
  return { negative, int: normalizedInt, frac };
}

/** Compare two decimal strings without JS float coercion. */
export function compareDecimalStrings(left: string, right: string): number {
  const a = parseDecimalParts(left);
  const b = parseDecimalParts(right);
  if (!a || !b) {
    return String(left).localeCompare(String(right));
  }
  if (a.negative !== b.negative) {
    return a.negative ? -1 : 1;
  }
  const sign = a.negative ? -1 : 1;

  if (a.int.length !== b.int.length) {
    return sign * (a.int.length > b.int.length ? 1 : -1);
  }
  if (a.int !== b.int) {
    return sign * (a.int > b.int ? 1 : -1);
  }

  const maxFrac = Math.max(a.frac.length, b.frac.length);
  const aFrac = a.frac.padEnd(maxFrac, "0");
  const bFrac = b.frac.padEnd(maxFrac, "0");
  if (aFrac === bFrac) return 0;
  return sign * (aFrac > bFrac ? 1 : -1);
}
