import type { PaymentDriver, PaymentIntentStatus } from "../core/types.js";

type XenditCreateResponse = {
  id: string;
  status: string;
  actions?: Array<{ url?: string }>;
};

const XENDIT_STATUS_MAP: Record<string, PaymentIntentStatus> = {
  PENDING: "pending",
  REQUIRES_ACTION: "requires_action",
  AUTHORIZED: "processing",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
  CANCELED: "canceled",
  EXPIRED: "failed",
};

function mapXenditStatus(status: string): PaymentIntentStatus {
  return XENDIT_STATUS_MAP[status] ?? "processing";
}

/**
 * Xendit payment requests — app supplies `createPaymentRequest` (REST/fetch wrapper).
 * Webhooks: compare `x-callback-token` header to your Xendit callback token.
 */
export function createXenditPaymentDriver(options: {
  createPaymentRequest(input: {
    amount: { currency: string; amount: string };
    referenceId: string;
    metadata?: Record<string, string>;
  }): Promise<XenditCreateResponse>;
  cancelPaymentRequest?(id: string): Promise<XenditCreateResponse>;
  callbackToken: string;
}): PaymentDriver {
  return {
    gateway: "xendit",
    async createIntent(input) {
      const created = await options.createPaymentRequest({
        amount: input.amount,
        referenceId: input.idempotencyKey,
        metadata: input.metadata,
      });
      return {
        gatewayIntentId: created.id,
        status: mapXenditStatus(created.status),
        clientSecret: created.actions?.[0]?.url,
      };
    },
    async cancelIntent(input) {
      if (!options.cancelPaymentRequest) {
        return { status: "canceled" };
      }
      const updated = await options.cancelPaymentRequest(input.gatewayIntentId);
      return { status: mapXenditStatus(updated.status) };
    },
    verifyWebhook({ headers }) {
      const token = headers.get("x-callback-token");
      return token === options.callbackToken;
    },
    async parseWebhook({ rawBody }) {
      const text =
        typeof rawBody === "string"
          ? rawBody
          : Buffer.isBuffer(rawBody)
            ? rawBody.toString("utf8")
            : String(rawBody);
      const body = JSON.parse(text) as Record<string, unknown>;
      const data =
        body.data && typeof body.data === "object" && !Array.isArray(body.data)
          ? (body.data as Record<string, unknown>)
          : body;
      const gatewayIntentId =
        typeof data.id === "string"
          ? data.id
          : typeof body.id === "string"
            ? body.id
            : undefined;
      const statusRaw =
        typeof data.status === "string"
          ? data.status
          : typeof body.status === "string"
            ? body.status
            : undefined;
      return {
        eventType: typeof body.event === "string" ? body.event : "xendit.webhook",
        gatewayEventId: typeof body.id === "string" ? body.id : undefined,
        gatewayIntentId,
        status: statusRaw ? mapXenditStatus(statusRaw) : undefined,
      };
    },
  };
}
