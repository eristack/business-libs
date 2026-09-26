export type DrizzleDialect = "pgsql" | "mysql" | "sqlite";

import {
  pgTable,
  text as pgText,
  timestamp as pgTimestamp,
} from "drizzle-orm/pg-core";
import {
  mysqlTable,
  varchar as mysqlVarchar,
  text as mysqlText,
  datetime as mysqlDatetime,
} from "drizzle-orm/mysql-core";
import { sqliteTable, text as sqliteText } from "drizzle-orm/sqlite-core";

/** Default: `{prefix}_files` — canonical metadata rows; blob bytes live in object storage. */
export function createFileManagerTables(
  dialect: DrizzleDialect,
  prefix = "file_manager",
) {
  switch (dialect) {
    case "pgsql":
      return createPgsqlTables(prefix);
    case "mysql":
      return createMysqlTables(prefix);
    case "sqlite":
      return createSqliteTables(prefix);
    default: {
      const _e: never = dialect;
      throw new Error(`Unsupported dialect: ${String(_e)}`);
    }
  }
}

function createPgsqlTables(prefix: string) {
  const files = pgTable(`${prefix}_files`, {
    id: pgText("id").primaryKey(),
    status: pgText("status").notNull(),
    namespace: pgText("namespace").notNull(),
    ownerId: pgText("owner_id"),
    refJson: pgText("ref_json").notNull(),
    createdAt: pgTimestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
    updatedAt: pgTimestamp("updated_at", { withTimezone: true, mode: "string" }).notNull(),
    readyAt: pgTimestamp("ready_at", { withTimezone: true, mode: "string" }),
  });
  return { files };
}

function createMysqlTables(prefix: string) {
  const files = mysqlTable(`${prefix}_files`, {
    id: mysqlVarchar("id", { length: 36 }).primaryKey(),
    status: mysqlVarchar("status", { length: 32 }).notNull(),
    namespace: mysqlVarchar("namespace", { length: 128 }).notNull(),
    ownerId: mysqlVarchar("owner_id", { length: 128 }),
    refJson: mysqlText("ref_json").notNull(), // long JSON blob
    createdAt: mysqlDatetime("created_at", { mode: "string", fsp: 3 }).notNull(),
    updatedAt: mysqlDatetime("updated_at", { mode: "string", fsp: 3 }).notNull(),
    readyAt: mysqlDatetime("ready_at", { mode: "string", fsp: 3 }),
  });
  return { files };
}

function createSqliteTables(prefix: string) {
  const files = sqliteTable(`${prefix}_files`, {
    id: sqliteText("id").primaryKey(),
    status: sqliteText("status").notNull(),
    namespace: sqliteText("namespace").notNull(),
    ownerId: sqliteText("owner_id"),
    refJson: sqliteText("ref_json").notNull(),
    createdAt: sqliteText("created_at").notNull(),
    updatedAt: sqliteText("updated_at").notNull(),
    readyAt: sqliteText("ready_at"),
  });
  return { files };
}

export type FileManagerTables = ReturnType<typeof createFileManagerTables>;
