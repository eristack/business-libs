import { InvalidPaymentInputError } from "../core/errors.js";
import type { PaymentIntent } from "../core/types.js";
import { toPaymentManagerErrorResponse } from "./errors.js";
import type {
  CreateIntentBody,
  PaymentIntentBody,
  RestPaymentManagerConfig,
  RestRequest,
  RestResponse,
} from "./types.js";

function readBodyObject(req: RestRequest): Record<string, unknown> {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return {};
  }
  return req.body as Record<string, unknown>;
}

function queryString(
  query: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = query[key];
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

function toIntentBody(intent: PaymentIntent): PaymentIntentBody {
  return {
    id: intent.id,
    status: intent.status,
    gateway: intent.gateway,
    idempotencyKey: intent.idempotencyKey,
    amount: intent.amount,
    gatewayIntentId: intent.gatewayIntentId,
    clientSecret: intent.clientSecret,
    metadata: intent.metadata,
    ownerId: intent.ownerId,
    createdAt: intent.createdAt,
    updatedAt: intent.updatedAt,
  };
}

function parseCreateIntentBody(body: Record<string, unknown>): CreateIntentBody {
  const gateway = body.gateway;
  const idempotencyKey = body.idempotencyKey;
  const amount = body.amount;
  if (typeof gateway !== "string" || !gateway.trim()) {
    throw new InvalidPaymentInputError("gateway is required");
  }
  if (typeof idempotencyKey !== "string" || !idempotencyKey.trim()) {
    throw new InvalidPaymentInputError("idempotencyKey is required");
  }
  if (!amount || typeof amount !== "object" || Array.isArray(amount)) {
    throw new InvalidPaymentInputError("amount is required");
  }
  const amountObj = amount as Record<string, unknown>;
  if (typeof amountObj.currency !== "string" || typeof amountObj.amount !== "string") {
    throw new InvalidPaymentInputError("amount must be { currency, amount } strings");
  }
  const metadata =
    body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata)
      ? (body.metadata as Record<string, string>)
      : undefined;
  return {
    gateway,
    idempotencyKey,
    amount: { currency: amountObj.currency, amount: amountObj.amount },
    ownerId: typeof body.ownerId === "string" ? body.ownerId : undefined,
    metadata,
  };
}

export function createRestPaymentManagerActions(config: RestPaymentManagerConfig) {
  return {
    async createIntent(req: RestRequest): Promise<RestResponse> {
      try {
        const input = parseCreateIntentBody(readBodyObject(req));
        const intent = await config.paymentManager.createIntent(input);
        return { status: 201, body: toIntentBody(intent) };
      } catch (err) {
        return toPaymentManagerErrorResponse(err);
      }
    },

    async getIntent(req: RestRequest): Promise<RestResponse> {
      try {
        const id = req.params.id;
        if (!id) throw new InvalidPaymentInputError("id is required");
        const intent = await config.paymentManager.getIntent(id);
        return { status: 200, body: toIntentBody(intent) };
      } catch (err) {
        return toPaymentManagerErrorResponse(err);
      }
    },

    async listIntents(req: RestRequest): Promise<RestResponse> {
      try {
        const ownerId = queryString(req.query, "ownerId");
        const status = queryString(req.query, "status");
        const items = await config.paymentManager.listIntents({
          ownerId,
          status: status as PaymentIntent["status"] | undefined,
        });
        return { status: 200, body: { items: items.map(toIntentBody) } };
      } catch (err) {
        return toPaymentManagerErrorResponse(err);
      }
    },

    async cancelIntent(req: RestRequest): Promise<RestResponse> {
      try {
        const id = req.params.id;
        if (!id) throw new InvalidPaymentInputError("id is required");
        const intent = await config.paymentManager.cancelIntent(id);
        return { status: 200, body: toIntentBody(intent) };
      } catch (err) {
        return toPaymentManagerErrorResponse(err);
      }
    },

    async handleWebhook(req: RestRequest): Promise<RestResponse> {
      try {
        const gateway = req.params.gateway;
        if (!gateway) throw new InvalidPaymentInputError("gateway is required");
        const rawBody =
          typeof req.body === "string"
            ? req.body
            : Buffer.isBuffer(req.body)
              ? req.body
              : req.body && typeof req.body === "object" && !Array.isArray(req.body)
                ? (req.body as Record<string, unknown>)
                : JSON.stringify(req.body ?? {});
        const result = await config.paymentManager.handleWebhook({
          gateway,
          rawBody,
          headers: req.headers,
        });
        return {
          status: 200,
          body: {
            received: true,
            intentId: result.intent?.id,
            eventId: result.event.id,
          },
        };
      } catch (err) {
        return toPaymentManagerErrorResponse(err);
      }
    },
  };
}
