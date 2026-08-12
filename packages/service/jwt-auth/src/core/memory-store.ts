import type { RefreshTokenRecord, RefreshTokenStore } from "./types.js";

function clone(record: RefreshTokenRecord): RefreshTokenRecord {
  return {
    ...record,
    claims: record.claims ? { ...record.claims } : undefined,
  };
}

/** In-memory store for tests and ephemeral use. */
export function createMemoryRefreshTokenStore(): RefreshTokenStore {
  const byId = new Map<string, RefreshTokenRecord>();
  const byHash = new Map<string, string>();

  return {
    async save(record) {
      byId.set(record.id, clone(record));
      byHash.set(record.tokenHash, record.id);
    },

    async findByHash(tokenHash) {
      const id = byHash.get(tokenHash);
      if (!id) return null;
      const record = byId.get(id);
      return record ? clone(record) : null;
    },

    async findById(id) {
      const record = byId.get(id);
      return record ? clone(record) : null;
    },

    async listActiveBySubject(subject, now) {
      const nowMs = now.getTime();
      return [...byId.values()]
        .filter(
          (record) =>
            record.subject === subject &&
            record.revokedAt == null &&
            record.expiresAt.getTime() > nowMs,
        )
        .map(clone)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },

    async revoke(id, revokedAt) {
      const record = byId.get(id);
      if (!record || record.revokedAt) return;
      byId.set(id, { ...record, revokedAt });
    },

    async revokeFamily(familyId, revokedAt) {
      for (const [id, record] of byId) {
        if (record.familyId === familyId && !record.revokedAt) {
          byId.set(id, { ...record, revokedAt });
        }
      }
    },

    async revokeAllForSubject(subject, revokedAt) {
      for (const [id, record] of byId) {
        if (record.subject === subject && !record.revokedAt) {
          byId.set(id, { ...record, revokedAt });
        }
      }
    },

    async markReplaced(id, replacedByTokenId, revokedAt) {
      const record = byId.get(id);
      if (!record) return;
      byId.set(id, { ...record, replacedByTokenId, revokedAt });
    },
  };
}
