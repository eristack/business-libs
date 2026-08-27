import {
  pgTable,
  text as pgText,
  timestamp as pgTimestamp,
  boolean as pgBoolean,
} from "drizzle-orm/pg-core";
import {
  mysqlTable,
  varchar as mysqlVarchar,
  datetime as mysqlDatetime,
  boolean as mysqlBoolean,
} from "drizzle-orm/mysql-core";
import {
  sqliteTable,
  text as sqliteText,
  integer as sqliteInteger,
} from "drizzle-orm/sqlite-core";
import type { DrizzleDialect } from "./types.js";

const DEFAULT_TABLE_NAME = "doc_number_formats";

export function createDocNumberFormatTable(
  dialect: "pgsql",
  tableName?: string,
): ReturnType<typeof createPgsqlDocNumberFormatTable>;
export function createDocNumberFormatTable(
  dialect: "mysql",
  tableName?: string,
): ReturnType<typeof createMysqlDocNumberFormatTable>;
export function createDocNumberFormatTable(
  dialect: "sqlite",
  tableName?: string,
): ReturnType<typeof createSqliteDocNumberFormatTable>;
export function createDocNumberFormatTable(
  dialect: DrizzleDialect,
  tableName = DEFAULT_TABLE_NAME,
) {
  switch (dialect) {
    case "pgsql":
      return createPgsqlDocNumberFormatTable(tableName);
    case "mysql":
      return createMysqlDocNumberFormatTable(tableName);
    case "sqlite":
      return createSqliteDocNumberFormatTable(tableName);
    default: {
      const _exhaustive: never = dialect;
      throw new Error(`Unsupported dialect: ${String(_exhaustive)}`);
    }
  }
}

export function createPgsqlDocNumberFormatTable(tableName = DEFAULT_TABLE_NAME) {
  return pgTable(tableName, {
    id: pgText("id").primaryKey(),
    entityKey: pgText("entity_key").notNull(),
    pattern: pgText("pattern").notNull(),
    reset: pgText("reset").notNull(),
    prefix: pgText("prefix"),
    timezone: pgText("timezone"),
    active: pgBoolean("active").notNull(),
    createdAt: pgTimestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: pgTimestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  });
}

export function createMysqlDocNumberFormatTable(tableName = DEFAULT_TABLE_NAME) {
  return mysqlTable(tableName, {
    id: mysqlVarchar("id", { length: 64 }).primaryKey(),
    entityKey: mysqlVarchar("entity_key", { length: 255 }).notNull(),
    pattern: mysqlVarchar("pattern", { length: 512 }).notNull(),
    reset: mysqlVarchar("reset", { length: 32 }).notNull(),
    prefix: mysqlVarchar("prefix", { length: 128 }),
    timezone: mysqlVarchar("timezone", { length: 64 }),
    active: mysqlBoolean("active").notNull(),
    createdAt: mysqlDatetime("created_at", { mode: "date" }).notNull(),
    updatedAt: mysqlDatetime("updated_at", { mode: "date" }).notNull(),
  });
}

export function createSqliteDocNumberFormatTable(tableName = DEFAULT_TABLE_NAME) {
  return sqliteTable(tableName, {
    id: sqliteText("id").primaryKey(),
    entityKey: sqliteText("entity_key").notNull(),
    pattern: sqliteText("pattern").notNull(),
    reset: sqliteText("reset").notNull(),
    prefix: sqliteText("prefix"),
    timezone: sqliteText("timezone"),
    active: sqliteInteger("active", { mode: "boolean" }).notNull(),
    createdAt: sqliteInteger("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: sqliteInteger("updated_at", { mode: "timestamp_ms" }).notNull(),
  });
}

export type PgsqlDocNumberFormatTable = ReturnType<typeof createPgsqlDocNumberFormatTable>;
export type MysqlDocNumberFormatTable = ReturnType<typeof createMysqlDocNumberFormatTable>;
export type SqliteDocNumberFormatTable = ReturnType<typeof createSqliteDocNumberFormatTable>;
export type AnyDocNumberFormatTable =
  | PgsqlDocNumberFormatTable
  | MysqlDocNumberFormatTable
  | SqliteDocNumberFormatTable;
