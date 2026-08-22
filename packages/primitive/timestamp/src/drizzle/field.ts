import type { ZonedInstant } from "../core/instant/zoned-instant.js";
import type { WallClock } from "../core/wall/wall-clock.js";
import { instantColumns, wallColumns, timeZoneColumn } from "./columns.js";
import type {
  DrizzleDialect,
  TimestampAdapterOptions,
  TimestampGridFields,
  ResolvedInstantColumnNames,
  ResolvedWallColumnNames,
} from "./types.js";
import {
  resolveInstantColumnNames,
  resolveWallColumnNames,
  timestampGridFields,
} from "./naming.js";
import {
  packInstant,
  packWall,
  packTimeZoneId,
  unpackInstant,
  unpackWall,
  unpackTimeZoneId,
} from "./pack.js";

export type InstantFieldOptions = TimestampAdapterOptions;

export type InstantFieldBinding = {
  logicalName: string;
  names: ResolvedInstantColumnNames;
  columns: Record<string, unknown>;
  gridFields: TimestampGridFields;
  pack(ts: ZonedInstant): Record<string, string>;
  unpack(row: Record<string, unknown>): ZonedInstant | null;
};

export type WallFieldBinding = {
  logicalName: string;
  names: ResolvedWallColumnNames;
  columns: Record<string, unknown>;
  gridFields: TimestampGridFields;
  pack(ts: WallClock): Record<string, string>;
  unpack(row: Record<string, unknown>): WallClock | null;
};

export type TimeZoneFieldBinding = {
  logicalName: string;
  columns: Record<string, unknown>;
  pack(zone: string): Record<string, string>;
  unpack(row: Record<string, unknown>): string | null;
};

export function instantField(
  dialect: DrizzleDialect,
  logicalName: string,
  options?: InstantFieldOptions,
): InstantFieldBinding {
  const names = resolveInstantColumnNames(logicalName, options);
  const columns = instantColumns(dialect, logicalName, options);
  const gridFields = timestampGridFields(logicalName, "instantPaired", options);
  return {
    logicalName,
    names,
    columns,
    gridFields,
    pack(ts) {
      return packInstant(logicalName, ts, options);
    },
    unpack(row) {
      return unpackInstant(logicalName, row, options);
    },
  };
}

export function wallField(
  dialect: DrizzleDialect,
  logicalName: string,
  options?: TimestampAdapterOptions,
): WallFieldBinding {
  const names = resolveWallColumnNames(logicalName, options);
  const columns = wallColumns(dialect, logicalName, options);
  const gridFields = timestampGridFields(logicalName, "wallPaired", options);
  return {
    logicalName,
    names,
    columns,
    gridFields,
    pack(ts) {
      return packWall(logicalName, ts, options);
    },
    unpack(row) {
      return unpackWall(logicalName, row, options);
    },
  };
}

export function timeZoneField(
  dialect: DrizzleDialect,
  logicalName = "timezone",
  options?: TimestampAdapterOptions,
): TimeZoneFieldBinding {
  return {
    logicalName,
    columns: timeZoneColumn(dialect, logicalName, options),
    pack(code) {
      return packTimeZoneId(code, { ...options, logicalName });
    },
    unpack(row) {
      return unpackTimeZoneId(row, { ...options, logicalName });
    },
  };
}
