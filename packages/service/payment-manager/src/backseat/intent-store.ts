import type { BackseatStore } from "@eristack/backseat";
import type {
  GatewayEvent,
  MoneyAmountJson,
  PaymentIntent,
  PaymentIntentStatus,
  PaymentManagerStore,
} from "../core/types.js";
import { PAYMENT_MANAGER_COLLECTIONS } from "./collections.js";

type IntentDoc = {
  id: string;
  status: PaymentIntentStatus;
  gateway: string;
  idempotencyKey: string;
  amountJson: string;
  gatewayIntentId?: string | null;
  clientSecret?: string | null;
  metadataJson?: string | null;
  ownerId?: string | null;
  createdAt: string;
  updatedAt: string;
};

type EventDoc = {
  id: string;
  gateway: string;
  eventType: string;
  gatewayEventId?: string | null;
  payloadJson: string;
  intentId?: string | null;
  receivedAt: string;
};

function intentFromDoc(doc: IntentDoc): PaymentIntent {
  return {
    id: doc.id,
    status: doc.status,
    gateway: doc.gateway,
    idempotencyKey: doc.idempotencyKey,
    amount: JSON.parse(doc.amountJson) as MoneyAmountJson,
    gatewayIntentId: doc.gatewayIntentId ?? undefined,
    clientSecret: doc.clientSecret ?? undefined,
    metadata: doc.metadataJson
      ? (JSON.parse(doc.metadataJson) as Record<string, string>)
      : undefined,
    ownerId: doc.ownerId ?? undefined,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function eventFromDoc(doc: EventDoc): GatewayEvent {
  return {
    id: doc.id,
    gateway: doc.gateway,
    eventType: doc.eventType,
    gatewayEventId: doc.gatewayEventId ?? undefined,
    payloadJson: doc.payloadJson,
    intentId: doc.intentId ?? undefined,
    receivedAt: doc.receivedAt,
  };
}

export function createBackseatPaymentManagerStore(
  store: BackseatStore,
): PaymentManagerStore {
  const intentsCol = PAYMENT_MANAGER_COLLECTIONS.paymentIntents;
  const eventsCol = PAYMENT_MANAGER_COLLECTIONS.gatewayEvents;

  return {
    async insertIntent(record) {
      const now = new Date().toISOString();
      const doc: IntentDoc = {
        id: record.id,
        status: record.status,
        gateway: record.gateway,
        idempotencyKey: record.idempotencyKey,
        amountJson: JSON.stringify(record.amount),
        gatewayIntentId: record.gatewayIntentId ?? null,
        clientSecret: record.clientSecret ?? null,
        metadataJson: record.metadata ? JSON.stringify(record.metadata) : null,
        ownerId: record.ownerId ?? null,
        createdAt: record.createdAt ?? now,
        updatedAt: record.updatedAt ?? now,
      };
      await store.create(intentsCol, doc);
      return intentFromDoc(doc);
    },
    async updateIntent(id, patch) {
      const current = await this.getIntentById(id);
      if (!current) throw new Error(`Payment intent not found: ${id}`);
      const updated: PaymentIntent = {
        ...current,
        ...patch,
        amount: patch.amount ?? current.amount,
        updatedAt: patch.updatedAt ?? new Date().toISOString(),
      };
      const doc: IntentDoc = {
        id: updated.id,
        status: updated.status,
        gateway: updated.gateway,
        idempotencyKey: updated.idempotencyKey,
        amountJson: JSON.stringify(updated.amount),
        gatewayIntentId: updated.gatewayIntentId ?? null,
        clientSecret: updated.clientSecret ?? null,
        metadataJson: updated.metadata ? JSON.stringify(updated.metadata) : null,
        ownerId: updated.ownerId ?? null,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
      await store.update(intentsCol, id, doc);
      return updated;
    },
    async getIntentById(id) {
      const doc = (await store.get(intentsCol, id)) as IntentDoc | null;
      if (!doc) return null;
      return intentFromDoc(doc);
    },
    async findIntentByGatewayIntentId(gateway, gatewayIntentId) {
      const docs = (await store.list(intentsCol, {
        where: { gateway, gatewayIntentId },
      })) as IntentDoc[];
      const doc = docs[0];
      if (!doc) return null;
      return intentFromDoc(doc);
    },
    async findIntentByIdempotencyKey(gateway, idempotencyKey) {
      const docs = (await store.list(intentsCol, {
        where: { gateway, idempotencyKey },
      })) as IntentDoc[];
      const doc = docs[0];
      if (!doc) return null;
      return intentFromDoc(doc);
    },
    async listIntents(input) {
      const docs = (await store.list(intentsCol, {
        where: input?.ownerId ? { ownerId: input.ownerId } : undefined,
      })) as IntentDoc[];
      let items = docs.map(intentFromDoc);
      if (input?.status) {
        items = items.filter((item) => item.status === input.status);
      }
      items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const offset = input?.offset ?? 0;
      const limit = input?.limit ?? items.length;
      return items.slice(offset, offset + limit);
    },
    async appendGatewayEvent(event) {
      const doc: EventDoc = {
        id: event.id,
        gateway: event.gateway,
        eventType: event.eventType,
        gatewayEventId: event.gatewayEventId ?? null,
        payloadJson: event.payloadJson,
        intentId: event.intentId ?? null,
        receivedAt: event.receivedAt ?? new Date().toISOString(),
      };
      await store.create(eventsCol, doc);
      return eventFromDoc(doc);
    },
    async listGatewayEvents(intentId) {
      const docs = (await store.list(eventsCol, {
        where: { intentId },
      })) as EventDoc[];
      return docs.map(eventFromDoc);
    },
  };
}
