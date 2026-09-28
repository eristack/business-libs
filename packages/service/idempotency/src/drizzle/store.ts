import { eq } from "drizzle-orm";
import type { IdempotencyRecord, IdempotencyStore } from "../core/types.js";
import type { IdempotencyTables } from "./tables.js";

type Db = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  select: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insert: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: (...args: any[]) => any;
};

function rowToRecord(row: Record<string, unknown>): IdempotencyRecord {
  const lease = row.leaseExpiresAt ? Date.parse(String(row.leaseExpiresAt)) : undefined;
  return {
    state: row.state as IdempotencyRecord["state"],
    requestHash: row.requestHash ? String(row.requestHash) : undefined,
    result:
      row.responseJson != null && row.responseJson !== ""
        ? JSON.parse(String(row.responseJson))
        : undefined,
    errorMessage: row.errorMessage ? String(row.errorMessage) : undefined,
    leaseExpiresAt: Number.isFinite(lease) ? lease : undefined,
    createdAt: Date.parse(String(row.createdAt)),
  };
}

function isUniqueViolation(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: string }).code;
  if (code === "23505" || code === "SQLITE_CONSTRAINT_UNIQUE") return true;
  const message = (err as { message?: string }).message ?? "";
  return /unique constraint|UNIQUE constraint failed/i.test(message);
}

export function createDrizzleIdempotencyStore(options: {
  db: Db;
  tables: IdempotencyTables;
}): IdempotencyStore {
  const { db, tables: t } = options;
  const nowIso = () => new Date().toISOString();

  async function read(key: string) {
    const rows = await db.select().from(t.records).where(eq(t.records.storageKey, key)).limit(1);
    const row = rows[0] as Record<string, unknown> | undefined;
    return row ? rowToRecord(row) : null;
  }

  return {
    get: read,
    async claim(input) {
      const now = Date.now();
      const existing = await read(input.key);
      if (existing?.state === "completed") return false;
      if (
        existing?.state === "pending" &&
        (existing.leaseExpiresAt == null || existing.leaseExpiresAt > now)
      ) {
        return false;
      }

      const leaseIso = new Date(now + (input.leaseMs ?? 60_000)).toISOString();
      const stamp = nowIso();
      try {
        if (!existing) {
          await db.insert(t.records).values({
            storageKey: input.key,
            state: "pending",
            requestHash: input.requestHash,
            leaseExpiresAt: leaseIso,
            createdAt: stamp,
            updatedAt: stamp,
          });
          return true;
        }
        await db
          .update(t.records)
          .set({
            state: "pending",
            requestHash: input.requestHash,
            leaseExpiresAt: leaseIso,
            responseJson: null,
            errorMessage: null,
            updatedAt: stamp,
          })
          .where(eq(t.records.storageKey, input.key));
        return true;
      } catch (err) {
        if (isUniqueViolation(err)) return false;
        throw err;
      }
    },
    async complete(key, result) {
      await db
        .update(t.records)
        .set({
          state: "completed",
          responseJson: JSON.stringify(result),
          leaseExpiresAt: null,
          updatedAt: nowIso(),
        })
        .where(eq(t.records.storageKey, key));
    },
    async fail(key, errorMessage) {
      await db
        .update(t.records)
        .set({
          state: "failed",
          errorMessage,
          leaseExpiresAt: null,
          updatedAt: nowIso(),
        })
        .where(eq(t.records.storageKey, key));
    },
  };
}
