import type {
  ChainId,
  LedgerEntry,
  LedgerEntryStore,
  LedgerSnapshot,
} from "./types.js";

/** In-process store for **unit tests only**. Never the app default — use Drizzle. */
export function createMemoryLedgerStore(): LedgerEntryStore {
  const byChain = new Map<ChainId, LedgerEntry[]>();
  const snapshots = new Map<ChainId, LedgerSnapshot>();

  return {
    async listByChain(chainId) {
      return [...(byChain.get(chainId) ?? [])];
    },
    async getTip(chainId) {
      const list = byChain.get(chainId);
      return list?.at(-1) ?? null;
    },
    async append(entry) {
      const list = byChain.get(entry.chainId) ?? [];
      list.push(entry);
      byChain.set(entry.chainId, list);
    },
    async getSnapshot(chainId) {
      return snapshots.get(chainId) ?? null;
    },
    async upsertSnapshot(snapshot) {
      snapshots.set(snapshot.chainId, snapshot);
    },
  };
}
