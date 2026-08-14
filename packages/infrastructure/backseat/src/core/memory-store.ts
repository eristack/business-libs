import { applyCollectionFilter } from "./filter.js";
import type { BackseatDocument, BackseatSnapshot, BackseatStore } from "./types.js";
import { BackseatConflictError, BackseatNotFoundError } from "./errors.js";

/** In-process store for unit tests and Storybook — not the browser prototype default. */
export function createMemoryBackseatStore(): BackseatStore {
  const data = new Map<string, Map<string, BackseatDocument>>();

  function bucket(collection: string): Map<string, BackseatDocument> {
    let map = data.get(collection);
    if (!map) {
      map = new Map();
      data.set(collection, map);
    }
    return map;
  }

  return {
    async list(collection, filter) {
      const docs = [...bucket(collection).values()];
      return applyCollectionFilter(docs, filter);
    },

    async get(collection, id) {
      return bucket(collection).get(id) ?? null;
    },

    async create(collection, doc) {
      const id = String(doc.id ?? "");
      if (!id) {
        throw new BackseatConflictError("Document id is required");
      }
      const map = bucket(collection);
      if (map.has(id)) {
        throw new BackseatConflictError(`Document already exists: ${id}`);
      }
      const stored = { ...doc, id };
      map.set(id, stored);
      return stored;
    },

    async update(collection, id, patch) {
      const map = bucket(collection);
      const existing = map.get(id);
      if (!existing) {
        throw new BackseatNotFoundError(`${collection}/${id} not found`);
      }
      const next = { ...existing, ...patch, id };
      map.set(id, next);
      return next;
    },

    async delete(collection, id) {
      const map = bucket(collection);
      if (!map.delete(id)) {
        throw new BackseatNotFoundError(`${collection}/${id} not found`);
      }
    },

    async listCollections() {
      return [...data.keys()].sort();
    },

    async exportSnapshot() {
      const snapshot: BackseatSnapshot = {};
      for (const [name, map] of data.entries()) {
        snapshot[name] = [...map.values()];
      }
      return snapshot;
    },

    async importSnapshot(snapshot) {
      data.clear();
      for (const [name, docs] of Object.entries(snapshot)) {
        const map = bucket(name);
        for (const doc of docs) {
          const id = String(doc.id ?? "");
          if (!id) continue;
          map.set(id, { ...doc, id });
        }
      }
    },

    async clear() {
      data.clear();
    },
  };
}
