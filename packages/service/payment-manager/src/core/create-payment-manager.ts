import { randomUUID } from "node:crypto";
import {
  IdempotencyConflictError,
  InvalidPaymentInputError,
  PaymentIntentNotCancelableError,
  PaymentIntentNotFoundError,
  UnknownGatewayError,
  WebhookVerificationError,
} from "./errors.js";
import { moneyJsonEqual, toMoneyAmountJson } from "./money-json.js";
import type {
  CreateIntentInput,
  PaymentManager,
  PaymentManagerConfig,
  PaymentIntentStatus,
} from "./types.js";

const CANCELABLE: PaymentIntentStatus[] = [
  "pending",
  "requires_action",
  "processing",
];

function assertIdempotencyKey(key: string) {
  if (!key.trim()) {
    throw new InvalidPaymentInputError("idempotencyKey is required");
  }
}

function driverFor(config: PaymentManagerConfig, gateway: string) {
  const driver = config.drivers[gateway];
  if (!driver) throw new UnknownGatewayError(gateway);
  return driver;
}

function rawBodyToString(rawBody: string | Buffer | Record<string, unknown>): string {
  if (typeof rawBody === "string") return rawBody;
  if (Buffer.isBuffer(rawBody)) return rawBody.toString("utf8");
  if (rawBody && typeof rawBody === "object") return JSON.stringify(rawBody);
  return String(rawBody);
}

export function createPaymentManager(config: PaymentManagerConfig): PaymentManager {
  return {
    async createIntent(input: CreateIntentInput) {
      assertIdempotencyKey(input.idempotencyKey);
      const gateway = input.gateway?.trim();
      if (!gateway) throw new InvalidPaymentInputError("gateway is required");

      const amount = toMoneyAmountJson(input.amount);
      const existing = await config.store.findIntentByIdempotencyKey(
        gateway,
        input.idempotencyKey,
      );
      if (existing) {
        if (existing.gateway !== gateway || !moneyJsonEqual(existing.amount, amount)) {
          throw new IdempotencyConflictError(input.idempotencyKey);
        }
        return existing;
      }

      const driver = driverFor(config, gateway);
      const created = await driver.createIntent({
        amount,
        idempotencyKey: input.idempotencyKey,
        metadata: input.metadata,
      });

      const id = randomUUID();
      return config.store.insertIntent({
        id,
        status: created.status,
        gateway,
        idempotencyKey: input.idempotencyKey,
        amount,
        gatewayIntentId: created.gatewayIntentId,
        clientSecret: created.clientSecret,
        metadata: input.metadata,
        ownerId: input.ownerId,
      });
    },

    async getIntent(id) {
      const intent = await config.store.getIntentById(id);
      if (!intent) throw new PaymentIntentNotFoundError(id);
      return intent;
    },

    async listIntents(input) {
      return config.store.listIntents(input);
    },

    async cancelIntent(id) {
      const intent = await this.getIntent(id);
      if (!CANCELABLE.includes(intent.status)) {
        throw new PaymentIntentNotCancelableError(id, intent.status);
      }
      const driver = driverFor(config, intent.gateway);
      if (intent.gatewayIntentId && driver.cancelIntent) {
        await driver.cancelIntent({ gatewayIntentId: intent.gatewayIntentId });
      }
      return config.store.updateIntent(id, { status: "canceled" });
    },

    async handleWebhook(input) {
      const gateway = input.gateway?.trim();
      if (!gateway) throw new InvalidPaymentInputError("gateway is required");

      const driver = driverFor(config, gateway);
      const verified = await driver.verifyWebhook({
        rawBody: input.rawBody,
        headers: input.headers,
      });
      if (!verified) throw new WebhookVerificationError(gateway);

      const parsed = await driver.parseWebhook({
        rawBody: input.rawBody,
        headers: input.headers,
      });
      const payloadJson = rawBodyToString(input.rawBody);

      let intent =
        parsed.gatewayIntentId != null
          ? await config.store.findIntentByGatewayIntentId(
              gateway,
              parsed.gatewayIntentId,
            )
          : null;

      let updated = intent ?? undefined;
      if (intent && parsed.status) {
        updated = await config.store.updateIntent(intent.id, { status: parsed.status });
      }

      const event = await config.store.appendGatewayEvent({
        id: randomUUID(),
        gateway,
        eventType: parsed.eventType,
        gatewayEventId: parsed.gatewayEventId,
        payloadJson,
        intentId: intent?.id,
      });

      return { intent: updated, event };
    },

    async listGatewayEvents(intentId) {
      return config.store.listGatewayEvents(intentId);
    },
  };
}
