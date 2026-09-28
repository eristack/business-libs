import type {
  ChainId,
  LedgerEntry,
  LedgerEntryStore,
  LedgerSnapshot,
} from "./types.js";

/** In-process store for **unit tests only**. Never the app default — use Drizzle. */
function idemIndexKey(chainId: ChainId, idempotencyKey: string) {
  return `${chainId}\0${idempotencyKey}`;
}

export function createMemoryLedgerStore(): LedgerEntryStore {
  const byChain = new Map<ChainId, LedgerEntry[]>();
  const snapshots = new Map<ChainId, LedgerSnapshot>();
  const byIdempotency = new Map<string, LedgerEntry>();

  return {
    async listByChain(chainId) {
      return [...(byChain.get(chainId) ?? [])];
    },
    async getTip(chainId) {
      const list = byChain.get(chainId);
      return list?.at(-1) ?? null;
    },
    async findByIdempotencyKey(chainId, idempotencyKey) {
      return byIdempotency.get(idemIndexKey(chainId, idempotencyKey)) ?? null;
    },
    async append(entry) {
      if (entry.idempotencyKey) {
        const ik = idemIndexKey(entry.chainId, entry.idempotencyKey);
        const hit = byIdempotency.get(ik);
        if (hit) {
          const dup: Error & { code?: string } = new Error(
            "ledger idempotency key conflict",
          );
          dup.code = "23505";
          throw dup;
        }
      }
      const list = byChain.get(entry.chainId) ?? [];
      list.push(entry);
      byChain.set(entry.chainId, list);
      if (entry.idempotencyKey) {
        byIdempotency.set(idemIndexKey(entry.chainId, entry.idempotencyKey), entry);
      }
    },
    async getSnapshot(chainId) {
      return snapshots.get(chainId) ?? null;
    },
    async upsertSnapshot(snapshot) {
      snapshots.set(snapshot.chainId, snapshot);
    },
  };
}
