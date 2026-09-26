import { describe, expect, it } from "vitest";
import { createBackseat, createMemoryBackseatStore } from "@eristack/backseat";
import { registerPaymentManagerBackseat } from "../src/backseat/index.js";

describe("payment-manager backseat", () => {
  it("registers REST routes on createBackseat", async () => {
    const backseatStore = createMemoryBackseatStore();
    const api = createBackseat({
      store: backseatStore,
      baseUrl: "/api",
    });
    registerPaymentManagerBackseat(api, { basePath: "/payments" });

    const created = await api.handle({
      method: "POST",
      path: "/api/payments/intents",
      body: {
        gateway: "memory",
        idempotencyKey: "bs-1",
        amount: { currency: "USD", amount: "12.00" },
      },
    });
    expect(created.status).toBe(201);
    const intent = created.body as { id: string; gatewayIntentId?: string };

    const webhook = await api.handle({
      method: "POST",
      path: "/api/payments/webhooks/memory",
      body: {
        gatewayIntentId: intent.gatewayIntentId,
        status: "succeeded",
      },
    });
    expect(webhook.status).toBe(200);

    const fetched = await api.handle({
      method: "GET",
      path: `/api/payments/intents/${intent.id}`,
    });
    expect(fetched.status).toBe(200);
    expect((fetched.body as { status: string }).status).toBe("succeeded");
  });
});
