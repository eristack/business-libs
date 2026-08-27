import {
  compareWall,
  isWallClock,
  isWallInRange,
  wallOf,
  type WallClock,
} from "@eristack/timestamp";

export function isWallFieldType(type: string | undefined): boolean {
  return type === "wall";
}

const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}/;

function assertTimezone(timezone: string): string {
  return timezone.trim() || "UTC";
}

/** Normalize wall field values to a comparable WallClock. */
export function toWallComparable(
  value: unknown,
  timezone: string,
): WallClock | null {
  const zone = assertTimezone(timezone);
  if (value == null) return null;
  if (isWallClock(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || !DATE_PREFIX.test(trimmed)) return null;
    return wallOf(trimmed, zone);
  }
  return null;
}

export function compareWallValues(
  left: unknown,
  right: unknown,
  timezone: string,
): number {
  const zone = assertTimezone(timezone);
  const a = toWallComparable(left, zone);
  const b = toWallComparable(right, zone);
  if (a && b) {
    return compareWall(a, b);
  }
  const keyA = a?.local ?? (typeof left === "string" ? left.trim() : "");
  const keyB = b?.local ?? (typeof right === "string" ? right.trim() : "");
  return keyA.localeCompare(keyB);
}

export function wallBetweenInclusive(
  value: unknown,
  min: unknown,
  max: unknown,
  timezone: string,
): boolean {
  const zone = assertTimezone(timezone);
  const wall = toWallComparable(value, zone);
  const start = toWallComparable(min, zone);
  const end = toWallComparable(max, zone);
  if (wall && start && end) {
    return isWallInRange(wall, start, end);
  }
  const key = wall?.local ?? String(value ?? "");
  const minKey = start?.local ?? String(min ?? "");
  const maxKey = end?.local ?? String(max ?? "");
  return key >= minKey && key <= maxKey;
}
