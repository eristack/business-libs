const RAW_PAN = /^\d{13,19}$/;
const PAN_IN_TEXT = /\b(?:\d[ -]?){12,18}\d\b/;

/** True when string looks like a bare primary account number. */
export function isRawPanString(value: string): boolean {
  const compact = value.replace(/\s|-/g, "");
  return RAW_PAN.test(compact) && compact.length >= 13 && compact.length <= 19;
}

/** Scan JSON-like trees for PAN-shaped strings (API guard). */
export function findPanLikeStringPaths(
  value: unknown,
  path = "body",
): string[] {
  const hits: string[] = [];
  if (typeof value === "string" && isRawPanString(value)) {
    hits.push(path);
    return hits;
  }
  if (typeof value === "string" && PAN_IN_TEXT.test(value)) {
    hits.push(path);
    return hits;
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      hits.push(...findPanLikeStringPaths(value[i], `${path}[${i}]`));
    }
    return hits;
  }
  if (typeof value === "object" && value !== null) {
    for (const [key, child] of Object.entries(value)) {
      hits.push(...findPanLikeStringPaths(child, `${path}.${key}`));
    }
  }
  return hits;
}
