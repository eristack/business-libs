import { afterEach, describe, expect, it } from "vitest";
import { generateEntityId } from "@eristack/entity-id";
import { canUseBetterSqlite, createTestSqliteDb, execSql } from "@internal/test-harness";
import { createOutbox } from "../src/index.js";
import { createDrizzleOutboxStore, createOutboxTables } from "../src/drizzle/index.js";

const DDL = [
  `CREATE TABLE outbox_messages (
    id TEXT PRIMARY KEY,
    aggregate_type TEXT NOT NULL,
    aggregate_id TEXT NOT NULL,
    message_type TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    idempotency_key TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    last_error TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
];

describe.skipIf(!canUseBetterSqlite())("outbox drizzle integration", () => {
  let dbHandle: ReturnType<typeof createTestSqliteDb>;

  afterEach(() => {
    dbHandle?.close();
  });

  it("dedupes enqueue by idempotencyKey on createDrizzleOutboxStore", async () => {
    dbHandle = createTestSqliteDb();
    execSql(dbHandle.sqlite, DDL);

    const tables = createOutboxTables("sqlite");
    const store = createDrizzleOutboxStore({ db: dbHandle.db, tables });
    const outbox = createOutbox(store);

    const input = {
      id: generateEntityId(),
      aggregateType: "purchase_order",
      aggregateId: "po-1",
      messageType: "comms.send",
      payloadJson: "{}",
      idempotencyKey: "po-1-email",
    };

    const first = await outbox.enqueue(input);
    const second = await outbox.enqueue({ ...input, id: generateEntityId() });
    expect(second.id).toBe(first.id);
  });
});
