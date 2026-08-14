import { asDate, asNullableDate } from "@eristack/backseat/adapters";
import type { BackseatStore } from "@eristack/backseat";
import type { RefreshTokenRecord, RefreshTokenStore } from "../core/types.js";
import { JWT_AUTH_COLLECTIONS } from "./collections.js";

function fromDoc(doc: Record<string, unknown>): RefreshTokenRecord {
  return {
    id: String(doc.id),
    subject: String(doc.subject),
    tokenHash: String(doc.tokenHash),
    familyId: String(doc.familyId),
    expiresAt: asDate(doc.expiresAt),
    revokedAt: asNullableDate(doc.revokedAt),
    createdAt: asDate(doc.createdAt),
    replacedByTokenId:
      doc.replacedByTokenId == null ? null : String(doc.replacedByTokenId),
    claims:
      doc.claims && typeof doc.claims === "object" && !Array.isArray(doc.claims)
        ? (doc.claims as RefreshTokenRecord["claims"])
        : undefined,
  };
}

function toDoc(record: RefreshTokenRecord): Record<string, unknown> {
  return {
    id: record.id,
    subject: record.subject,
    tokenHash: record.tokenHash,
    familyId: record.familyId,
    expiresAt: record.expiresAt.toISOString(),
    revokedAt: record.revokedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    replacedByTokenId: record.replacedByTokenId,
    claims: record.claims,
  };
}

export function createBackseatRefreshTokenStore(
  store: BackseatStore,
  options: { collection?: string } = {},
): RefreshTokenStore {
  const collection = options.collection ?? JWT_AUTH_COLLECTIONS.refreshTokens;

  async function readAll(): Promise<RefreshTokenRecord[]> {
    const docs = await store.list(collection);
    return docs.map(fromDoc);
  }

  return {
    async save(record) {
      const existing = await store.get(collection, record.id);
      const doc = toDoc(record);
      if (existing) {
        await store.update(collection, record.id, doc);
        return;
      }
      await store.create(collection, doc);
    },

    async findByHash(tokenHash) {
      const docs = await readAll();
      return docs.find((row) => row.tokenHash === tokenHash) ?? null;
    },

    async findById(id) {
      const doc = await store.get(collection, id);
      return doc ? fromDoc(doc) : null;
    },

    async listActiveBySubject(subject, now) {
      const nowMs = now.getTime();
      return (await readAll())
        .filter(
          (record) =>
            record.subject === subject &&
            record.revokedAt == null &&
            record.expiresAt.getTime() > nowMs,
        )
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },

    async revoke(id, revokedAt) {
      const doc = await store.get(collection, id);
      if (!doc || doc.revokedAt) return;
      await store.update(collection, id, {
        revokedAt: revokedAt.toISOString(),
      });
    },

    async revokeFamily(familyId, revokedAt) {
      for (const record of await readAll()) {
        if (record.familyId === familyId && !record.revokedAt) {
          await store.update(collection, record.id, {
            revokedAt: revokedAt.toISOString(),
          });
        }
      }
    },

    async revokeAllForSubject(subject, revokedAt) {
      for (const record of await readAll()) {
        if (record.subject === subject && !record.revokedAt) {
          await store.update(collection, record.id, {
            revokedAt: revokedAt.toISOString(),
          });
        }
      }
    },

    async markReplaced(id, replacedByTokenId, revokedAt) {
      const doc = await store.get(collection, id);
      if (!doc) return;
      await store.update(collection, id, {
        replacedByTokenId,
        revokedAt: revokedAt.toISOString(),
      });
    },
  };
}
