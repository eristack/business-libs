import {
  pgTable,
  text as pgText,
  timestamp as pgTimestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import {
  mysqlTable,
  varchar as mysqlVarchar,
  datetime as mysqlDatetime,
  json as mysqlJson,
} from "drizzle-orm/mysql-core";
import {
  sqliteTable,
  text as sqliteText,
  integer as sqliteInteger,
} from "drizzle-orm/sqlite-core";
import type { DrizzleDialect } from "./types.js";

const DEFAULT_TABLE_NAME = "jwt_auth_refresh_tokens";

export function createRefreshTokenTable(
  dialect: "pgsql",
  tableName?: string,
): ReturnType<typeof createPgsqlRefreshTokenTable>;
export function createRefreshTokenTable(
  dialect: "mysql",
  tableName?: string,
): ReturnType<typeof createMysqlRefreshTokenTable>;
export function createRefreshTokenTable(
  dialect: "sqlite",
  tableName?: string,
): ReturnType<typeof createSqliteRefreshTokenTable>;
export function createRefreshTokenTable(
  dialect: DrizzleDialect,
  tableName = DEFAULT_TABLE_NAME,
) {
  switch (dialect) {
    case "pgsql":
      return createPgsqlRefreshTokenTable(tableName);
    case "mysql":
      return createMysqlRefreshTokenTable(tableName);
    case "sqlite":
      return createSqliteRefreshTokenTable(tableName);
    default: {
      const _exhaustive: never = dialect;
      throw new Error(`Unsupported dialect: ${String(_exhaustive)}`);
    }
  }
}

export function createPgsqlRefreshTokenTable(tableName = DEFAULT_TABLE_NAME) {
  return pgTable(tableName, {
    id: pgText("id").primaryKey(),
    subject: pgText("subject").notNull(),
    tokenHash: pgText("token_hash").notNull().unique(),
    familyId: pgText("family_id").notNull(),
    expiresAt: pgTimestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    revokedAt: pgTimestamp("revoked_at", { withTimezone: true, mode: "date" }),
    createdAt: pgTimestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    replacedByTokenId: pgText("replaced_by_token_id"),
    claims: jsonb("claims").$type<Record<string, unknown>>(),
  });
}

export function createMysqlRefreshTokenTable(tableName = DEFAULT_TABLE_NAME) {
  return mysqlTable(tableName, {
    id: mysqlVarchar("id", { length: 64 }).primaryKey(),
    subject: mysqlVarchar("subject", { length: 255 }).notNull(),
    tokenHash: mysqlVarchar("token_hash", { length: 64 }).notNull().unique(),
    familyId: mysqlVarchar("family_id", { length: 64 }).notNull(),
    expiresAt: mysqlDatetime("expires_at", { mode: "date" }).notNull(),
    revokedAt: mysqlDatetime("revoked_at", { mode: "date" }),
    createdAt: mysqlDatetime("created_at", { mode: "date" }).notNull(),
    replacedByTokenId: mysqlVarchar("replaced_by_token_id", { length: 64 }),
    claims: mysqlJson("claims").$type<Record<string, unknown>>(),
  });
}

export function createSqliteRefreshTokenTable(tableName = DEFAULT_TABLE_NAME) {
  return sqliteTable(tableName, {
    id: sqliteText("id").primaryKey(),
    subject: sqliteText("subject").notNull(),
    tokenHash: sqliteText("token_hash").notNull().unique(),
    familyId: sqliteText("family_id").notNull(),
    expiresAt: sqliteInteger("expires_at", { mode: "timestamp_ms" }).notNull(),
    revokedAt: sqliteInteger("revoked_at", { mode: "timestamp_ms" }),
    createdAt: sqliteInteger("created_at", { mode: "timestamp_ms" }).notNull(),
    replacedByTokenId: sqliteText("replaced_by_token_id"),
    claims: sqliteText("claims", { mode: "json" }).$type<Record<string, unknown>>(),
  });
}

export type PgsqlRefreshTokenTable = ReturnType<typeof createPgsqlRefreshTokenTable>;
export type MysqlRefreshTokenTable = ReturnType<typeof createMysqlRefreshTokenTable>;
export type SqliteRefreshTokenTable = ReturnType<typeof createSqliteRefreshTokenTable>;
export type AnyRefreshTokenTable =
  | PgsqlRefreshTokenTable
  | MysqlRefreshTokenTable
  | SqliteRefreshTokenTable;
