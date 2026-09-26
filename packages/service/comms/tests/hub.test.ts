import { describe, expect, it } from "vitest";
import { createCommsHub } from "../src/core/create-comms-hub.js";
import { createMemoryCommsDriver } from "../src/core/memory-driver.js";
import { createMemoryCommsStore } from "../src/core/memory-store.js";
import { CommsIdempotencyConflictError } from "../src/core/errors.js";

describe("createCommsHub", () => {
  it("send + idempotency", async () => {
    const hub = createCommsHub({
      store: createMemoryCommsStore(),
      drivers: { memory: createMemoryCommsDriver() },
    });

    const first = await hub.send({
      channel: "email",
      vendor: "memory",
      idempotencyKey: "k1",
      to: "user@example.com",
      subject: "Hi",
      text: "Hello",
    });
    const second = await hub.send({
      channel: "email",
      vendor: "memory",
      idempotencyKey: "k1",
      to: "user@example.com",
      subject: "Hi",
      text: "Hello",
    });
    expect(second.id).toBe(first.id);
  });

  it("idempotency conflict on different body", async () => {
    const hub = createCommsHub({
      store: createMemoryCommsStore(),
      drivers: { memory: createMemoryCommsDriver() },
    });
    await hub.send({
      channel: "sms",
      vendor: "memory",
      idempotencyKey: "k2",
      to: "+15551234567",
      text: "A",
    });
    await expect(
      hub.send({
        channel: "sms",
        vendor: "memory",
        idempotencyKey: "k2",
        to: "+15551234567",
        text: "B",
      }),
    ).rejects.toBeInstanceOf(CommsIdempotencyConflictError);
  });
});
