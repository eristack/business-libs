import {
  timestamp as pgTimestamp,
  varchar as pgVarchar,
  text as pgText,
} from "drizzle-orm/pg-core";
import {
  datetime as mysqlDatetime,
  varchar as mysqlVarchar,
} from "drizzle-orm/mysql-core";
import { text as sqliteText } from "drizzle-orm/sqlite-core";
import type { DrizzleDialect, TimestampAdapterOptions } from "./types.js";
import {
  resolveInstantColumnNames,
  resolveSharedTimezoneColumnNames,
  resolveWallColumnNames,
} from "./naming.js";

const TIMEZONE_LENGTH = 64;

function instantColumn(dialect: DrizzleDialect, sqlName: string) {
  switch (dialect) {
    case "pgsql":
      return pgTimestamp(sqlName, { withTimezone: true, mode: "string" });
    case "mysql":
      return mysqlDatetime(sqlName, { mode: "string", fsp: 3 });
    case "sqlite":
      return sqliteText(sqlName);
    default: {
      const _e: never = dialect;
      throw new Error(`Unsupported dialect: ${String(_e)}`);
    }
  }
}

function timezoneColumn(dialect: DrizzleDialect, sqlName: string) {
  switch (dialect) {
    case "pgsql":
      return pgVarchar(sqlName, { length: TIMEZONE_LENGTH });
    case "mysql":
      return mysqlVarchar(sqlName, { length: TIMEZONE_LENGTH });
    case "sqlite":
      return sqliteText(sqlName);
    default: {
      const _e: never = dialect;
      throw new Error(`Unsupported dialect: ${String(_e)}`);
    }
  }
}

/** Wall local ISO — text column (never timestamptz). */
function wallLocalColumn(dialect: DrizzleDialect, sqlName: string) {
  switch (dialect) {
    case "pgsql":
      return pgText(sqlName);
    case "mysql":
      return mysqlVarchar(sqlName, { length: 64 });
    case "sqlite":
      return sqliteText(sqlName);
    default: {
      const _e: never = dialect;
      throw new Error(`Unsupported dialect: ${String(_e)}`);
    }
  }
}

export function instantColumns(
  dialect: DrizzleDialect,
  logicalName: string,
  options?: TimestampAdapterOptions,
): Record<string, unknown> {
  const names = resolveInstantColumnNames(logicalName, options);
  return {
    [names.instantProperty]: instantColumn(dialect, names.instantSql),
    [names.timezoneProperty]: timezoneColumn(dialect, names.timezoneSql),
  };
}

export function wallColumns(
  dialect: DrizzleDialect,
  logicalName: string,
  options?: TimestampAdapterOptions,
): Record<string, unknown> {
  const names = resolveWallColumnNames(logicalName, options);
  return {
    [names.localProperty]: wallLocalColumn(dialect, names.localSql),
    [names.timezoneProperty]: timezoneColumn(dialect, names.timezoneSql),
  };
}

export function timeZoneColumn(
  dialect: DrizzleDialect,
  logicalName = "timezone",
  options?: TimestampAdapterOptions,
) {
  const names = resolveSharedTimezoneColumnNames(logicalName, options);
  return {
    [names.property]: timezoneColumn(dialect, names.sql),
  };
}
