import type { CommsDriver } from "./types.js";

/** Unit tests only — not for production. */
export function createMemoryCommsDriver(vendor = "memory"): CommsDriver {
  let seq = 0;
  return {
    vendor,
    channels: ["email", "sms", "whatsapp"],
    async send(_input) {
      seq += 1;
      return {
        providerMessageId: `${vendor}_msg_${seq}`,
        status: "sent",
      };
    },
    async parseWebhook({ rawBody }) {
      const body = typeof rawBody === "string" ? rawBody : rawBody.toString("utf8");
      return [
        {
          eventType: "memory.test",
          raw: body,
          status: "delivered",
        },
      ];
    },
  };
}
