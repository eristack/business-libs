import { OutboxDuplicateKeyError } from "./errors.js";
import type { OutboxMessage, OutboxStore } from "./types.js";

export function createMemoryOutboxStore(): OutboxStore {
  const messages = new Map<string, OutboxMessage>();
  const byKey = new Map<string, string>();

  return {
    async enqueue(input) {
      if (byKey.has(input.idempotencyKey)) {
        const id = byKey.get(input.idempotencyKey)!;
        const existing = messages.get(id);
        if (existing) return existing;
        throw new OutboxDuplicateKeyError(input.idempotencyKey);
      }
      const now = new Date().toISOString();
      const row: OutboxMessage = {
        id: input.id,
        aggregateType: input.aggregateType,
        aggregateId: input.aggregateId,
        messageType: input.messageType,
        payloadJson: input.payloadJson,
        idempotencyKey: input.idempotencyKey,
        status: "pending",
        attempts: 0,
        createdAt: now,
        updatedAt: now,
      };
      messages.set(row.id, row);
      byKey.set(row.idempotencyKey, row.id);
      return row;
    },
    async findByIdempotencyKey(idempotencyKey) {
      const id = byKey.get(idempotencyKey);
      return id ? (messages.get(id) ?? null) : null;
    },
    async claimBatch(limit) {
      const pending = [...messages.values()]
        .filter((m) => m.status === "pending")
        .slice(0, limit);
      const now = new Date().toISOString();
      for (const msg of pending) {
        messages.set(msg.id, {
          ...msg,
          status: "processing",
          attempts: msg.attempts + 1,
          updatedAt: now,
        });
      }
      return pending.map((m) => messages.get(m.id)!);
    },
    async markProcessed(id) {
      const row = messages.get(id);
      if (!row) return;
      messages.set(id, {
        ...row,
        status: "processed",
        updatedAt: new Date().toISOString(),
      });
    },
    async markFailed(id, errorMessage) {
      const row = messages.get(id);
      if (!row) return;
      messages.set(id, {
        ...row,
        status: "failed",
        lastError: errorMessage,
        updatedAt: new Date().toISOString(),
      });
    },
  };
}
