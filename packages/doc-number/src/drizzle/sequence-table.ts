import {
  pgTable,
  text as pgText,
  timestamp as pgTimestamp,
  integer as pgInteger,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import {
  mysqlTable,
  varchar as mysqlVarchar,
  datetime as mysqlDatetime,
  int as mysqlInt,
  uniqueIndex as mysqlUniqueIndex,
} from "drizzle-orm/mysql-core";
import {
  sqliteTable,
  text as sqliteText,
  integer as sqliteInteger,
  uniqueIndex as sqliteUniqueIndex,
} from "drizzle-orm/sqlite-core";
import type { DrizzleDialect } from "./types.js";

const DEFAULT_TABLE_NAME = "doc_number_sequences";

export function createDocNumberSequenceTable(
  dialect: "pgsql",
  tableName?: string,
): ReturnType<typeof createPgsqlDocNumberSequenceTable>;
export function createDocNumberSequenceTable(
  dialect: "mysql",
  tableName?: string,
): ReturnType<typeof createMysqlDocNumberSequenceTable>;
export function createDocNumberSequenceTable(
  dialect: "sqlite",
  tableName?: string,
): ReturnType<typeof createSqliteDocNumberSequenceTable>;
export function createDocNumberSequenceTable(
  dialect: DrizzleDialect,
  tableName = DEFAULT_TABLE_NAME,
) {
  switch (dialect) {
    case "pgsql":
      return createPgsqlDocNumberSequenceTable(tableName);
    case "mysql":
      return createMysqlDocNumberSequenceTable(tableName);
    case "sqlite":
      return createSqliteDocNumberSequenceTable(tableName);
    default: {
      const _exhaustive: never = dialect;
      throw new Error(`Unsupported dialect: ${String(_exhaustive)}`);
    }
  }
}

export function createPgsqlDocNumberSequenceTable(tableName = DEFAULT_TABLE_NAME) {
  return pgTable(
    tableName,
    {
      id: pgText("id").primaryKey(),
      formatId: pgText("format_id").notNull(),
      periodKey: pgText("period_key").notNull(),
      currentValue: pgInteger("current_value").notNull(),
      updatedAt: pgTimestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
    },
    (t) => [uniqueIndex(`${tableName}_format_period_uidx`).on(t.formatId, t.periodKey)],
  );
}

export function createMysqlDocNumberSequenceTable(tableName = DEFAULT_TABLE_NAME) {
  return mysqlTable(
    tableName,
    {
      id: mysqlVarchar("id", { length: 64 }).primaryKey(),
      formatId: mysqlVarchar("format_id", { length: 64 }).notNull(),
      periodKey: mysqlVarchar("period_key", { length: 32 }).notNull(),
      currentValue: mysqlInt("current_value").notNull(),
      updatedAt: mysqlDatetime("updated_at", { mode: "date" }).notNull(),
    },
    (t) => [mysqlUniqueIndex(`${tableName}_format_period_uidx`).on(t.formatId, t.periodKey)],
  );
}

export function createSqliteDocNumberSequenceTable(tableName = DEFAULT_TABLE_NAME) {
  return sqliteTable(
    tableName,
    {
      id: sqliteText("id").primaryKey(),
      formatId: sqliteText("format_id").notNull(),
      periodKey: sqliteText("period_key").notNull(),
      currentValue: sqliteInteger("current_value").notNull(),
      updatedAt: sqliteInteger("updated_at", { mode: "timestamp_ms" }).notNull(),
    },
    (t) => [sqliteUniqueIndex(`${tableName}_format_period_uidx`).on(t.formatId, t.periodKey)],
  );
}

export type PgsqlDocNumberSequenceTable = ReturnType<typeof createPgsqlDocNumberSequenceTable>;
export type MysqlDocNumberSequenceTable = ReturnType<typeof createMysqlDocNumberSequenceTable>;
export type SqliteDocNumberSequenceTable = ReturnType<typeof createSqliteDocNumberSequenceTable>;
export type AnyDocNumberSequenceTable =
  | PgsqlDocNumberSequenceTable
  | MysqlDocNumberSequenceTable
  | SqliteDocNumberSequenceTable;
