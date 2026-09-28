import { describe, expect, it } from "vitest";
import { generateEntityId } from "@eristack/entity-id";
import { createOutbox, createMemoryOutboxStore } from "../src/index.js";

describe("@eristack/outbox", () => {
  it("dedupes enqueue by idempotencyKey", async () => {
    const store = createMemoryOutboxStore();
    const outbox = createOutbox(store);
    const input = {
      id: generateEntityId(),
      aggregateType: "purchase_order",
      aggregateId: "po-1",
      messageType: "comms.send",
      payloadJson: "{}",
      idempotencyKey: "po-1-email",
    };
    const a = await outbox.enqueue(input);
    const b = await outbox.enqueue({ ...input, id: generateEntityId() });
    expect(b.id).toBe(a.id);
  });

  it("processes batch with handlers", async () => {
    const store = createMemoryOutboxStore();
    const outbox = createOutbox(store);
    await outbox.enqueue({
      id: generateEntityId(),
      aggregateType: "po",
      aggregateId: "1",
      messageType: "ping",
      payloadJson: "{}",
      idempotencyKey: "k1",
    });
    const seen: string[] = [];
    const n = await outbox.processBatch(10, {
      ping: async () => {
        seen.push("ok");
      },
    });
    expect(n).toBe(1);
    expect(seen).toEqual(["ok"]);
  });
});
