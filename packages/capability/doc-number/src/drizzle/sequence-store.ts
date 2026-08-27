import { and, eq } from "drizzle-orm";
import { normalizeScope } from "../core/scope.js";
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

  async function findRow(formatId: string, periodKey: string, scope: string) {
    const rows = (await db
      .select()
      .from(table)
      .where(
        and(
          eq(table.formatId, formatId),
          eq(table.periodKey, periodKey),
          eq(table.scope, scope),
        ),
      )) as Array<Record<string, unknown>>;
    return rows[0] ?? null;
  }

  return {
    async allocateNext(input) {
      const scope = normalizeScope(input.scope);
      const { formatId, periodKey } = input;
      const existing = await findRow(formatId, periodKey, scope);
      const now = new Date();

      if (!existing) {
        const next = 1;
        await db.insert(table).values({
          id: idFactory(),
          formatId,
          periodKey,
          scope,
          currentValue: next,
          updatedAt: now,
        });
        return next;
      }

      const next = Number(existing.currentValue) + 1;
      await db
        .update(table)
        .set({ currentValue: next, updatedAt: now })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .where(eq(table.id as any, String(existing.id)));
      return next;
    },

    async getCurrent(input) {
      const existing = await findRow(
        input.formatId,
        input.periodKey,
        normalizeScope(input.scope),
      );
      if (!existing) return null;
      return Number(existing.currentValue);
    },

    async peekNext(input) {
      const existing = await findRow(
        input.formatId,
        input.periodKey,
        normalizeScope(input.scope),
      );
      return existing ? Number(existing.currentValue) + 1 : 1;
    },
  };
}
