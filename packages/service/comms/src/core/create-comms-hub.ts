import { randomUUID } from "node:crypto";
import {
  CommsChannelNotSupportedError,
  CommsIdempotencyConflictError,
  CommsMessageNotFoundError,
  CommsWebhookVerificationError,
  InvalidCommsInputError,
  UnknownCommsVendorError,
} from "./errors.js";
import type { CommsHub, CommsHubConfig, SendCommsInput } from "./types.js";

function driverFor(config: CommsHubConfig, vendor: string) {
  const driver = config.drivers[vendor];
  if (!driver) throw new UnknownCommsVendorError(vendor);
  return driver;
}

function normalizeWebhookRawBody(
  rawBody: string | Buffer | Record<string, unknown> | object,
): string | Buffer | Record<string, unknown> {
  if (typeof rawBody === "string" || Buffer.isBuffer(rawBody)) return rawBody;
  return rawBody as Record<string, unknown>;
}

function rawBodyToString(rawBody: string | Buffer | Record<string, unknown> | object): string {
  if (typeof rawBody === "string") return rawBody;
  if (Buffer.isBuffer(rawBody)) return rawBody.toString("utf8");
  return JSON.stringify(rawBody);
}

function payloadFingerprint(input: SendCommsInput) {
  return JSON.stringify({
    channel: input.channel,
    to: input.to,
    subject: input.subject ?? "",
    text: input.text ?? "",
    html: input.html ?? "",
    from: input.from ?? "",
  });
}

export function createCommsHub(config: CommsHubConfig): CommsHub {
  return {
    async send(input) {
      if (!input.idempotencyKey.trim()) {
        throw new InvalidCommsInputError("idempotencyKey is required");
      }
      if (!input.to.trim()) throw new InvalidCommsInputError("to is required");
      const vendor = input.vendor.trim();
      if (!vendor) throw new InvalidCommsInputError("vendor is required");

      const existing = await config.store.findMessageByIdempotencyKey(
        vendor,
        input.idempotencyKey,
      );
      if (existing) {
        const meta = existing.metadataJson ? JSON.parse(existing.metadataJson) : {};
        if (meta._fingerprint && meta._fingerprint !== payloadFingerprint(input)) {
          throw new CommsIdempotencyConflictError(input.idempotencyKey);
        }
        return existing;
      }

      const driver = driverFor(config, vendor);
      if (!driver.channels.includes(input.channel)) {
        throw new CommsChannelNotSupportedError(vendor, input.channel);
      }

      const sent = await driver.send({
        channel: input.channel,
        idempotencyKey: input.idempotencyKey,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
        from: input.from,
        metadata: input.metadata,
      });

      const id = randomUUID();
      const metadata = {
        ...(input.metadata ?? {}),
        _fingerprint: payloadFingerprint(input),
      };

      return config.store.insertMessage({
        id,
        channel: input.channel,
        vendor,
        idempotencyKey: input.idempotencyKey,
        status: sent.status,
        to: input.to,
        subject: input.subject,
        providerMessageId: sent.providerMessageId,
        metadataJson: JSON.stringify(metadata),
      });
    },

    async getMessage(id) {
      const row = await config.store.getMessageById(id);
      if (!row) throw new CommsMessageNotFoundError(id);
      return row;
    },

    async handleWebhook(input) {
      const vendor = input.vendor.trim();
      if (!vendor) throw new InvalidCommsInputError("vendor is required");

      const driver = driverFor(config, vendor);
      const rawBody = normalizeWebhookRawBody(input.rawBody);
      if (driver.verifyWebhook) {
        const ok = await driver.verifyWebhook({ rawBody, headers: input.headers });
        if (!ok) throw new CommsWebhookVerificationError(vendor);
      }

      const parsed =
        (await driver.parseWebhook?.({ rawBody, headers: input.headers })) ?? [];

      const stored: Awaited<ReturnType<CommsHub["handleWebhook"]>>["events"] = [];
      const payloadJson = rawBodyToString(rawBody);

      for (const evt of parsed) {
        let messageId: string | undefined;
        if (evt.providerMessageId) {
          const msg = await config.store.findMessageByProviderId(
            vendor,
            evt.providerMessageId,
          );
          messageId = msg?.id;
          if (msg && evt.status) {
            await config.store.updateMessage(msg.id, { status: evt.status });
          }
        }

        stored.push(
          await config.store.appendDeliveryEvent({
            id: randomUUID(),
            vendor,
            eventType: evt.eventType,
            providerEventId: evt.providerEventId,
            messageId,
            payloadJson,
          }),
        );
      }

      if (parsed.length === 0) {
        stored.push(
          await config.store.appendDeliveryEvent({
            id: randomUUID(),
            vendor,
            eventType: "webhook.received",
            payloadJson,
          }),
        );
      }

      return { events: stored };
    },
  };
}
