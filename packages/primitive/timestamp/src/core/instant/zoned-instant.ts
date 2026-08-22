import { TimestampParseError } from "../errors/index.js";
import { parseInputToInstant } from "../engine/clock.js";
import {
  assertTimeZoneId,
  type TimeZoneId,
} from "../timezone/registry.js";

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
  try {
    const parsed = parseInputToInstant(input);
    const normalized = normalizeInstantString(parsed.toString());
    return {
      kind: "instant",
      instant: normalized,
      timezone,
    };
  } catch (error) {
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
