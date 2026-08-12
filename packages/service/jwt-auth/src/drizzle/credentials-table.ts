import {
  pgTable,
  text as pgText,
  timestamp as pgTimestamp,
} from "drizzle-orm/pg-core";
import {
  mysqlTable,
  varchar as mysqlVarchar,
  datetime as mysqlDatetime,
} from "drizzle-orm/mysql-core";
import {
  sqliteTable,
  text as sqliteText,
  integer as sqliteInteger,
} from "drizzle-orm/sqlite-core";
import type { DrizzleDialect } from "./types.js";

/**
 * Default credentials table name.
 * This is a **child of the app's users table** (via `subject`), not `users`.
 */
const DEFAULT_TABLE_NAME = "jwt_auth_credentials";

export function createCredentialsTable(
  dialect: "pgsql",
  tableName?: string,
): ReturnType<typeof createPgsqlCredentialsTable>;
export function createCredentialsTable(
  dialect: "mysql",
  tableName?: string,
): ReturnType<typeof createMysqlCredentialsTable>;
export function createCredentialsTable(
  dialect: "sqlite",
  tableName?: string,
): ReturnType<typeof createSqliteCredentialsTable>;
export function createCredentialsTable(
  dialect: DrizzleDialect,
  tableName = DEFAULT_TABLE_NAME,
) {
  switch (dialect) {
    case "pgsql":
      return createPgsqlCredentialsTable(tableName);
    case "mysql":
      return createMysqlCredentialsTable(tableName);
    case "sqlite":
      return createSqliteCredentialsTable(tableName);
    default: {
      const _exhaustive: never = dialect;
      throw new Error(`Unsupported dialect: ${String(_exhaustive)}`);
    }
  }
}

export function createPgsqlCredentialsTable(tableName = DEFAULT_TABLE_NAME) {
  return pgTable(tableName, {
    id: pgText("id").primaryKey(),
    /** App user id — FK target lives in the application's users table. */
    subject: pgText("subject").notNull().unique(),
    username: pgText("username").notNull().unique(),
    passwordHash: pgText("password_hash").notNull(),
    createdAt: pgTimestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: pgTimestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
    disabledAt: pgTimestamp("disabled_at", { withTimezone: true, mode: "date" }),
  });
}

export function createMysqlCredentialsTable(tableName = DEFAULT_TABLE_NAME) {
  return mysqlTable(tableName, {
    id: mysqlVarchar("id", { length: 64 }).primaryKey(),
    subject: mysqlVarchar("subject", { length: 255 }).notNull().unique(),
    username: mysqlVarchar("username", { length: 255 }).notNull().unique(),
    passwordHash: mysqlVarchar("password_hash", { length: 255 }).notNull(),
    createdAt: mysqlDatetime("created_at", { mode: "date" }).notNull(),
    updatedAt: mysqlDatetime("updated_at", { mode: "date" }).notNull(),
    disabledAt: mysqlDatetime("disabled_at", { mode: "date" }),
  });
}

export function createSqliteCredentialsTable(tableName = DEFAULT_TABLE_NAME) {
  return sqliteTable(tableName, {
    id: sqliteText("id").primaryKey(),
    subject: sqliteText("subject").notNull().unique(),
    username: sqliteText("username").notNull().unique(),
    passwordHash: sqliteText("password_hash").notNull(),
    createdAt: sqliteInteger("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: sqliteInteger("updated_at", { mode: "timestamp_ms" }).notNull(),
    disabledAt: sqliteInteger("disabled_at", { mode: "timestamp_ms" }),
  });
}

export type PgsqlCredentialsTable = ReturnType<typeof createPgsqlCredentialsTable>;
export type MysqlCredentialsTable = ReturnType<typeof createMysqlCredentialsTable>;
export type SqliteCredentialsTable = ReturnType<typeof createSqliteCredentialsTable>;
export type AnyCredentialsTable =
  | PgsqlCredentialsTable
  | MysqlCredentialsTable
  | SqliteCredentialsTable;
