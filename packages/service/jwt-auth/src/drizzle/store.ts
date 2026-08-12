import { and, eq, gt, isNull } from "drizzle-orm";
import type { RefreshTokenRecord, RefreshTokenStore } from "../core/types.js";
import type { AnyRefreshTokenTable } from "./table.js";
import type { DrizzleDialect } from "./types.js";

/**
 * App-owned Drizzle database handle.
 * Typed loosely so real `drizzle(...)` clients (sqlite/pgsql/mysql) inject without friction.
 */
export interface DrizzleLikeDb {
  // Real Drizzle insert/select/update generics vary by dialect — keep this structural.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insert: (table: any) => { values: (values: any) => any };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  select: () => { from: (table: any) => { where: (condition: any) => any } };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: (table: any) => { set: (values: any) => { where: (condition: any) => any } };
}

/**
 * App-injected Drizzle binding. The package never opens connections or
 * chooses a driver — pass your own `db` (and table schema) from the app.
 */
export interface CreateDrizzleRefreshTokenStoreOptions {
  dialect: DrizzleDialect;
  /** Existing Drizzle database instance owned by the application. */
  db: DrizzleLikeDb;
  /** Table from `createRefreshTokenTable` (or a compatible app schema). */
  table: AnyRefreshTokenTable;
}

function toRecord(row: Record<string, unknown>): RefreshTokenRecord {
  return {
    id: String(row.id),
    subject: String(row.subject),
    tokenHash: String(row.tokenHash),
    familyId: String(row.familyId),
    expiresAt: row.expiresAt instanceof Date ? row.expiresAt : new Date(String(row.expiresAt)),
    revokedAt:
      row.revokedAt == null
        ? null
        : row.revokedAt instanceof Date
          ? row.revokedAt
          : new Date(String(row.revokedAt)),
    createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(String(row.createdAt)),
    replacedByTokenId:
      row.replacedByTokenId == null ? null : String(row.replacedByTokenId),
    claims:
      row.claims && typeof row.claims === "object"
        ? (row.claims as Record<string, unknown>)
        : undefined,
  };
}

export function createDrizzleRefreshTokenStore(
  options: CreateDrizzleRefreshTokenStoreOptions,
): RefreshTokenStore {
  const { db, table } = options;

  return {
    async save(record) {
      await db.insert(table).values({
        id: record.id,
        subject: record.subject,
        tokenHash: record.tokenHash,
        familyId: record.familyId,
        expiresAt: record.expiresAt,
        revokedAt: record.revokedAt,
        createdAt: record.createdAt,
        replacedByTokenId: record.replacedByTokenId,
        claims: record.claims ?? null,
      });
    },

    async findByHash(tokenHash) {
      const rows = (await db
        .select()
        .from(table)
        .where(eq(table.tokenHash, tokenHash))) as Array<Record<string, unknown>>;
      const row = rows[0];
      return row ? toRecord(row) : null;
    },

    async findById(id) {
      const rows = (await db
        .select()
        .from(table)
        .where(eq(table.id, id))) as Array<Record<string, unknown>>;
      const row = rows[0];
      return row ? toRecord(row) : null;
    },

    async listActiveBySubject(subject, now) {
      const rows = (await db
        .select()
        .from(table)
        .where(
          and(
            eq(table.subject, subject),
            isNull(table.revokedAt),
            gt(table.expiresAt, now),
          ),
        )) as Array<Record<string, unknown>>;
      return rows
        .map(toRecord)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },

    async revoke(id, revokedAt) {
      await db
        .update(table)
        .set({ revokedAt })
        .where(and(eq(table.id, id), isNull(table.revokedAt)));
    },

    async revokeFamily(familyId, revokedAt) {
      await db
        .update(table)
        .set({ revokedAt })
        .where(and(eq(table.familyId, familyId), isNull(table.revokedAt)));
    },

    async revokeAllForSubject(subject, revokedAt) {
      await db
        .update(table)
        .set({ revokedAt })
        .where(and(eq(table.subject, subject), isNull(table.revokedAt)));
    },

    async markReplaced(id, replacedByTokenId, revokedAt) {
      await db
        .update(table)
        .set({ replacedByTokenId, revokedAt })
        .where(eq(table.id, id));
    },
  };
}
