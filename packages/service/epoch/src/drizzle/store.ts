import { and, eq, inArray } from "drizzle-orm";
import { StaleEpochError } from "../core/errors.js";
import type { EpochScope, EpochStore, EpochValue } from "../core/types.js";
import type { EpochTables } from "./tables.js";

type Db = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  select: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insert: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: (...args: any[]) => any;
};

export function createDrizzleEpochStore(options: {
  db: Db;
  tables: EpochTables;
}): EpochStore {
  const { db, tables: t } = options;
  const now = () => new Date().toISOString();

  async function read(scope: EpochScope): Promise<EpochValue> {
    const rows = await db.select().from(t.counters).where(eq(t.counters.scope, scope));
    const row = rows[0] as { value: number } | undefined;
    return row?.value ?? 0;
  }

  return {
    get: read,

    async getMany(scopes) {
      if (scopes.length === 0) return {};
      const rows = await db
        .select()
        .from(t.counters)
        .where(inArray(t.counters.scope, scopes));
      const out: Record<EpochScope, EpochValue> = {};
      for (const scope of scopes) out[scope] = 0;
      for (const row of rows as { scope: string; value: number }[]) {
        out[row.scope] = row.value;
      }
      return out;
    },

    async bump(scope, input = {}) {
      const by = input.by ?? 1;
      const current = await read(scope);

      if (input.expected !== undefined && input.expected !== current) {
        throw new StaleEpochError(scope, input.expected, current);
      }

      const next = current + by;

      if (current === 0) {
        await db.insert(t.counters).values({
          scope,
          value: next,
          updatedAt: now(),
        });
        return next;
      }

      const where =
        input.expected !== undefined
          ? and(
              eq(t.counters.scope, scope),
              eq(t.counters.value, input.expected),
            )
          : eq(t.counters.scope, scope);

      const updated = await db
        .update(t.counters)
        .set({ value: next, updatedAt: now() })
        .where(where)
        .returning({ value: t.counters.value });

      if (updated.length === 0) {
        const latest = await read(scope);
        throw new StaleEpochError(
          scope,
          input.expected ?? current,
          latest,
        );
      }

      return (updated[0] as { value: number }).value;
    },
  };
}
