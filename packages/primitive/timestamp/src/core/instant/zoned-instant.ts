import { TimestampParseError } from "../errors/index.js";
import { Temporal } from "../engine/temporal.js";
import { parseInputToInstant } from "../engine/clock.js";
import {
  assertTimeZoneId,
  type TimeZoneId,
} from "../timezone/registry.js";
import { hasUtcOffsetSuffix } from "../wall/wall-clock.js";

function wallLocalMisuseHint(input: string): string {
  return (
    `"${input}" looks like wall local time (no Z or offset). ` +
    `Use wallOf(local, timezone) and wallToInstantOnce(...) for a one-shot UTC fact, ` +
    `or asInstant({ kind: "wall", local, timezone }) from API JSON.`
  );
}

function rejectWallLocalString(input: string): void {
  const trimmed = input.trim();
  if (hasUtcOffsetSuffix(trimmed)) {
    return;
  }
  try {
    Temporal.PlainDateTime.from(trimmed);
    throw new TimestampParseError(wallLocalMisuseHint(input));
  } catch (error) {
    if (error instanceof TimestampParseError) {
      throw error;
    }
  }
}

export type ZonedInstant = {
  readonly kind: "instant";
  /** Normalized UTC ISO-8601 ending in Z */
  readonly instant: string;
  readonly timezone: TimeZoneId;
};

export function instantOf(
  input: string | Date | number,
  timezone: TimeZoneId,
): ZonedInstant {
  assertTimeZoneId(timezone);
  if (typeof input === "string") {
    rejectWallLocalString(input);
  }
  try {
    const parsed = parseInputToInstant(input);
    const normalized = normalizeInstantString(parsed.toString());
    return {
      kind: "instant",
      instant: normalized,
      timezone,
    };
  } catch (error) {
    if (typeof input === "string") {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("time zone offset")) {
        throw new TimestampParseError(wallLocalMisuseHint(input));
      }
    }
    throw new TimestampParseError(
      error instanceof Error ? error.message : "Invalid instant input",
    );
  }
}

export function normalizeInstantString(value: string): string {
  if (!value.endsWith("Z")) {
    throw new TimestampParseError(
      "Instant must normalize to UTC with Z suffix",
    );
  }
  return value;
}

export function isZonedInstant(value: unknown): value is ZonedInstant {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as ZonedInstant).kind === "instant" &&
    typeof (value as ZonedInstant).instant === "string" &&
    typeof (value as ZonedInstant).timezone === "string"
  );
}
