import type Database from "better-sqlite3";
import { createHashChainedLedger } from "../core/create-ledger.js";
import { createDrizzleLedgerStore } from "../drizzle/store.js";
import { createHashChainedLedgerTables } from "../drizzle/tables.js";
import { createTestSqliteDb, execSql, type TestSqliteDb } from "@internal/test-harness";

const HCL_DDL = [
  `CREATE TABLE IF NOT EXISTS hcl_entries (
    id TEXT PRIMARY KEY NOT NULL,
    chain_id TEXT NOT NULL,
    sequence INTEGER NOT NULL,
    opening_balance TEXT NOT NULL,
    in_amount TEXT NOT NULL,
    out_amount TEXT NOT NULL,
    adjustment TEXT NOT NULL,
    closing_balance TEXT NOT NULL,
    entry_type TEXT NOT NULL,
    entry_type_id TEXT NOT NULL,
    occurred_at TEXT NOT NULL,
    prev_hash TEXT,
    entry_hash TEXT NOT NULL,
    meta_json TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS hcl_snapshots (
    chain_id TEXT PRIMARY KEY NOT NULL,
    sequence INTEGER NOT NULL,
    balance TEXT NOT NULL,
    entry_hash TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS hcl_entries_chain_seq ON hcl_entries (chain_id, sequence)`,
];

export type HclHarness = TestSqliteDb & {
  tables: ReturnType<typeof createHashChainedLedgerTables>;
  store: ReturnType<typeof createDrizzleLedgerStore>;
  ledger: ReturnType<typeof createHashChainedLedger>;
};

export function setupHclSqlite(prefix = "hcl"): HclHarness {
  const testDb = createTestSqliteDb();
  execSql(testDb.sqlite, HCL_DDL);

  const tables = createHashChainedLedgerTables("sqlite", prefix);
  const store = createDrizzleLedgerStore({ db: testDb.db, tables });
  const ledger = createHashChainedLedger({ store });

  return { ...testDb, tables, store, ledger };
}

export function tamperHclClosingBalance(
  sqlite: Database.Database,
  chainId: string,
  sequence: number,
  badBalance: string,
) {
  sqlite
    .prepare(
      `UPDATE hcl_entries SET closing_balance = ? WHERE chain_id = ? AND sequence = ?`,
    )
    .run(badBalance, chainId, sequence);
}

export function tamperHclEntryHash(
  sqlite: Database.Database,
  chainId: string,
  sequence: number,
) {
  sqlite
    .prepare(
      `UPDATE hcl_entries SET entry_hash = 'deadbeef' WHERE chain_id = ? AND sequence = ?`,
    )
    .run(chainId, sequence);
}
