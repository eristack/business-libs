import { asc, desc, eq } from "drizzle-orm";
import type {
  ChainId,
  LedgerEntry,
  LedgerEntryStore,
  LedgerSnapshot,
} from "../core/types.js";
import type { HashChainedLedgerTables } from "./tables.js";

type Db = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  select: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insert: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete: (...args: any[]) => any;
};

function rowToEntry(row: {
  id: string;
  chainId: string;
  sequence: number;
  openingBalance: string;
  inAmount: string;
  outAmount: string;
  adjustment: string;
  closingBalance: string;
  entryType: string;
  entryTypeId: string;
  occurredAt: string;
  prevHash: string | null;
  entryHash: string;
  metaJson: string | null;
}): LedgerEntry {
  return {
    id: row.id,
    chainId: row.chainId,
    sequence: row.sequence,
    openingBalance: row.openingBalance,
    inAmount: row.inAmount,
    outAmount: row.outAmount,
    adjustment: row.adjustment,
    closingBalance: row.closingBalance,
    entryType: row.entryType,
    entryTypeId: row.entryTypeId,
    occurredAt: row.occurredAt,
    prevHash: row.prevHash,
    entryHash: row.entryHash,
    meta: row.metaJson
      ? (JSON.parse(row.metaJson) as Record<string, unknown>)
      : undefined,
  };
}

/**
 * Drizzle-backed ledger store. Production path (Vercel + Postgres).
 * Memory store is tests/demos only.
 */
export function createDrizzleLedgerStore(options: {
  db: Db;
  tables: HashChainedLedgerTables;
}): LedgerEntryStore {
  const { db, tables: t } = options;

  return {
    async listByChain(chainId: ChainId) {
      const rows = await db
        .select()
        .from(t.entries)
        .where(eq(t.entries.chainId, chainId))
        .orderBy(asc(t.entries.sequence));
      return rows.map(rowToEntry);
    },

    async getTip(chainId: ChainId) {
      const rows = await db
        .select()
        .from(t.entries)
        .where(eq(t.entries.chainId, chainId))
        .orderBy(desc(t.entries.sequence))
        .limit(1);
      const row = rows[0];
      return row ? rowToEntry(row) : null;
    },

    async append(entry: LedgerEntry) {
      await db.insert(t.entries).values({
        id: entry.id,
        chainId: entry.chainId,
        sequence: entry.sequence,
        openingBalance: entry.openingBalance,
        inAmount: entry.inAmount,
        outAmount: entry.outAmount,
        adjustment: entry.adjustment,
        closingBalance: entry.closingBalance,
        entryType: entry.entryType,
        entryTypeId: entry.entryTypeId,
        occurredAt: entry.occurredAt,
        prevHash: entry.prevHash,
        entryHash: entry.entryHash,
        metaJson: entry.meta ? JSON.stringify(entry.meta) : null,
      });
    },

    async getSnapshot(chainId: ChainId) {
      const rows = await db
        .select()
        .from(t.snapshots)
        .where(eq(t.snapshots.chainId, chainId))
        .limit(1);
      const row = rows[0] as
        | {
            chainId: string;
            sequence: number;
            balance: string;
            entryHash: string;
            updatedAt: string;
          }
        | undefined;
      if (!row) return null;
      return {
        chainId: row.chainId,
        sequence: row.sequence,
        balance: row.balance,
        entryHash: row.entryHash,
        updatedAt: row.updatedAt,
      } satisfies LedgerSnapshot;
    },

    async upsertSnapshot(snapshot: LedgerSnapshot) {
      await db
        .delete(t.snapshots)
        .where(eq(t.snapshots.chainId, snapshot.chainId));
      await db.insert(t.snapshots).values({
        chainId: snapshot.chainId,
        sequence: snapshot.sequence,
        balance: snapshot.balance,
        entryHash: snapshot.entryHash,
        updatedAt: snapshot.updatedAt,
      });
    },
  };
}
