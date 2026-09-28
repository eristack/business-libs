import { and, eq } from "drizzle-orm";
import { isCommsUniqueViolation } from "../core/duplicate-key.js";
import type { CommsDeliveryEventRecord, CommsMessageRecord, CommsStore } from "../core/types.js";
import type { CommsTables } from "./tables.js";

type Db = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  select: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insert: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: (...args: any[]) => any;
};

function rowToMessage(row: Record<string, unknown>): CommsMessageRecord {
  return {
    id: String(row.id),
    channel: row.channel as CommsMessageRecord["channel"],
    vendor: String(row.vendor),
    idempotencyKey: String(row.idempotencyKey),
    status: row.status as CommsMessageRecord["status"],
    to: String(row.to),
    subject: row.subject ? String(row.subject) : undefined,
    providerMessageId: row.providerMessageId ? String(row.providerMessageId) : undefined,
    metadataJson: row.metadataJson ? String(row.metadataJson) : undefined,
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

export function createDrizzleCommsStore(options: { db: Db; tables: CommsTables }): CommsStore {
  const { db, tables: t } = options;

  return {
    async findMessageByIdempotencyKey(vendor, idempotencyKey) {
      const rows = await db
        .select()
        .from(t.messages)
        .where(and(eq(t.messages.vendor, vendor), eq(t.messages.idempotencyKey, idempotencyKey)))
        .limit(1);
      const row = rows[0] as Record<string, unknown> | undefined;
      return row ? rowToMessage(row) : null;
    },
    async insertMessage(input) {
      const now = new Date().toISOString();
      try {
      await db.insert(t.messages).values({
        id: input.id,
        channel: input.channel,
        vendor: input.vendor,
        idempotencyKey: input.idempotencyKey,
        status: input.status,
        to: input.to,
        subject: input.subject ?? null,
        providerMessageId: input.providerMessageId ?? null,
        metadataJson: input.metadataJson ?? null,
        createdAt: now,
        updatedAt: now,
      });
      } catch (err) {
        if (isCommsUniqueViolation(err)) throw err;
        throw err;
      }
      return rowToMessage({
        ...input,
        createdAt: now,
        updatedAt: now,
      });
    },
    async getMessageById(id) {
      const rows = await db.select().from(t.messages).where(eq(t.messages.id, id)).limit(1);
      const row = rows[0] as Record<string, unknown> | undefined;
      return row ? rowToMessage(row) : null;
    },
    async updateMessage(id, patch) {
      const now = new Date().toISOString();
      await db
        .update(t.messages)
        .set({
          ...(patch.status ? { status: patch.status } : {}),
          ...(patch.providerMessageId ? { providerMessageId: patch.providerMessageId } : {}),
          updatedAt: now,
        })
        .where(eq(t.messages.id, id));
      const row = await this.getMessageById(id);
      if (!row) throw new Error(`missing message ${id}`);
      return row;
    },
    async findDeliveryEventByProviderEventId(vendor, providerEventId) {
      const rows = await db
        .select()
        .from(t.deliveryEvents)
        .where(
          and(
            eq(t.deliveryEvents.vendor, vendor),
            eq(t.deliveryEvents.providerEventId, providerEventId),
          ),
        )
        .limit(1);
      const row = rows[0] as Record<string, unknown> | undefined;
      if (!row) return null;
      return {
        id: String(row.id),
        vendor: String(row.vendor),
        eventType: String(row.eventType),
        providerEventId: row.providerEventId ? String(row.providerEventId) : undefined,
        messageId: row.messageId ? String(row.messageId) : undefined,
        payloadJson: String(row.payloadJson),
        receivedAt: String(row.receivedAt),
      } satisfies CommsDeliveryEventRecord;
    },
    async appendDeliveryEvent(input) {
      const receivedAt = new Date().toISOString();
      try {
      await db.insert(t.deliveryEvents).values({
        id: input.id,
        vendor: input.vendor,
        eventType: input.eventType,
        providerEventId: input.providerEventId ?? null,
        messageId: input.messageId ?? null,
        payloadJson: input.payloadJson,
        receivedAt,
      });
      } catch (err) {
        if (isCommsUniqueViolation(err) && input.providerEventId) {
          const dup = await this.findDeliveryEventByProviderEventId(
            input.vendor,
            input.providerEventId,
          );
          if (dup) return dup;
        }
        throw err;
      }
      return {
        id: input.id,
        vendor: input.vendor,
        eventType: input.eventType,
        providerEventId: input.providerEventId,
        messageId: input.messageId,
        payloadJson: input.payloadJson,
        receivedAt,
      };
    },
    async findMessageByProviderId(vendor, providerMessageId) {
      const rows = await db
        .select()
        .from(t.messages)
        .where(
          and(eq(t.messages.vendor, vendor), eq(t.messages.providerMessageId, providerMessageId)),
        )
        .limit(1);
      const row = rows[0] as Record<string, unknown> | undefined;
      return row ? rowToMessage(row) : null;
    },
  };
}
