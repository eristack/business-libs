import { randomUUID } from "node:crypto";
import type { PaymentDriver, PaymentIntentStatus } from "./types.js";

/** Unit tests and Backseat prototypes — not production PSP traffic. */
export function createMemoryPaymentDriver(gateway = "memory"): PaymentDriver {
  return {
    gateway,
    async createIntent(input) {
      const gatewayIntentId = `mem_${randomUUID()}`;
      const simulate = input.metadata?.simulate;
      let status: PaymentIntentStatus = "processing";
      if (simulate === "requires_action") status = "requires_action";
      if (simulate === "succeeded") status = "succeeded";
      if (simulate === "failed") status = "failed";
      return {
        gatewayIntentId,
        status,
        clientSecret:
          status === "requires_action" ? `mem_secret_${gatewayIntentId}` : undefined,
      };
    },
    async cancelIntent() {
      return { status: "canceled" };
    },
    verifyWebhook() {
      return true;
    },
    parseWebhook({ rawBody }) {
      let body: Record<string, unknown>;
      if (typeof rawBody === "string") {
        body = JSON.parse(rawBody) as Record<string, unknown>;
      } else if (Buffer.isBuffer(rawBody)) {
        body = JSON.parse(rawBody.toString("utf8")) as Record<string, unknown>;
      } else if (rawBody && typeof rawBody === "object") {
        body = rawBody as Record<string, unknown>;
      } else {
        body = JSON.parse(String(rawBody)) as Record<string, unknown>;
      }
      return {
        eventType: typeof body.type === "string" ? body.type : "memory.event",
        gatewayEventId: typeof body.id === "string" ? body.id : undefined,
        gatewayIntentId:
          typeof body.gatewayIntentId === "string" ? body.gatewayIntentId : undefined,
        status:
          typeof body.status === "string"
            ? (body.status as PaymentIntentStatus)
            : undefined,
      };
    },
  };
}
