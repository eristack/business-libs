import { InvalidPatternError } from "./errors.js";

export type TokenNode =
  | { kind: "literal"; value: string }
  | { kind: "YYYY" }
  | { kind: "YY" }
  | { kind: "MM" }
  | { kind: "DD" }
  | { kind: "SEQ"; width: number };

const TOKEN_RE = /\{(YYYY|YY|MM|DD|SEQ(?::(\d+))?)\}/g;

export function parsePattern(pattern: string): TokenNode[] {
  if (typeof pattern !== "string" || pattern.length === 0) {
    throw new InvalidPatternError("Pattern must be a non-empty string");
  }

  const nodes: TokenNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;

  while ((match = TOKEN_RE.exec(pattern)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({ kind: "literal", value: pattern.slice(lastIndex, match.index) });
    }

    const token = match[1]!;
    if (token === "YYYY") nodes.push({ kind: "YYYY" });
    else if (token === "YY") nodes.push({ kind: "YY" });
    else if (token === "MM") nodes.push({ kind: "MM" });
    else if (token === "DD") nodes.push({ kind: "DD" });
    else if (token.startsWith("SEQ")) {
      const widthRaw = match[2];
      const width = widthRaw === undefined ? 1 : Number(widthRaw);
      if (!Number.isInteger(width) || width < 1 || width > 32) {
        throw new InvalidPatternError(
          `Invalid SEQ width in "${match[0]}"; expected 1–32`,
        );
      }
      nodes.push({ kind: "SEQ", width });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < pattern.length) {
    nodes.push({ kind: "literal", value: pattern.slice(lastIndex) });
  }

  const braceToken = /\{[^}]*\}?/g;
  let braceMatch: RegExpExecArray | null;
  while ((braceMatch = braceToken.exec(pattern)) !== null) {
    const raw = braceMatch[0]!;
    if (!/^\{(YYYY|YY|MM|DD|SEQ(?::\d+)?)\}$/.test(raw)) {
      throw new InvalidPatternError(
        `Pattern contains unknown or malformed tokens: "${raw}" in "${pattern}"`,
      );
    }
  }

  if (!nodes.some((n) => n.kind === "SEQ")) {
    throw new InvalidPatternError("Pattern must include a {SEQ} or {SEQ:n} token");
  }

  const seqCount = nodes.filter((n) => n.kind === "SEQ").length;
  if (seqCount > 1) {
    throw new InvalidPatternError("Pattern must include exactly one SEQ token");
  }

  return nodes;
}

export function padSequence(sequence: number, width: number): string {
  if (!Number.isInteger(sequence) || sequence < 0) {
    throw new InvalidPatternError("Sequence must be a non-negative integer");
  }
  const raw = String(sequence);
  return raw.length >= width ? raw : raw.padStart(width, "0");
}
