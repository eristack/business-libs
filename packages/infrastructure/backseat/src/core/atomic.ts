import { BackseatConflictError, BackseatNotFoundError } from "./errors.js";
import type { BackseatDocument, TransactionalStore } from "./types.js";

export type CollectionMap = Map<string, BackseatDocument>;

function requireId(doc: BackseatDocument): string {
  const id = String(doc.id ?? "");
  if (!id) {
    throw new BackseatConflictError("Document id is required");
  }
  return id;
}

function createTransactionalStore(
  loadCollection: (collection: string) => Promise<CollectionMap>,
  staging: Map<string, CollectionMap>,
  dirty: Set<string>,
): TransactionalStore {
  async function ensureCollection(collection: string): Promise<CollectionMap> {
    let map = staging.get(collection);
    if (!map) {
      map = await loadCollection(collection);
      staging.set(collection, map);
      dirty.add(collection);
    }
    return map;
  }

  return {
    async get(collection, id) {
      const map = await ensureCollection(collection);
      return map.get(id) ?? null;
    },

    async create(collection, doc) {
      const id = requireId(doc);
      const map = await ensureCollection(collection);
      if (map.has(id)) {
        throw new BackseatConflictError(`Document already exists: ${id}`);
      }
      const stored = { ...doc, id };
      map.set(id, stored);
      return stored;
    },

    async update(collection, id, patch) {
      const map = await ensureCollection(collection);
      const existing = map.get(id);
      if (!existing) {
        throw new BackseatNotFoundError(`${collection}/${id} not found`);
      }
      const next = { ...existing, ...patch, id };
      map.set(id, next);
      return next;
    },

    async set(collection, doc) {
      const id = requireId(doc);
      const map = await ensureCollection(collection);
      const stored = { ...doc, id };
      map.set(id, stored);
      return stored;
    },

    async delete(collection, id) {
      const map = await ensureCollection(collection);
      if (!map.delete(id)) {
        throw new BackseatNotFoundError(`${collection}/${id} not found`);
      }
    },
  };
}

/**
 * Run multi-collection work against a staging layer, then commit once.
 * IndexedDB commits all touched collections in a single IDB transaction.
 */
export async function runAtomicTransaction<T>(
  loadCollection: (collection: string) => Promise<CollectionMap>,
  commit: (staging: Map<string, CollectionMap>, dirty: Set<string>) => Promise<void>,
  work: (tx: TransactionalStore) => Promise<T>,
): Promise<T> {
  const staging = new Map<string, CollectionMap>();
  const dirty = new Set<string>();
  const tx = createTransactionalStore(loadCollection, staging, dirty);
  const result = await work(tx);
  await commit(staging, dirty);
  return result;
}

export function cloneCollectionMap(source: CollectionMap): CollectionMap {
  return new Map(
    [...source.entries()].map(([id, doc]) => [id, { ...doc, id: String(doc.id) }]),
  );
}

export function docsFromCollectionMap(map: CollectionMap): BackseatDocument[] {
  return [...map.values()];
}
