import { and, eq } from "drizzle-orm";
import type { SequenceStore } from "../core/types.js";
import type { AnyDocNumberSequenceTable } from "./sequence-table.js";
import type { DrizzleDialect, DrizzleLikeDb } from "./types.js";

export interface CreateDrizzleSequenceStoreOptions {
  dialect: DrizzleDialect;
  db: DrizzleLikeDb;
  table: AnyDocNumberSequenceTable;
  /** Optional id factory for new sequence rows. */
  idFactory?: () => string;
}

function defaultId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `seq_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  );
}

/**
 * Drizzle sequence store using read-then-update.
 * For stronger concurrency, wrap allocateNext in a DB transaction with row locks
 * (e.g. SELECT … FOR UPDATE on Postgres) in the application layer.
 */
export function createDrizzleSequenceStore(
  options: CreateDrizzleSequenceStoreOptions,
): SequenceStore {
  const { db, table } = options;
  const idFactory = options.idFactory ?? defaultId;

  async function findRow(formatId: string, periodKey: string) {
    const rows = (await db
      .select()
      .from(table)
      .where(and(eq(table.formatId, formatId), eq(table.periodKey, periodKey)))) as Array<
      Record<string, unknown>
    >;
    return rows[0] ?? null;
  }

  return {
    async allocateNext({ formatId, periodKey }) {
      const existing = await findRow(formatId, periodKey);
      const now = new Date();

      if (!existing) {
        const next = 1;
        await db.insert(table).values({
          id: idFactory(),
          formatId,
          periodKey,
          currentValue: next,
          updatedAt: now,
        });
        return next;
      }

      const next = Number(existing.currentValue) + 1;
      await db
        .update(table)
        .set({ currentValue: next, updatedAt: now })
        // Dialect union makes eq column typing collapse to never — cast for Any*Table.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .where(eq(table.id as any, String(existing.id)));
      return next;
    },

    async getCurrent({ formatId, periodKey }) {
      const existing = await findRow(formatId, periodKey);
      if (!existing) return null;
      return Number(existing.currentValue);
    },

    async peekNext({ formatId, periodKey }) {
      const existing = await findRow(formatId, periodKey);
      return existing ? Number(existing.currentValue) + 1 : 1;
    },
  };
}
