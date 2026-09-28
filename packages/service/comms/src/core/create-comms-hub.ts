import { generateEntityId } from "@eristack/entity-id";
import {
  CommsChannelNotSupportedError,
  CommsIdempotencyConflictError,
  CommsMessageNotFoundError,
  CommsWebhookVerificationError,
  InvalidCommsInputError,
  UnknownCommsVendorError,
} from "./errors.js";
import { isCommsUniqueViolation } from "./duplicate-key.js";
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

function assertFingerprint(existingMetadataJson: string | undefined, input: SendCommsInput) {
  const meta = existingMetadataJson ? JSON.parse(existingMetadataJson) : {};
  if (meta._fingerprint && meta._fingerprint !== payloadFingerprint(input)) {
    throw new CommsIdempotencyConflictError(input.idempotencyKey);
  }
}

async function waitForProviderMessage(
  config: CommsHubConfig,
  messageId: string,
  idempotencyKey: string,
) {
  for (let i = 0; i < 100; i += 1) {
    const row = await config.store.getMessageById(messageId);
    if (row?.providerMessageId) return row;
    await new Promise((r) => setTimeout(r, 5));
  }
  throw new CommsIdempotencyConflictError(idempotencyKey);
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
        assertFingerprint(existing.metadataJson, input);
        if (existing.providerMessageId) return existing;
        if (existing.status === "queued") {
          return waitForProviderMessage(config, existing.id, input.idempotencyKey);
        }
      }

      const driver = driverFor(config, vendor);
      if (!driver.channels.includes(input.channel)) {
        throw new CommsChannelNotSupportedError(vendor, input.channel);
      }

      const id = generateEntityId();
      const metadata = {
        ...(input.metadata ?? {}),
        _fingerprint: payloadFingerprint(input),
      };

      let row = existing;
      if (!row) {
        try {
          row = await config.store.insertMessage({
            id,
            channel: input.channel,
            vendor,
            idempotencyKey: input.idempotencyKey,
            status: "queued",
            to: input.to,
            subject: input.subject,
            metadataJson: JSON.stringify(metadata),
          });
        } catch (err) {
          if (!isCommsUniqueViolation(err)) throw err;
          const raced = await config.store.findMessageByIdempotencyKey(
            vendor,
            input.idempotencyKey,
          );
          if (!raced) throw err;
          assertFingerprint(raced.metadataJson, input);
          row = raced;
          if (row.providerMessageId) return row;
          if (row.status === "queued") {
            return waitForProviderMessage(config, row.id, input.idempotencyKey);
          }
        }
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

      return config.store.updateMessage(row.id, {
        status: sent.status,
        providerMessageId: sent.providerMessageId,
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
        if (evt.providerEventId) {
          const dup = await config.store.findDeliveryEventByProviderEventId(
            vendor,
            evt.providerEventId,
          );
          if (dup) {
            stored.push(dup);
            continue;
          }
        }

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
            id: generateEntityId(),
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
            id: generateEntityId(),
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
