import { describe, expect, it, afterEach } from "vitest";
import { createTestSqliteDb, execSql, canUseBetterSqlite } from "@internal/test-harness";
import { createIdempotencyGuard } from "../src/core/guard.js";
import { createIdempotencyTables } from "../src/drizzle/tables.js";
import { createDrizzleIdempotencyStore } from "../src/drizzle/store.js";

const DDL = [
  `CREATE TABLE idempotency_records (
    storage_key TEXT PRIMARY KEY,
    state TEXT NOT NULL,
    request_hash TEXT NOT NULL,
    response_json TEXT,
    error_message TEXT,
    lease_expires_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
];

describe.skipIf(!canUseBetterSqlite())("idempotency drizzle integration", () => {
  let dbHandle: ReturnType<typeof createTestSqliteDb>;

  afterEach(() => {
    dbHandle?.close();
  });

  it("replays completed scoped results", async () => {
    dbHandle = createTestSqliteDb();
    execSql(dbHandle.sqlite, DDL);
    const tables = createIdempotencyTables("sqlite");
    const store = createDrizzleIdempotencyStore({ db: dbHandle.db, tables });
    const guard = createIdempotencyGuard(store);
    let calls = 0;
    const result = await guard.runScoped({
      scope: { scope: "POST /po" },
      key: "k1",
      requestHash: "hash1",
      fn: async () => {
        calls += 1;
        return { id: "po-1" };
      },
    });
    const replay = await guard.runScoped({
      scope: { scope: "POST /po" },
      key: "k1",
      requestHash: "hash1",
      fn: async () => {
        calls += 1;
        return { id: "po-2" };
      },
    });
    expect(result).toEqual({ id: "po-1" });
    expect(replay).toEqual({ id: "po-1" });
    expect(calls).toBe(1);
  });
});
