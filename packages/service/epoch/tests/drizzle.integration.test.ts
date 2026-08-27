import { describe, expect, it, afterEach } from "vitest";
import { createTestSqliteDb, execSql, canUseBetterSqlite } from "@internal/test-harness";
import { createEpoch } from "../src/index.js";
import {
  createDrizzleEpochStore,
  createEpochTables,
} from "../src/drizzle/index.js";

const EPOCH_DDL = [
  `CREATE TABLE epoch_counters (
    scope TEXT PRIMARY KEY,
    value INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT
  )`,
];

describe.skipIf(!canUseBetterSqlite())("epoch drizzle integration", () => {
  let dbHandle: ReturnType<typeof createTestSqliteDb>;

  afterEach(() => {
    dbHandle?.close();
  });

  it("bump and bumpMany via Drizzle store", async () => {
    dbHandle = createTestSqliteDb();
    execSql(dbHandle.sqlite, EPOCH_DDL);

    const tables = createEpochTables("sqlite");
    const epoch = createEpoch({
      store: createDrizzleEpochStore({ db: dbHandle.db, tables }),
    });

    expect(await epoch.current("orders")).toBe(0);
    expect(await epoch.bump("orders")).toBe(1);
    expect(await epoch.current("orders")).toBe(1);

    await epoch.bumpMany(["jobs", "cost-sheets", "dashboard"]);
    expect(await epoch.current("jobs")).toBe(1);
    expect(await epoch.current("cost-sheets")).toBe(1);
    expect(await epoch.current("dashboard")).toBe(1);
  });
});
