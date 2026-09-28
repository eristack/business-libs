export type DrizzleDialect = "pgsql" | "mysql" | "sqlite";

import {
  pgTable,
  text as pgText,
  timestamp as pgTimestamp,
  uniqueIndex as pgUniqueIndex,
} from "drizzle-orm/pg-core";
import {
  mysqlTable,
  varchar as mysqlVarchar,
  text as mysqlText,
  datetime as mysqlDatetime,
  uniqueIndex as mysqlUniqueIndex,
} from "drizzle-orm/mysql-core";
import { sqliteTable, text as sqliteText, uniqueIndex as sqliteUniqueIndex } from "drizzle-orm/sqlite-core";

export function createIdempotencyTables(dialect: DrizzleDialect, prefix = "idempotency") {
  switch (dialect) {
    case "pgsql":
      return createPgsql(prefix);
    case "mysql":
      return createMysql(prefix);
    case "sqlite":
      return createSqlite(prefix);
    default: {
      const _e: never = dialect;
      throw new Error(`Unsupported dialect: ${String(_e)}`);
    }
  }
}

export type IdempotencyTables = ReturnType<typeof createIdempotencyTables>;

function createPgsql(prefix: string) {
  const records = pgTable(
    `${prefix}_records`,
    {
      storageKey: pgText("storage_key").primaryKey(),
      state: pgText("state").notNull(),
      requestHash: pgText("request_hash").notNull(),
      responseJson: pgText("response_json"),
      errorMessage: pgText("error_message"),
      leaseExpiresAt: pgTimestamp("lease_expires_at", {
        withTimezone: true,
        mode: "string",
      }),
      createdAt: pgTimestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
      updatedAt: pgTimestamp("updated_at", { withTimezone: true, mode: "string" }).notNull(),
    },
    (t) => [pgUniqueIndex(`${prefix}_records_key_uq`).on(t.storageKey)],
  );
  return { records };
}

function createMysql(prefix: string) {
  const records = mysqlTable(
    `${prefix}_records`,
    {
      storageKey: mysqlVarchar("storage_key", { length: 512 }).primaryKey(),
      state: mysqlVarchar("state", { length: 32 }).notNull(),
      requestHash: mysqlVarchar("request_hash", { length: 64 }).notNull(),
      responseJson: mysqlText("response_json"),
      errorMessage: mysqlText("error_message"),
      leaseExpiresAt: mysqlDatetime("lease_expires_at", { mode: "string" }),
      createdAt: mysqlDatetime("created_at", { mode: "string" }).notNull(),
      updatedAt: mysqlDatetime("updated_at", { mode: "string" }).notNull(),
    },
    (t) => [mysqlUniqueIndex(`${prefix}_records_key_uq`).on(t.storageKey)],
  );
  return { records };
}

function createSqlite(prefix: string) {
  const records = sqliteTable(
    `${prefix}_records`,
    {
      storageKey: sqliteText("storage_key").primaryKey(),
      state: sqliteText("state").notNull(),
      requestHash: sqliteText("request_hash").notNull(),
      responseJson: sqliteText("response_json"),
      errorMessage: sqliteText("error_message"),
      leaseExpiresAt: sqliteText("lease_expires_at"),
      createdAt: sqliteText("created_at").notNull(),
      updatedAt: sqliteText("updated_at").notNull(),
    },
    (t) => [sqliteUniqueIndex(`${prefix}_records_key_uq`).on(t.storageKey)],
  );
  return { records };
}
