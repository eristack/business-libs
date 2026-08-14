import { applyCollectionFilter } from "../core/filter.js";
import {
  BackseatConflictError,
  BackseatNotFoundError,
} from "../core/errors.js";
import type {
  BackseatCollectionFilter,
  BackseatDocument,
  BackseatSnapshot,
  BackseatStore,
} from "../core/types.js";

const DB_VERSION = 1;
const COLLECTIONS_STORE = "collections";

type CollectionRow = {
  name: string;
  docs: BackseatDocument[];
};

function hasIndexedDb(): boolean {
  return typeof indexedDB !== "undefined";
}

function openDatabase(dbName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(COLLECTIONS_STORE)) {
        db.createObjectStore(COLLECTIONS_STORE, { keyPath: "name" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB open failed"));
  });
}

function idbRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

async function runWrite(db: IDBDatabase, fn: (store: IDBObjectStore) => IDBRequest): Promise<void> {
  const tx = db.transaction(COLLECTIONS_STORE, "readwrite");
  const store = tx.objectStore(COLLECTIONS_STORE);
  await idbRequest(fn(store));
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB write failed"));
  });
}

async function readCollection(
  db: IDBDatabase,
  name: string,
): Promise<BackseatDocument[]> {
  const tx = db.transaction(COLLECTIONS_STORE, "readonly");
  const row = await idbRequest<CollectionRow | undefined>(
    tx.objectStore(COLLECTIONS_STORE).get(name),
  );
  return row?.docs ?? [];
}

async function writeCollection(
  db: IDBDatabase,
  name: string,
  docs: BackseatDocument[],
): Promise<void> {
  await runWrite(db, (store) =>
    store.put({ name, docs } satisfies CollectionRow),
  );
}

async function deleteCollection(db: IDBDatabase, name: string): Promise<void> {
  await runWrite(db, (store) => store.delete(name));
}

async function listCollectionNames(db: IDBDatabase): Promise<string[]> {
  const tx = db.transaction(COLLECTIONS_STORE, "readonly");
  const keys = await idbRequest<IDBValidKey[]>(
    tx.objectStore(COLLECTIONS_STORE).getAllKeys(),
  );
  return keys.map(String).sort();
}

/** Browser persistence default for prototypes — not for unit tests (use memory). */
export function createIndexedDbBackseatStore(options?: {
  dbName?: string;
}): BackseatStore {
  if (!hasIndexedDb()) {
    throw new Error(
      "IndexedDB is unavailable — use createMemoryBackseatStore in Node/tests",
    );
  }

  const dbName = options?.dbName ?? "eristack-backseat";
  let dbPromise: Promise<IDBDatabase> | null = null;

  const db = () => {
    if (!dbPromise) dbPromise = openDatabase(dbName);
    return dbPromise;
  };

  async function loadDocs(collection: string): Promise<BackseatDocument[]> {
    return readCollection(await db(), collection);
  }

  async function saveDocs(
    collection: string,
    docs: BackseatDocument[],
  ): Promise<void> {
    await writeCollection(await db(), collection, docs);
  }

  return {
    async list(collection, filter?: BackseatCollectionFilter) {
      const docs = await loadDocs(collection);
      return applyCollectionFilter(docs, filter);
    },

    async get(collection, id) {
      const docs = await loadDocs(collection);
      return docs.find((doc) => String(doc.id) === id) ?? null;
    },

    async create(collection, doc) {
      const id = String(doc.id ?? "");
      if (!id) throw new BackseatConflictError("Document id is required");

      const docs = await loadDocs(collection);
      if (docs.some((item) => String(item.id) === id)) {
        throw new BackseatConflictError(`Document already exists: ${id}`);
      }

      const stored = { ...doc, id };
      docs.push(stored);
      await saveDocs(collection, docs);
      return stored;
    },

    async update(collection, id, patch) {
      const docs = await loadDocs(collection);
      const index = docs.findIndex((item) => String(item.id) === id);
      if (index < 0) {
        throw new BackseatNotFoundError(`${collection}/${id} not found`);
      }
      const next = { ...docs[index], ...patch, id };
      docs[index] = next;
      await saveDocs(collection, docs);
      return next;
    },

    async delete(collection, id) {
      const docs = await loadDocs(collection);
      const next = docs.filter((item) => String(item.id) !== id);
      if (next.length === docs.length) {
        throw new BackseatNotFoundError(`${collection}/${id} not found`);
      }
      await saveDocs(collection, next);
    },

    async listCollections() {
      return listCollectionNames(await db());
    },

    async exportSnapshot() {
      const names = await listCollectionNames(await db());
      const snapshot: BackseatSnapshot = {};
      for (const name of names) {
        snapshot[name] = await loadDocs(name);
      }
      return snapshot;
    },

    async importSnapshot(snapshot) {
      const database = await db();
      const existing = await listCollectionNames(database);
      for (const name of existing) {
        await deleteCollection(database, name);
      }
      for (const [name, docs] of Object.entries(snapshot)) {
        await writeCollection(database, name, docs.map((doc) => ({ ...doc })));
      }
    },

    async clear() {
      const database = await db();
      const names = await listCollectionNames(database);
      for (const name of names) {
        await deleteCollection(database, name);
      }
    },
  };
}
