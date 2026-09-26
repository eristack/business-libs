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

export function createCommsTables(dialect: DrizzleDialect, prefix = "comms") {
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

export type CommsTables = ReturnType<typeof createCommsTables>;

function createPgsqlTables(prefix: string) {
  const messages = pgTable(
    `${prefix}_messages`,
    {
      id: pgText("id").primaryKey(),
      channel: pgText("channel").notNull(),
      vendor: pgText("vendor").notNull(),
      idempotencyKey: pgText("idempotency_key").notNull(),
      status: pgText("status").notNull(),
      to: pgText("to").notNull(),
      subject: pgText("subject"),
      providerMessageId: pgText("provider_message_id"),
      metadataJson: pgText("metadata_json"),
      createdAt: pgTimestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
      updatedAt: pgTimestamp("updated_at", { withTimezone: true, mode: "string" }).notNull(),
    },
    (t) => [pgUniqueIndex(`${prefix}_msg_idem_uq`).on(t.vendor, t.idempotencyKey)],
  );

  const deliveryEvents = pgTable(`${prefix}_delivery_events`, {
    id: pgText("id").primaryKey(),
    vendor: pgText("vendor").notNull(),
    eventType: pgText("event_type").notNull(),
    providerEventId: pgText("provider_event_id"),
    messageId: pgText("message_id"),
    payloadJson: pgText("payload_json").notNull(),
    receivedAt: pgTimestamp("received_at", { withTimezone: true, mode: "string" }).notNull(),
  });

  return { messages, deliveryEvents };
}

function createMysqlTables(prefix: string) {
  const messages = mysqlTable(
    `${prefix}_messages`,
    {
      id: mysqlVarchar("id", { length: 36 }).primaryKey(),
      channel: mysqlVarchar("channel", { length: 16 }).notNull(),
      vendor: mysqlVarchar("vendor", { length: 64 }).notNull(),
      idempotencyKey: mysqlVarchar("idempotency_key", { length: 255 }).notNull(),
      status: mysqlVarchar("status", { length: 32 }).notNull(),
      to: mysqlVarchar("to", { length: 255 }).notNull(),
      subject: mysqlVarchar("subject", { length: 512 }),
      providerMessageId: mysqlVarchar("provider_message_id", { length: 255 }),
      metadataJson: mysqlText("metadata_json"),
      createdAt: mysqlDatetime("created_at", { mode: "string" }).notNull(),
      updatedAt: mysqlDatetime("updated_at", { mode: "string" }).notNull(),
    },
    (t) => [mysqlUniqueIndex(`${prefix}_msg_idem_uq`).on(t.vendor, t.idempotencyKey)],
  );

  const deliveryEvents = mysqlTable(`${prefix}_delivery_events`, {
    id: mysqlVarchar("id", { length: 36 }).primaryKey(),
    vendor: mysqlVarchar("vendor", { length: 64 }).notNull(),
    eventType: mysqlVarchar("event_type", { length: 128 }).notNull(),
    providerEventId: mysqlVarchar("provider_event_id", { length: 255 }),
    messageId: mysqlVarchar("message_id", { length: 36 }),
    payloadJson: mysqlText("payload_json").notNull(),
    receivedAt: mysqlDatetime("received_at", { mode: "string" }).notNull(),
  });

  return { messages, deliveryEvents };
}

function createSqliteTables(prefix: string) {
  const messages = sqliteTable(
    `${prefix}_messages`,
    {
      id: sqliteText("id").primaryKey(),
      channel: sqliteText("channel").notNull(),
      vendor: sqliteText("vendor").notNull(),
      idempotencyKey: sqliteText("idempotency_key").notNull(),
      status: sqliteText("status").notNull(),
      to: sqliteText("to").notNull(),
      subject: sqliteText("subject"),
      providerMessageId: sqliteText("provider_message_id"),
      metadataJson: sqliteText("metadata_json"),
      createdAt: sqliteText("created_at").notNull(),
      updatedAt: sqliteText("updated_at").notNull(),
    },
    (t) => [sqliteUniqueIndex(`${prefix}_msg_idem_uq`).on(t.vendor, t.idempotencyKey)],
  );

  const deliveryEvents = sqliteTable(`${prefix}_delivery_events`, {
    id: sqliteText("id").primaryKey(),
    vendor: sqliteText("vendor").notNull(),
    eventType: sqliteText("event_type").notNull(),
    providerEventId: sqliteText("provider_event_id"),
    messageId: sqliteText("message_id"),
    payloadJson: sqliteText("payload_json").notNull(),
    receivedAt: sqliteText("received_at").notNull(),
  });

  return { messages, deliveryEvents };
}
