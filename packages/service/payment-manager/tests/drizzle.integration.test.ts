import { afterEach, describe, expect, it } from "vitest";
import { canUseBetterSqlite, createTestSqliteDb, execSql } from "@internal/test-harness";
import { createPaymentManager } from "../src/index.js";
import {
  createDrizzlePaymentManagerStore,
  createPaymentManagerTables,
} from "../src/drizzle/index.js";
import { createMemoryPaymentDriver } from "../src/core/memory-driver.js";

const DDL = [
  `CREATE TABLE payment_manager_payment_intents (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    gateway TEXT NOT NULL,
    idempotency_key TEXT NOT NULL,
    amount_json TEXT NOT NULL,
    gateway_intent_id TEXT,
    client_secret TEXT,
    metadata_json TEXT,
    owner_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE UNIQUE INDEX payment_manager_intent_idem_uq ON payment_manager_payment_intents (gateway, idempotency_key)`,
  `CREATE TABLE payment_manager_gateway_events (
    id TEXT PRIMARY KEY,
    gateway TEXT NOT NULL,
    event_type TEXT NOT NULL,
    gateway_event_id TEXT,
    payload_json TEXT NOT NULL,
    intent_id TEXT,
    received_at TEXT NOT NULL
  )`,
];

describe.skipIf(!canUseBetterSqlite())("payment-manager drizzle integration", () => {
  let dbHandle: ReturnType<typeof createTestSqliteDb>;

  afterEach(() => {
    dbHandle?.close();
  });

  it("persists intent and webhook event", async () => {
    dbHandle = createTestSqliteDb();
    for (const sql of DDL) execSql(dbHandle.sqlite, sql);

    const tables = createPaymentManagerTables("sqlite");
    const paymentManager = createPaymentManager({
      store: createDrizzlePaymentManagerStore({ db: dbHandle.db, tables }),
      drivers: { memory: createMemoryPaymentDriver("memory") },
    });

    const intent = await paymentManager.createIntent({
      gateway: "memory",
      amount: { currency: "USD", amount: "88.50" },
      idempotencyKey: "drizzle-int-1",
      ownerId: "cust-1",
    });
    expect(intent.gatewayIntentId).toBeDefined();

    const replay = await paymentManager.createIntent({
      gateway: "memory",
      amount: { currency: "USD", amount: "88.50" },
      idempotencyKey: "drizzle-int-1",
    });
    expect(replay.id).toBe(intent.id);

    await paymentManager.handleWebhook({
      gateway: "memory",
      rawBody: JSON.stringify({
        gatewayIntentId: intent.gatewayIntentId,
        status: "succeeded",
      }),
      headers: { get: () => null },
    });

    const loaded = await paymentManager.getIntent(intent.id);
    expect(loaded.status).toBe("succeeded");

    const events = await paymentManager.listGatewayEvents(intent.id);
    expect(events.length).toBe(1);
    expect(events[0]?.intentId).toBe(intent.id);

    const listed = await paymentManager.listIntents({ ownerId: "cust-1" });
    expect(listed).toHaveLength(1);
  });
});
