export type DrizzleDialect = "pgsql" | "mysql" | "sqlite";

import {
  pgTable,
  text as pgText,
  integer as pgInteger,
  timestamp as pgTimestamp,
  uniqueIndex as pgUniqueIndex,
} from "drizzle-orm/pg-core";
import {
  mysqlTable,
  varchar as mysqlVarchar,
  text as mysqlText,
  int as mysqlInt,
  datetime as mysqlDatetime,
  uniqueIndex as mysqlUniqueIndex,
} from "drizzle-orm/mysql-core";
import { sqliteTable, text as sqliteText, integer as sqliteInteger, uniqueIndex as sqliteUniqueIndex } from "drizzle-orm/sqlite-core";
import { entityIdColumn } from "@eristack/entity-id/drizzle";

export function createOutboxTables(dialect: DrizzleDialect, prefix = "outbox") {
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

export type OutboxTables = ReturnType<typeof createOutboxTables>;

function createPgsql(prefix: string) {
  const messages = pgTable(
    `${prefix}_messages`,
    {
      id: entityIdColumn("pgsql", "id").primaryKey(),
      aggregateType: pgText("aggregate_type").notNull(),
      aggregateId: pgText("aggregate_id").notNull(),
      messageType: pgText("message_type").notNull(),
      payloadJson: pgText("payload_json").notNull(),
      idempotencyKey: pgText("idempotency_key").notNull(),
      status: pgText("status").notNull(),
      attempts: pgInteger("attempts").notNull().default(0),
      lastError: pgText("last_error"),
      createdAt: pgTimestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
      updatedAt: pgTimestamp("updated_at", { withTimezone: true, mode: "string" }).notNull(),
    },
    (t) => [pgUniqueIndex(`${prefix}_idem_uq`).on(t.idempotencyKey)],
  );
  return { messages };
}

function createMysql(prefix: string) {
  const messages = mysqlTable(
    `${prefix}_messages`,
    {
      id: entityIdColumn("mysql", "id").primaryKey(),
      aggregateType: mysqlVarchar("aggregate_type", { length: 128 }).notNull(),
      aggregateId: mysqlVarchar("aggregate_id", { length: 191 }).notNull(),
      messageType: mysqlVarchar("message_type", { length: 128 }).notNull(),
      payloadJson: mysqlText("payload_json").notNull(),
      idempotencyKey: mysqlVarchar("idempotency_key", { length: 255 }).notNull(),
      status: mysqlVarchar("status", { length: 32 }).notNull(),
      attempts: mysqlInt("attempts").notNull().default(0),
      lastError: mysqlText("last_error"),
      createdAt: mysqlDatetime("created_at", { mode: "string" }).notNull(),
      updatedAt: mysqlDatetime("updated_at", { mode: "string" }).notNull(),
    },
    (t) => [mysqlUniqueIndex(`${prefix}_idem_uq`).on(t.idempotencyKey)],
  );
  return { messages };
}

function createSqlite(prefix: string) {
  const messages = sqliteTable(
    `${prefix}_messages`,
    {
      id: entityIdColumn("sqlite", "id").primaryKey(),
      aggregateType: sqliteText("aggregate_type").notNull(),
      aggregateId: sqliteText("aggregate_id").notNull(),
      messageType: sqliteText("message_type").notNull(),
      payloadJson: sqliteText("payload_json").notNull(),
      idempotencyKey: sqliteText("idempotency_key").notNull(),
      status: sqliteText("status").notNull(),
      attempts: sqliteInteger("attempts").notNull().default(0),
      lastError: sqliteText("last_error"),
      createdAt: sqliteText("created_at").notNull(),
      updatedAt: sqliteText("updated_at").notNull(),
    },
    (t) => [sqliteUniqueIndex(`${prefix}_idem_uq`).on(t.idempotencyKey)],
  );
  return { messages };
}
