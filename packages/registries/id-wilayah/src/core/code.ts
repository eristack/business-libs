import { AdminDivisionError } from "./errors.js";
import type {
  AdminDivisionCode,
  IdOfficialAdminLevel,
  ParsedAdminDivisionCode,
} from "./types.js";

const OFFICIAL_LENGTHS: IdOfficialAdminLevel[] = [
  "province",
  "regency",
  "district",
  "village",
];

const LENGTH_BY_LEVEL: Record<IdOfficialAdminLevel, number> = {
  province: 2,
  regency: 4,
  district: 7,
  village: 10,
};

function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function officialLevelForCodeLength(len: number): IdOfficialAdminLevel | null {
  if (len === 2) return "province";
  if (len === 4) return "regency";
  if (len === 7) return "district";
  if (len === 10) return "village";
  return null;
}

/** Strip formatting; validate official lengths (2 / 4 / 7 / 10). */
export function normalizeAdminDivisionCode(raw: string): AdminDivisionCode {
  const normalized = digitsOnly(raw.trim());
  if (!normalized) {
    throw new AdminDivisionError(
      `Invalid admin division code "${raw}" — empty after normalization`,
    );
  }
  if (!/^\d+$/.test(normalized)) {
    throw new AdminDivisionError(`Invalid admin division code "${raw}" — digits only`);
  }
  const level = officialLevelForCodeLength(normalized.length);
  if (!level) {
    throw new AdminDivisionError(
      `Invalid admin division code "${raw}" — expected 2, 4, 7, or 10 digits, got ${normalized.length}`,
    );
  }
  return normalized as AdminDivisionCode;
}

export function parseAdminDivisionCode(raw: string): ParsedAdminDivisionCode {
  const code = normalizeAdminDivisionCode(raw);
  const level = officialLevelForCodeLength(code.length)!;
  const province = code.slice(0, 2);
  const segments: ParsedAdminDivisionCode["segments"] = { province };
  if (code.length >= 4) {
    segments.regency = code.slice(0, 4);
  }
  if (code.length >= 7) {
    segments.district = code.slice(0, 7);
  }
  if (code.length === 10) {
    segments.village = code;
  }
  return { code, level, segments };
}

/** Parent official code (shorter prefix) or null at province level. */
export function parentAdminDivisionCode(code: AdminDivisionCode): AdminDivisionCode | null {
  const level = officialLevelForCodeLength(code.length);
  if (!level || level === "province") return null;
  const idx = OFFICIAL_LENGTHS.indexOf(level);
  const parentLevel = OFFICIAL_LENGTHS[idx - 1];
  const len = LENGTH_BY_LEVEL[parentLevel];
  return code.slice(0, len) as AdminDivisionCode;
}

/**
 * App-local codes for hamlet / community block / neighborhood under an official village.
 * Format: `{village10}.{kindLetter}{localId}` — not in the national registry.
 */
export function formatSubVillageLocalCode(
  villageCode: string,
  kind: "hamlet" | "community_block" | "neighborhood",
  localId: string,
): string {
  const village = normalizeAdminDivisionCode(villageCode);
  const letter =
    kind === "hamlet" ? "H" : kind === "community_block" ? "W" : "N";
  const id = localId.trim().replace(/\s+/g, "");
  if (!id) {
    throw new AdminDivisionError("localId is required for sub-village codes");
  }
  return `${village}.${letter}${id}`;
}

export function compareAdminDivisionCode(a: string, b: string): number {
  return normalizeAdminDivisionCode(a).localeCompare(
    normalizeAdminDivisionCode(b),
    undefined,
    { numeric: true },
  );
}
