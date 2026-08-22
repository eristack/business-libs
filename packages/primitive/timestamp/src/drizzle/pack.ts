import {
  TimestampParseError,
  InvalidTimeZoneError,
} from "../core/errors/index.js";
import { instantOf } from "../core/instant/zoned-instant.js";
import type { ZonedInstant } from "../core/instant/zoned-instant.js";
import { wallOf } from "../core/wall/wall-clock.js";
import type { WallClock } from "../core/wall/wall-clock.js";
import type { TimestampAdapterOptions } from "./types.js";
import {
  resolveInstantColumnNames,
  resolveSharedTimezoneColumnNames,
  resolveWallColumnNames,
} from "./naming.js";

function readRowValue(row: Record<string, unknown>, key: string): unknown {
  return row[key];
}

function assertPairedNullability(
  a: unknown,
  b: unknown,
  path: string,
): void {
  const aNull = a == null;
  const bNull = b == null;
  if (aNull !== bNull) {
    throw new TimestampParseError(
      `${path}: value and timezone must both be null or both be set`,
    );
  }
}

export function packInstant(
  logicalName: string,
  ts: ZonedInstant,
  options?: TimestampAdapterOptions,
): Record<string, string> {
  const names = resolveInstantColumnNames(logicalName, options);
  return {
    [names.instantProperty]: ts.instant,
    [names.timezoneProperty]: ts.timezone,
  };
}

export function unpackInstant(
  logicalName: string,
  row: Record<string, unknown>,
  options?: TimestampAdapterOptions,
): ZonedInstant | null {
  const names = resolveInstantColumnNames(logicalName, options);
  const instant = readRowValue(row, names.instantProperty);
  const timezone = readRowValue(row, names.timezoneProperty);
  assertPairedNullability(instant, timezone, logicalName);
  if (instant == null || timezone == null) return null;

  try {
    return instantOf(String(instant), String(timezone));
  } catch (error) {
    if (
      error instanceof TimestampParseError ||
      error instanceof InvalidTimeZoneError
    ) {
      throw error;
    }
    throw new TimestampParseError(
      `${logicalName}: ${error instanceof Error ? error.message : "invalid instant row"}`,
    );
  }
}

export function packWall(
  logicalName: string,
  ts: WallClock,
  options?: TimestampAdapterOptions,
): Record<string, string> {
  const names = resolveWallColumnNames(logicalName, options);
  return {
    [names.localProperty]: ts.local,
    [names.timezoneProperty]: ts.timezone,
  };
}

export function unpackWall(
  logicalName: string,
  row: Record<string, unknown>,
  options?: TimestampAdapterOptions,
): WallClock | null {
  const names = resolveWallColumnNames(logicalName, options);
  const local = readRowValue(row, names.localProperty);
  const timezone = readRowValue(row, names.timezoneProperty);
  assertPairedNullability(local, timezone, logicalName);
  if (local == null || timezone == null) return null;

  return wallOf(String(local), String(timezone));
}

export function packTimeZoneId(
  code: string,
  options?: TimestampAdapterOptions & { logicalName?: string },
): Record<string, string> {
  const names = resolveSharedTimezoneColumnNames(
    options?.logicalName ?? "timezone",
    options,
  );
  return { [names.property]: code };
}

export function unpackTimeZoneId(
  row: Record<string, unknown>,
  options?: TimestampAdapterOptions & { logicalName?: string },
): string | null {
  const names = resolveSharedTimezoneColumnNames(
    options?.logicalName ?? "timezone",
    options,
  );
  const value = readRowValue(row, names.property);
  return value == null ? null : String(value);
}
