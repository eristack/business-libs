import { describe, expect, it } from "vitest";
import { createCommsHub, createMemoryCommsStore } from "../src/index.js";
import type { CommsDriver } from "../src/core/types.js";

describe("comms idempotency race", () => {
  it("calls vendor send once for parallel duplicate keys", async () => {
    let sends = 0;
    const driver: CommsDriver = {
      vendor: "mock",
      channels: ["email"],
      async send() {
        sends += 1;
        return { providerMessageId: "msg-1", status: "sent" };
      },
    };
    const hub = createCommsHub({
      drivers: { mock: driver },
      store: createMemoryCommsStore(),
    });
    const input = {
      channel: "email" as const,
      vendor: "mock",
      idempotencyKey: "idem-1",
      to: "a@example.com",
      subject: "Hi",
      text: "Hello",
    };
    const [a, b] = await Promise.all([hub.send(input), hub.send(input)]);
    expect(a.id).toBe(b.id);
    expect(sends).toBe(1);
  });
});
