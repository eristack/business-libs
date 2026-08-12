import type { FormatRecord, FormatStore } from "./types.js";

function clone(record: FormatRecord): FormatRecord {
  return { ...record };
}

export function createMemoryFormatStore(): FormatStore {
  const byId = new Map<string, FormatRecord>();

  return {
    async save(record) {
      byId.set(record.id, clone(record));
    },

    async findById(id) {
      const record = byId.get(id);
      return record ? clone(record) : null;
    },

    async findActiveByEntityKey(entityKey) {
      const matches = [...byId.values()]
        .filter((r) => r.entityKey === entityKey && r.active)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      return matches[0] ? clone(matches[0]) : null;
    },

    async listByEntityKey(entityKey) {
      return [...byId.values()]
        .filter((r) => r.entityKey === entityKey)
        .map(clone)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    },
  };
}
