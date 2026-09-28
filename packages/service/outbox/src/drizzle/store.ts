import { asc, eq } from "drizzle-orm";
import type { EnqueueOutboxInput, OutboxMessage, OutboxStore } from "../core/types.js";
import type { OutboxTables } from "./tables.js";

type Db = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  select: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insert: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: (...args: any[]) => any;
};

function rowToMessage(row: Record<string, unknown>): OutboxMessage {
  return {
    id: String(row.id),
    aggregateType: String(row.aggregateType),
    aggregateId: String(row.aggregateId),
    messageType: String(row.messageType),
    payloadJson: String(row.payloadJson),
    idempotencyKey: String(row.idempotencyKey),
    status: row.status as OutboxMessage["status"],
    attempts: Number(row.attempts ?? 0),
    lastError: row.lastError ? String(row.lastError) : undefined,
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

function isUnique(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: string }).code;
  return code === "23505" || code === "SQLITE_CONSTRAINT_UNIQUE";
}

export function createDrizzleOutboxStore(options: {
  db: Db;
  tables: OutboxTables;
}): OutboxStore {
  const { db, tables: t } = options;
  const now = () => new Date().toISOString();

  return {
    async enqueue(input: EnqueueOutboxInput) {
      const stamp = now();
      try {
        await db.insert(t.messages).values({
          id: input.id,
          aggregateType: input.aggregateType,
          aggregateId: input.aggregateId,
          messageType: input.messageType,
          payloadJson: input.payloadJson,
          idempotencyKey: input.idempotencyKey,
          status: "pending",
          attempts: 0,
          createdAt: stamp,
          updatedAt: stamp,
        });
      } catch (err) {
        if (isUnique(err)) {
          const existing = await this.findByIdempotencyKey(input.idempotencyKey);
          if (existing) return existing;
        }
        throw err;
      }
      return rowToMessage({
        ...input,
        status: "pending",
        attempts: 0,
        createdAt: stamp,
        updatedAt: stamp,
      });
    },
    async findByIdempotencyKey(idempotencyKey) {
      const rows = await db
        .select()
        .from(t.messages)
        .where(eq(t.messages.idempotencyKey, idempotencyKey))
        .limit(1);
      const row = rows[0] as Record<string, unknown> | undefined;
      return row ? rowToMessage(row) : null;
    },
    async claimBatch(limit) {
      const rows = (await db
        .select()
        .from(t.messages)
        .where(eq(t.messages.status, "pending"))
        .orderBy(asc(t.messages.createdAt))
        .limit(limit)) as Record<string, unknown>[];
      const stamp = now();
      for (const row of rows) {
        await db
          .update(t.messages)
          .set({
            status: "processing",
            attempts: Number(row.attempts ?? 0) + 1,
            updatedAt: stamp,
          })
          .where(eq(t.messages.id, String(row.id)));
      }
      return rows.map((row) =>
        rowToMessage({
          ...row,
          status: "processing",
          attempts: Number(row.attempts ?? 0) + 1,
          updatedAt: stamp,
        }),
      );
    },
    async markProcessed(id) {
      await db
        .update(t.messages)
        .set({ status: "processed", updatedAt: now() })
        .where(eq(t.messages.id, id));
    },
    async markFailed(id, errorMessage) {
      await db
        .update(t.messages)
        .set({
          status: "failed",
          lastError: errorMessage,
          updatedAt: now(),
        })
        .where(eq(t.messages.id, id));
    },
  };
}
