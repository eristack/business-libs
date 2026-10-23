import { afterEach, describe, expect, it } from "vitest";
import { generateEntityId } from "@eristack/entity-id";
import { canUseBetterSqlite, createTestSqliteDb, execSql } from "@internal/test-harness";
import { createCommsTables, createDrizzleCommsStore } from "../src/drizzle/index.js";

const DDL = [
  `CREATE TABLE comms_messages (
    id TEXT PRIMARY KEY,
    channel TEXT NOT NULL,
    vendor TEXT NOT NULL,
    idempotency_key TEXT NOT NULL,
    status TEXT NOT NULL,
    "to" TEXT NOT NULL,
    subject TEXT,
    provider_message_id TEXT,
    metadata_json TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(vendor, idempotency_key)
  )`,
  `CREATE TABLE comms_delivery_events (
    id TEXT PRIMARY KEY,
    vendor TEXT NOT NULL,
    event_type TEXT NOT NULL,
    provider_event_id TEXT,
    message_id TEXT,
    payload_json TEXT NOT NULL,
    received_at TEXT NOT NULL,
    UNIQUE(vendor, provider_event_id)
  )`,
];

describe.skipIf(!canUseBetterSqlite())("comms drizzle integration", () => {
  let dbHandle: ReturnType<typeof createTestSqliteDb>;

  afterEach(() => {
    dbHandle?.close();
  });

  it("persists messages and delivery events via createDrizzleCommsStore", async () => {
    dbHandle = createTestSqliteDb();
    execSql(dbHandle.sqlite, DDL);

    const tables = createCommsTables("sqlite");
    const store = createDrizzleCommsStore({ db: dbHandle.db, tables });

    const messageId = generateEntityId();
    await store.insertMessage({
      id: messageId,
      channel: "email",
      vendor: "sendgrid",
      idempotencyKey: "welcome-user-1",
      status: "sent",
      to: "user@example.com",
      subject: "Welcome",
      providerMessageId: "sg-msg-1",
    });

    const byKey = await store.findMessageByIdempotencyKey("sendgrid", "welcome-user-1");
    expect(byKey?.id).toBe(messageId);
    expect(byKey?.status).toBe("sent");

    const eventId = generateEntityId();
    const event = await store.appendDeliveryEvent({
      id: eventId,
      vendor: "sendgrid",
      eventType: "delivered",
      providerEventId: "evt-1",
      messageId,
      payloadJson: "{}",
    });
    expect(event.id).toBe(eventId);

    const dup = await store.appendDeliveryEvent({
      id: generateEntityId(),
      vendor: "sendgrid",
      eventType: "delivered",
      providerEventId: "evt-1",
      messageId,
      payloadJson: "{}",
    });
    expect(dup.id).toBe(eventId);
  });
});
