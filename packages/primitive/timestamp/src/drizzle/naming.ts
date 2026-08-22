import type {
  TimestampAdapterOptions,
  TimestampColumnNaming,
  ResolvedInstantColumnNames,
  ResolvedWallColumnNames,
} from "./types.js";

export const DEFAULT_TIMESTAMP_COLUMN_NAMING: TimestampColumnNaming = {
  instantSuffix: "_at",
  wallLocalSuffix: "_local",
  timezoneSuffix: "_timezone",
  sharedTimezoneColumn: "timezone",
};

function toSnake(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/-/g, "_")
    .toLowerCase();
}

function toCamel(value: string): string {
  return value.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

function mergeNaming(
  partial?: Partial<TimestampColumnNaming>,
): TimestampColumnNaming {
  return { ...DEFAULT_TIMESTAMP_COLUMN_NAMING, ...partial };
}

function logicalBase(logicalName: string): string {
  return toSnake(logicalName);
}

export function resolveInstantColumnNames(
  logicalName: string,
  options?: TimestampAdapterOptions,
): ResolvedInstantColumnNames {
  const naming = mergeNaming(options?.naming);
  const base = logicalBase(logicalName);
  const instantSql = `${base}${naming.instantSuffix}`;
  const timezoneSql =
    options?.timezoneColumn != null
      ? toSnake(options.timezoneColumn)
      : `${base}${naming.timezoneSuffix}`;
  return {
    logicalName,
    instantSql,
    timezoneSql,
    instantProperty: toCamel(instantSql),
    timezoneProperty: toCamel(timezoneSql),
  };
}

export function resolveWallColumnNames(
  logicalName: string,
  options?: TimestampAdapterOptions,
): ResolvedWallColumnNames {
  const naming = mergeNaming(options?.naming);
  const base = logicalBase(logicalName);
  const localSql = `${base}${naming.wallLocalSuffix}`;
  const timezoneSql =
    options?.timezoneColumn != null
      ? toSnake(options.timezoneColumn)
      : `${base}${naming.timezoneSuffix}`;
  return {
    logicalName,
    localSql,
    timezoneSql,
    localProperty: toCamel(localSql),
    timezoneProperty: toCamel(timezoneSql),
  };
}

export function resolveSharedTimezoneColumnNames(
  logicalName = "timezone",
  options?: TimestampAdapterOptions,
) {
  const naming = mergeNaming(options?.naming);
  const sql = toSnake(logicalName || naming.sharedTimezoneColumn);
  return {
    sql,
    property: toCamel(sql),
  };
}

export function timestampGridFields(
  logicalName: string,
  mode: "instantPaired" | "wallPaired",
  options?: TimestampAdapterOptions,
): import("./types.js").TimestampGridFields {
  if (mode === "instantPaired") {
    const names = resolveInstantColumnNames(logicalName, options);
    return {
      instant: names.instantSql,
      timezone: names.timezoneSql,
    };
  }
  const names = resolveWallColumnNames(logicalName, options);
  return {
    local: names.localSql,
    timezone: names.timezoneSql,
  };
}
