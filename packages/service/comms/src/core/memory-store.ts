import type { CommsDeliveryEventRecord, CommsMessageRecord, CommsStore } from "./types.js";

export function createMemoryCommsStore(): CommsStore {
  const messages = new Map<string, CommsMessageRecord>();
  const idempotency = new Map<string, string>();
  const byProvider = new Map<string, string>();
  const events: CommsDeliveryEventRecord[] = [];

  const key = (vendor: string, idem: string) => `${vendor}:${idem}`;
  const providerKey = (vendor: string, pid: string) => `${vendor}:${pid}`;

  return {
    async findMessageByIdempotencyKey(vendor, idempotencyKey) {
      const id = idempotency.get(key(vendor, idempotencyKey));
      return id ? (messages.get(id) ?? null) : null;
    },
    async insertMessage(input) {
      const now = new Date().toISOString();
      const row: CommsMessageRecord = {
        id: input.id,
        channel: input.channel,
        vendor: input.vendor,
        idempotencyKey: input.idempotencyKey,
        status: input.status,
        to: input.to,
        subject: input.subject,
        providerMessageId: input.providerMessageId,
        metadataJson: input.metadataJson,
        createdAt: now,
        updatedAt: now,
      };
      messages.set(row.id, row);
      idempotency.set(key(input.vendor, input.idempotencyKey), row.id);
      if (row.providerMessageId) {
        byProvider.set(providerKey(input.vendor, row.providerMessageId), row.id);
      }
      return row;
    },
    async getMessageById(id) {
      return messages.get(id) ?? null;
    },
    async updateMessage(id, patch) {
      const row = messages.get(id);
      if (!row) throw new Error(`missing message ${id}`);
      const updated = {
        ...row,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      messages.set(id, updated);
      if (updated.providerMessageId) {
        byProvider.set(providerKey(updated.vendor, updated.providerMessageId), id);
      }
      return updated;
    },
    async appendDeliveryEvent(input) {
      const row: CommsDeliveryEventRecord = {
        id: input.id,
        vendor: input.vendor,
        eventType: input.eventType,
        providerEventId: input.providerEventId,
        messageId: input.messageId,
        payloadJson: input.payloadJson,
        receivedAt: new Date().toISOString(),
      };
      events.push(row);
      return row;
    },
    async findMessageByProviderId(vendor, providerMessageId) {
      const id = byProvider.get(providerKey(vendor, providerMessageId));
      return id ? (messages.get(id) ?? null) : null;
    },
  };
}
