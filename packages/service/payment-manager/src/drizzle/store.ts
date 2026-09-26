import { and, desc, eq } from "drizzle-orm";
import type {
  GatewayEvent,
  MoneyAmountJson,
  PaymentIntent,
  PaymentIntentStatus,
  PaymentManagerStore,
} from "../core/types.js";
import type { PaymentManagerTables } from "./tables.js";

type Db = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  select: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insert: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: (...args: any[]) => any;
};

function parseAmountJson(json: string): MoneyAmountJson {
  const parsed = JSON.parse(json) as MoneyAmountJson;
  return { currency: String(parsed.currency), amount: String(parsed.amount) };
}

function parseMetadata(json: string | null | undefined): Record<string, string> | undefined {
  if (!json) return undefined;
  const parsed = JSON.parse(json) as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value === "string") out[key] = value;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function intentRowToRecord(row: Record<string, unknown>): PaymentIntent {
  return {
    id: String(row.id),
    status: row.status as PaymentIntentStatus,
    gateway: String(row.gateway),
    idempotencyKey: String(row.idempotencyKey),
    amount: parseAmountJson(String(row.amountJson)),
    gatewayIntentId: row.gatewayIntentId ? String(row.gatewayIntentId) : undefined,
    clientSecret: row.clientSecret ? String(row.clientSecret) : undefined,
    metadata: parseMetadata(row.metadataJson ? String(row.metadataJson) : undefined),
    ownerId: row.ownerId ? String(row.ownerId) : undefined,
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

function eventRowToRecord(row: Record<string, unknown>): GatewayEvent {
  return {
    id: String(row.id),
    gateway: String(row.gateway),
    eventType: String(row.eventType),
    gatewayEventId: row.gatewayEventId ? String(row.gatewayEventId) : undefined,
    payloadJson: String(row.payloadJson),
    intentId: row.intentId ? String(row.intentId) : undefined,
    receivedAt: String(row.receivedAt),
  };
}

export function createDrizzlePaymentManagerStore(options: {
  db: Db;
  tables: PaymentManagerTables;
}): PaymentManagerStore {
  const { db, tables: t } = options;
  const now = () => new Date().toISOString();

  return {
    async insertIntent(record) {
      const createdAt = record.createdAt ?? now();
      const updatedAt = record.updatedAt ?? createdAt;
      const row = {
        id: record.id,
        status: record.status,
        gateway: record.gateway,
        idempotencyKey: record.idempotencyKey,
        amountJson: JSON.stringify(record.amount),
        gatewayIntentId: record.gatewayIntentId ?? null,
        clientSecret: record.clientSecret ?? null,
        metadataJson: record.metadata ? JSON.stringify(record.metadata) : null,
        ownerId: record.ownerId ?? null,
        createdAt,
        updatedAt,
      };
      await db.insert(t.paymentIntents).values(row);
      return intentRowToRecord(row);
    },
    async updateIntent(id, patch) {
      const current = await this.getIntentById(id);
      if (!current) throw new Error(`Payment intent not found: ${id}`);
      const updated: PaymentIntent = {
        ...current,
        ...patch,
        amount: patch.amount ?? current.amount,
        updatedAt: patch.updatedAt ?? now(),
      };
      await db
        .update(t.paymentIntents)
        .set({
          status: updated.status,
          amountJson: JSON.stringify(updated.amount),
          gatewayIntentId: updated.gatewayIntentId ?? null,
          clientSecret: updated.clientSecret ?? null,
          metadataJson: updated.metadata ? JSON.stringify(updated.metadata) : null,
          ownerId: updated.ownerId ?? null,
          updatedAt: updated.updatedAt,
        })
        .where(eq(t.paymentIntents.id, id));
      return updated;
    },
    async getIntentById(id) {
      const rows = await db
        .select()
        .from(t.paymentIntents)
        .where(eq(t.paymentIntents.id, id))
        .limit(1);
      const row = rows[0] as Record<string, unknown> | undefined;
      if (!row) return null;
      return intentRowToRecord(row);
    },
    async findIntentByGatewayIntentId(gateway, gatewayIntentId) {
      const rows = await db
        .select()
        .from(t.paymentIntents)
        .where(
          and(
            eq(t.paymentIntents.gateway, gateway),
            eq(t.paymentIntents.gatewayIntentId, gatewayIntentId),
          ),
        )
        .limit(1);
      const row = rows[0] as Record<string, unknown> | undefined;
      if (!row) return null;
      return intentRowToRecord(row);
    },
    async findIntentByIdempotencyKey(gateway, idempotencyKey) {
      const rows = await db
        .select()
        .from(t.paymentIntents)
        .where(
          and(
            eq(t.paymentIntents.gateway, gateway),
            eq(t.paymentIntents.idempotencyKey, idempotencyKey),
          ),
        )
        .limit(1);
      const row = rows[0] as Record<string, unknown> | undefined;
      if (!row) return null;
      return intentRowToRecord(row);
    },
    async listIntents(input) {
      const conditions = [];
      if (input?.ownerId) conditions.push(eq(t.paymentIntents.ownerId, input.ownerId));
      if (input?.status) conditions.push(eq(t.paymentIntents.status, input.status));
      const whereClause =
        conditions.length === 0
          ? undefined
          : conditions.length === 1
            ? conditions[0]
            : and(...conditions);

      let query = db.select().from(t.paymentIntents);
      if (whereClause) query = query.where(whereClause);
      const rows = (await query
        .orderBy(desc(t.paymentIntents.createdAt))
        .limit(input?.limit ?? 100)
        .offset(input?.offset ?? 0)) as Record<string, unknown>[];
      return rows.map((row) => intentRowToRecord(row));
    },
    async appendGatewayEvent(event) {
      const receivedAt = event.receivedAt ?? now();
      const row = {
        id: event.id,
        gateway: event.gateway,
        eventType: event.eventType,
        gatewayEventId: event.gatewayEventId ?? null,
        payloadJson: event.payloadJson,
        intentId: event.intentId ?? null,
        receivedAt,
      };
      await db.insert(t.gatewayEvents).values(row);
      return eventRowToRecord(row);
    },
    async listGatewayEvents(intentId) {
      const rows = (await db
        .select()
        .from(t.gatewayEvents)
        .where(eq(t.gatewayEvents.intentId, intentId))
        .orderBy(desc(t.gatewayEvents.receivedAt))) as Record<string, unknown>[];
      return rows.map((row) => eventRowToRecord(row));
    },
  };
}
