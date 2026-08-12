import type { CredentialRecord, CredentialStore } from "./types.js";

function clone(record: CredentialRecord): CredentialRecord {
  return { ...record };
}

/** In-memory credentials store for tests / demos. */
export function createMemoryCredentialStore(): CredentialStore {
  const byId = new Map<string, CredentialRecord>();
  const byUsername = new Map<string, string>();
  const bySubject = new Map<string, string>();

  return {
    async save(record) {
      byId.set(record.id, clone(record));
      byUsername.set(record.username.toLowerCase(), record.id);
      bySubject.set(record.subject, record.id);
    },

    async findByUsername(username) {
      const id = byUsername.get(username.toLowerCase());
      if (!id) return null;
      const record = byId.get(id);
      return record ? clone(record) : null;
    },

    async findBySubject(subject) {
      const id = bySubject.get(subject);
      if (!id) return null;
      const record = byId.get(id);
      return record ? clone(record) : null;
    },

    async updatePasswordHash(id, passwordHash, updatedAt) {
      const record = byId.get(id);
      if (!record) return;
      byId.set(id, { ...record, passwordHash, updatedAt });
    },

    async disable(id, disabledAt) {
      const record = byId.get(id);
      if (!record) return;
      byId.set(id, { ...record, disabledAt, updatedAt: disabledAt });
    },
  };
}
