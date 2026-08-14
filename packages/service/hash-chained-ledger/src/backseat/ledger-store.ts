import type { BackseatStore } from "@eristack/backseat";
import type {
  ChainId,
  LedgerEntry,
  LedgerEntryStore,
  LedgerSnapshot,
} from "../core/types.js";
import { HASH_CHAINED_LEDGER_COLLECTIONS } from "./collections.js";

function entryFromDoc(doc: Record<string, unknown>): LedgerEntry {
  return {
    id: String(doc.id),
    chainId: String(doc.chainId),
    sequence: Number(doc.sequence),
    openingBalance: String(doc.openingBalance),
    inAmount: String(doc.inAmount),
    outAmount: String(doc.outAmount),
    adjustment: String(doc.adjustment),
    closingBalance: String(doc.closingBalance),
    entryType: String(doc.entryType),
    entryTypeId: String(doc.entryTypeId),
    occurredAt: String(doc.occurredAt),
    prevHash: doc.prevHash == null ? null : String(doc.prevHash),
    entryHash: String(doc.entryHash),
    meta:
      doc.meta && typeof doc.meta === "object" && !Array.isArray(doc.meta)
        ? (doc.meta as Record<string, unknown>)
        : undefined,
  };
}

function snapshotFromDoc(doc: Record<string, unknown>): LedgerSnapshot {
  return {
    chainId: String(doc.chainId),
    sequence: Number(doc.sequence),
    balance: String(doc.balance),
    entryHash: String(doc.entryHash),
    updatedAt: String(doc.updatedAt),
  };
}

export type CreateBackseatLedgerStoreOptions = {
  store: BackseatStore;
  entriesCollection?: string;
  snapshotsCollection?: string;
};

/** BackseatStore-backed ledger persistence for browser prototypes. */
export function createBackseatLedgerStore(
  options: CreateBackseatLedgerStoreOptions,
): LedgerEntryStore {
  const { store } = options;
  const entriesCol =
    options.entriesCollection ?? HASH_CHAINED_LEDGER_COLLECTIONS.entries;
  const snapshotsCol =
    options.snapshotsCollection ?? HASH_CHAINED_LEDGER_COLLECTIONS.snapshots;

  return {
    async listByChain(chainId: ChainId) {
      const docs = await store.list(entriesCol, {
        where: { chainId },
        sort: "sequence",
        order: "asc",
      });
      return docs.map((doc) => entryFromDoc(doc));
    },

    async getTip(chainId: ChainId) {
      const docs = await store.list(entriesCol, {
        where: { chainId },
        sort: "sequence",
        order: "desc",
        limit: 1,
      });
      return docs[0] ? entryFromDoc(docs[0]) : null;
    },

    async append(entry: LedgerEntry) {
      await store.create(entriesCol, { ...entry });
    },

    async getSnapshot(chainId: ChainId) {
      const doc = await store.get(snapshotsCol, chainId);
      return doc ? snapshotFromDoc(doc) : null;
    },

    async upsertSnapshot(snapshot: LedgerSnapshot) {
      const existing = await store.get(snapshotsCol, snapshot.chainId);
      if (existing) {
        await store.update(snapshotsCol, snapshot.chainId, { ...snapshot });
        return;
      }
      await store.create(snapshotsCol, { id: snapshot.chainId, ...snapshot });
    },
  };
}
