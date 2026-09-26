import { describe, expect, it } from "vitest";
import { createPaymentManager } from "../src/core/create-payment-manager.js";
import { createMemoryPaymentDriver } from "../src/core/memory-driver.js";
import { createMemoryPaymentManagerStore } from "../src/core/memory-store.js";

function manager() {
  return createPaymentManager({
    store: createMemoryPaymentManagerStore(),
    drivers: { memory: createMemoryPaymentDriver("memory") },
  });
}

describe("createPaymentManager", () => {
  it("creates intent with idempotency replay", async () => {
    const pm = manager();
    const first = await pm.createIntent({
      gateway: "memory",
      amount: { currency: "USD", amount: "19.99" },
      idempotencyKey: "order-1",
    });
    const second = await pm.createIntent({
      gateway: "memory",
      amount: { currency: "USD", amount: "19.99" },
      idempotencyKey: "order-1",
    });
    expect(second.id).toBe(first.id);
  });

  it("webhook updates intent status", async () => {
    const pm = manager();
    const intent = await pm.createIntent({
      gateway: "memory",
      amount: { currency: "USD", amount: "10.00" },
      idempotencyKey: "wh-1",
    });
    expect(intent.gatewayIntentId).toBeDefined();

    const result = await pm.handleWebhook({
      gateway: "memory",
      rawBody: JSON.stringify({
        type: "payment.succeeded",
        id: "evt_1",
        gatewayIntentId: intent.gatewayIntentId,
        status: "succeeded",
      }),
      headers: { get: () => null },
    });

    expect(result.intent?.status).toBe("succeeded");
    const events = await pm.listGatewayEvents(intent.id);
    expect(events.length).toBeGreaterThan(0);
  });

  it("cancel intent", async () => {
    const pm = manager();
    const intent = await pm.createIntent({
      gateway: "memory",
      amount: { currency: "USD", amount: "5.00" },
      idempotencyKey: "cancel-1",
    });
    const canceled = await pm.cancelIntent(intent.id);
    expect(canceled.status).toBe("canceled");
  });
});
