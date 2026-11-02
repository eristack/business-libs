import { VersionParseError } from "./errors.js";
import type { SemverLevel } from "./types.js";

export type SemverParts = { major: number; minor: number; patch: number };

const SEMVER_RE = /^(\d+)\.(\d+)\.(\d+)$/;

export function parseSemver(value: string): SemverParts {
  const m = value.trim().match(SEMVER_RE);
  if (!m) throw new VersionParseError(value);
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) };
}

export function formatSemver(parts: SemverParts): string {
  return `${parts.major}.${parts.minor}.${parts.patch}`;
}

export function bumpRelative(current: string, level: SemverLevel): string {
  const s = parseSemver(current);
  if (level === "patch") s.patch += 1;
  else if (level === "minor") {
    s.minor += 1;
    s.patch = 0;
  } else {
    s.major += 1;
    s.minor = 0;
    s.patch = 0;
  }
  return formatSemver(s);
}

/** Alias — apply one relative step at `level`. */
export const applyLevel = bumpRelative;

export function compareSemver(a: string, b: string): -1 | 0 | 1 {
  const left = parseSemver(a);
  const right = parseSemver(b);
  if (left.major !== right.major) return left.major < right.major ? -1 : 1;
  if (left.minor !== right.minor) return left.minor < right.minor ? -1 : 1;
  if (left.patch !== right.patch) return left.patch < right.patch ? -1 : 1;
  return 0;
}

export function bumpLevel(from: string, to: string): SemverLevel | null {
  if (compareSemver(from, to) >= 0) return null;
  if (bumpRelative(from, "patch") === to) return "patch";
  if (bumpRelative(from, "minor") === to) return "minor";
  if (bumpRelative(from, "major") === to) return "major";
  return null;
}

const LEVEL_RANK: Record<SemverLevel, number> = {
  patch: 0,
  minor: 1,
  major: 2,
};

export function maxLevel(...levels: SemverLevel[]): SemverLevel {
  if (levels.length === 0) throw new Error("maxLevel requires at least one level");
  return levels.reduce((best, next) =>
    LEVEL_RANK[next] > LEVEL_RANK[best] ? next : best,
  );
}
