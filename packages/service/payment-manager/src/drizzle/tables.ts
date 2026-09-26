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

/** Default prefix: `payment_manager` → `{prefix}_payment_intents`, `{prefix}_gateway_events`. */
export function createPaymentManagerTables(
  dialect: DrizzleDialect,
  prefix = "payment_manager",
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

export type PaymentManagerTables = ReturnType<typeof createPaymentManagerTables>;

function createPgsqlTables(prefix: string) {
  const paymentIntents = pgTable(
    `${prefix}_payment_intents`,
    {
      id: pgText("id").primaryKey(),
      status: pgText("status").notNull(),
      gateway: pgText("gateway").notNull(),
      idempotencyKey: pgText("idempotency_key").notNull(),
      amountJson: pgText("amount_json").notNull(),
      gatewayIntentId: pgText("gateway_intent_id"),
      clientSecret: pgText("client_secret"),
      metadataJson: pgText("metadata_json"),
      ownerId: pgText("owner_id"),
      createdAt: pgTimestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
      updatedAt: pgTimestamp("updated_at", { withTimezone: true, mode: "string" }).notNull(),
    },
    (t) => [pgUniqueIndex(`${prefix}_intent_idem_uq`).on(t.gateway, t.idempotencyKey)],
  );

  const gatewayEvents = pgTable(`${prefix}_gateway_events`, {
    id: pgText("id").primaryKey(),
    gateway: pgText("gateway").notNull(),
    eventType: pgText("event_type").notNull(),
    gatewayEventId: pgText("gateway_event_id"),
    payloadJson: pgText("payload_json").notNull(),
    intentId: pgText("intent_id"),
    receivedAt: pgTimestamp("received_at", { withTimezone: true, mode: "string" }).notNull(),
  });

  return { paymentIntents, gatewayEvents };
}

function createMysqlTables(prefix: string) {
  const paymentIntents = mysqlTable(
    `${prefix}_payment_intents`,
    {
      id: mysqlVarchar("id", { length: 36 }).primaryKey(),
      status: mysqlVarchar("status", { length: 32 }).notNull(),
      gateway: mysqlVarchar("gateway", { length: 64 }).notNull(),
      idempotencyKey: mysqlVarchar("idempotency_key", { length: 255 }).notNull(),
      amountJson: mysqlText("amount_json").notNull(),
      gatewayIntentId: mysqlVarchar("gateway_intent_id", { length: 255 }),
      clientSecret: mysqlText("client_secret"),
      metadataJson: mysqlText("metadata_json"),
      ownerId: mysqlVarchar("owner_id", { length: 255 }),
      createdAt: mysqlDatetime("created_at", { mode: "string" }).notNull(),
      updatedAt: mysqlDatetime("updated_at", { mode: "string" }).notNull(),
    },
    (t) => [mysqlUniqueIndex(`${prefix}_intent_idem_uq`).on(t.gateway, t.idempotencyKey)],
  );

  const gatewayEvents = mysqlTable(`${prefix}_gateway_events`, {
    id: mysqlVarchar("id", { length: 36 }).primaryKey(),
    gateway: mysqlVarchar("gateway", { length: 64 }).notNull(),
    eventType: mysqlVarchar("event_type", { length: 128 }).notNull(),
    gatewayEventId: mysqlVarchar("gateway_event_id", { length: 255 }),
    payloadJson: mysqlText("payload_json").notNull(),
    intentId: mysqlVarchar("intent_id", { length: 36 }),
    receivedAt: mysqlDatetime("received_at", { mode: "string" }).notNull(),
  });

  return { paymentIntents, gatewayEvents };
}

function createSqliteTables(prefix: string) {
  const paymentIntents = sqliteTable(
    `${prefix}_payment_intents`,
    {
      id: sqliteText("id").primaryKey(),
      status: sqliteText("status").notNull(),
      gateway: sqliteText("gateway").notNull(),
      idempotencyKey: sqliteText("idempotency_key").notNull(),
      amountJson: sqliteText("amount_json").notNull(),
      gatewayIntentId: sqliteText("gateway_intent_id"),
      clientSecret: sqliteText("client_secret"),
      metadataJson: sqliteText("metadata_json"),
      ownerId: sqliteText("owner_id"),
      createdAt: sqliteText("created_at").notNull(),
      updatedAt: sqliteText("updated_at").notNull(),
    },
    (t) => [sqliteUniqueIndex(`${prefix}_intent_idem_uq`).on(t.gateway, t.idempotencyKey)],
  );

  const gatewayEvents = sqliteTable(`${prefix}_gateway_events`, {
    id: sqliteText("id").primaryKey(),
    gateway: sqliteText("gateway").notNull(),
    eventType: sqliteText("event_type").notNull(),
    gatewayEventId: sqliteText("gateway_event_id"),
    payloadJson: sqliteText("payload_json").notNull(),
    intentId: sqliteText("intent_id"),
    receivedAt: sqliteText("received_at").notNull(),
  });

  return { paymentIntents, gatewayEvents };
}
