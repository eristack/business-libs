import type { GatewayEvent, PaymentIntent, PaymentManagerStore, PaymentIntentStatus } from "./types.js";

/** Unit tests only — production uses Drizzle. */
export function createMemoryPaymentManagerStore(): PaymentManagerStore {
  const intents = new Map<string, PaymentIntent>();
  const idempotencyIndex = new Map<string, string>();
  const events: GatewayEvent[] = [];

  function idempotencyIndexKey(gateway: string, key: string) {
    return `${gateway}::${key}`;
  }

  return {
    async insertIntent(record) {
      const now = new Date().toISOString();
      const stored: PaymentIntent = {
        ...record,
        createdAt: record.createdAt ?? now,
        updatedAt: record.updatedAt ?? now,
      };
      intents.set(stored.id, stored);
      idempotencyIndex.set(
        idempotencyIndexKey(stored.gateway, stored.idempotencyKey),
        stored.id,
      );
      return stored;
    },
    async updateIntent(id, patch) {
      const current = intents.get(id);
      if (!current) throw new Error(`Payment intent not found: ${id}`);
      const updated: PaymentIntent = {
        ...current,
        ...patch,
        amount: patch.amount ?? current.amount,
        updatedAt: patch.updatedAt ?? new Date().toISOString(),
      };
      intents.set(id, updated);
      return updated;
    },
    async getIntentById(id) {
      return intents.get(id) ?? null;
    },
    async findIntentByGatewayIntentId(gateway, gatewayIntentId) {
      for (const intent of intents.values()) {
        if (intent.gateway === gateway && intent.gatewayIntentId === gatewayIntentId) {
          return intent;
        }
      }
      return null;
    },
    async findIntentByIdempotencyKey(gateway, idempotencyKey) {
      const id = idempotencyIndex.get(idempotencyIndexKey(gateway, idempotencyKey));
      if (!id) return null;
      return intents.get(id) ?? null;
    },
    async listIntents(input) {
      let items = [...intents.values()];
      if (input?.ownerId) {
        items = items.filter((item) => item.ownerId === input.ownerId);
      }
      if (input?.status) {
        items = items.filter((item) => item.status === input.status);
      }
      items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const offset = input?.offset ?? 0;
      const limit = input?.limit ?? items.length;
      return items.slice(offset, offset + limit);
    },
    async appendGatewayEvent(event) {
      const stored: GatewayEvent = {
        ...event,
        receivedAt: event.receivedAt ?? new Date().toISOString(),
      };
      events.push(stored);
      return stored;
    },
    async listGatewayEvents(intentId) {
      return events.filter((e) => e.intentId === intentId);
    },
  };
}

export type { PaymentIntentStatus };
