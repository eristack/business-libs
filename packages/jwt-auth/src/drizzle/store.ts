import { and, eq, isNull } from "drizzle-orm";
import type { RefreshTokenRecord, RefreshTokenStore } from "../core/types.js";
import type { AnyRefreshTokenTable } from "./table.js";
import type { DrizzleDialect } from "./types.js";

/** Minimal Drizzle DB surface used by the refresh-token store. */
export interface DrizzleLikeDb {
  insert: (table: AnyRefreshTokenTable) => {
    values: (values: Record<string, unknown>) => Promise<unknown> | { then: Promise<unknown>["then"] };
  };
  select: () => {
    from: (table: AnyRefreshTokenTable) => {
      where: (condition: unknown) => Promise<Array<Record<string, unknown>>>;
    };
  };
  update: (table: AnyRefreshTokenTable) => {
    set: (values: Record<string, unknown>) => {
      where: (condition: unknown) => Promise<unknown> | { then: Promise<unknown>["then"] };
    };
  };
}

export interface CreateDrizzleRefreshTokenStoreOptions {
  dialect: DrizzleDialect;
  db: DrizzleLikeDb;
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
      const rows = await db
        .select()
        .from(table)
        .where(eq(table.tokenHash, tokenHash));
      const row = rows[0];
      return row ? toRecord(row) : null;
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
