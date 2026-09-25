import { and, eq } from "drizzle-orm";
import { applyCollectionFilter } from "../core/filter.js";
import {
  cloneCollectionMap,
  docsFromCollectionMap,
  runAtomicTransaction,
  type CollectionMap,
} from "../core/atomic.js";
import {
  BackseatConflictError,
  BackseatNotFoundError,
} from "../core/errors.js";
import type {
  BackseatDocument,
  BackseatSnapshot,
  BackseatStore,
} from "../core/types.js";
import type { BackseatDocumentTables, BackseatDrizzleDialect } from "./tables.js";

type Db = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  select: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insert: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transaction?: (...args: any[]) => any;
};

function parsePayload(raw: string): BackseatDocument {
  const doc = JSON.parse(raw) as BackseatDocument;
  const id = String(doc.id ?? "");
  return id ? { ...doc, id } : doc;
}

function requireId(doc: BackseatDocument): string {
  const id = String(doc.id ?? "");
  if (!id) {
    throw new BackseatConflictError("Document id is required");
  }
  return id;
}

async function replaceCollectionRows(
  db: Db,
  table: BackseatDocumentTables["documents"],
  collection: string,
  map: CollectionMap,
): Promise<void> {
  await db.delete(table).where(eq(table.collection, collection));
  const docs = docsFromCollectionMap(map);
  if (docs.length === 0) {
    return;
  }
  await db.insert(table).values(
    docs.map((doc) => ({
      collection,
      docId: String(doc.id),
      payload: JSON.stringify(doc),
    })),
  );
}

/**
 * Drizzle-backed Backseat store for Horizon B workshop mirrors.
 *
 * **SQLite (better-sqlite3):** pass `runSyncTransaction` from `database.transaction`.
 * Async `work()` runs against staging; flush uses a **sync** transaction (Drizzle sqlite
 * cannot await inside `transaction()` callbacks).
 *
 * **Postgres:** uses Drizzle async `db.transaction()` for atomic flush.
 */
type BetterSqliteDatabase = {
  prepare: (sql: string) => { run: (...params: unknown[]) => unknown };
};

export function createDrizzleBackseatStore(options: {
  db: Db;
  tables: BackseatDocumentTables;
  dialect: BackseatDrizzleDialect;
  /**
   * Required when `dialect` is `sqlite` — e.g. `(fn) => { sqliteDb.transaction(fn)(); }`
   * Wraps the sync flush for `store.atomic()`.
   */
  runSyncTransaction?: (work: () => void) => void;
  /** Same better-sqlite3 connection as Drizzle — required for sqlite `atomic()` flush. */
  sqlite?: BetterSqliteDatabase;
  /** SQL table name for sqlite atomic flush — default `backseat_documents`. */
  sqliteTableName?: string;
}): BackseatStore {
  const { db, tables: t, dialect } = options;
  const documents = t.documents;
  const sqliteTable = options.sqliteTableName ?? "backseat_documents";

  async function loadCollectionMap(collection: string): Promise<CollectionMap> {
    const rows = (await db
      .select()
      .from(documents)
      .where(eq(documents.collection, collection))) as {
      payload: string;
    }[];
    const map: CollectionMap = new Map();
    for (const row of rows) {
      const doc = parsePayload(row.payload);
      const id = String(doc.id ?? "");
      if (id) {
        map.set(id, doc);
      }
    }
    return map;
  }

  async function commitAtomic(
    staging: Map<string, CollectionMap>,
    dirty: Set<string>,
  ): Promise<void> {
    if (dialect === "sqlite") {
      const runSync = options.runSyncTransaction;
      const sqlite = options.sqlite;
      if (!runSync || !sqlite) {
        throw new Error(
          "createDrizzleBackseatStore({ dialect: 'sqlite' }) requires runSyncTransaction and sqlite for store.atomic()",
        );
      }
      runSync(() => {
        const del = sqlite.prepare(
          `DELETE FROM ${sqliteTable} WHERE collection = ?`,
        );
        const ins = sqlite.prepare(
          `INSERT INTO ${sqliteTable} (collection, doc_id, payload) VALUES (?, ?, ?)`,
        );
        for (const name of dirty) {
          const map = staging.get(name);
          if (!map) continue;
          del.run(name);
          for (const doc of map.values()) {
            ins.run(name, String(doc.id), JSON.stringify(doc));
          }
        }
      });
      return;
    }

    if (!db.transaction) {
      throw new Error("Drizzle db.transaction is required for pgsql store.atomic()");
    }
    await db.transaction(async (tx: Db) => {
      for (const name of dirty) {
        const map = staging.get(name);
        if (!map) continue;
        await replaceCollectionRows(tx, documents, name, map);
      }
    });
  }

  return {
    async list(collection, filter) {
      const map = await loadCollectionMap(collection);
      const docs = [...map.values()];
      return applyCollectionFilter(docs, filter);
    },

    async get(collection, id) {
      const map = await loadCollectionMap(collection);
      return map.get(id) ?? null;
    },

    async create(collection, doc) {
      const id = requireId(doc);
      const existing = await this.get(collection, id);
      if (existing) {
        throw new BackseatConflictError(`Document already exists: ${id}`);
      }
      const stored = { ...doc, id };
      await db.insert(documents).values({
        collection,
        docId: id,
        payload: JSON.stringify(stored),
      });
      return stored;
    },

    async update(collection, id, patch) {
      const existing = await this.get(collection, id);
      if (!existing) {
        throw new BackseatNotFoundError(`${collection}/${id} not found`);
      }
      const next = { ...existing, ...patch, id };
      await db
        .update(documents)
        .set({ payload: JSON.stringify(next) })
        .where(
          and(eq(documents.collection, collection), eq(documents.docId, id)),
        );
      return next;
    },

    async delete(collection, id) {
      const existing = await this.get(collection, id);
      if (!existing) {
        throw new BackseatNotFoundError(`${collection}/${id} not found`);
      }
      await db
        .delete(documents)
        .where(
          and(eq(documents.collection, collection), eq(documents.docId, id)),
        );
    },

    async listCollections() {
      const rows = (await db
        .select({ collection: documents.collection })
        .from(documents)) as { collection: string }[];
      return [...new Set(rows.map((r) => r.collection))].sort();
    },

    async exportSnapshot() {
      const names = await this.listCollections();
      const snapshot: BackseatSnapshot = {};
      for (const name of names) {
        snapshot[name] = await this.list(name);
      }
      return snapshot;
    },

    async importSnapshot(snapshot) {
      await this.clear();
      for (const [name, docs] of Object.entries(snapshot)) {
        if (docs.length === 0) continue;
        await db.insert(documents).values(
          docs.map((doc) => {
            const id = requireId(doc);
            return {
              collection: name,
              docId: id,
              payload: JSON.stringify({ ...doc, id }),
            };
          }),
        );
      }
    },

    async clear() {
      await db.delete(documents);
    },

    async atomic(work) {
      return runAtomicTransaction(
        async (collection) => cloneCollectionMap(await loadCollectionMap(collection)),
        commitAtomic,
        work,
      );
    },
  };
}
