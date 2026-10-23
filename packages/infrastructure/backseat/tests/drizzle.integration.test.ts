import { afterEach, describe, expect, it } from "vitest";
import { canUseBetterSqlite, createTestSqliteDb, execSql } from "@internal/test-harness";
import {
  createBackseatDocumentTables,
  createDrizzleBackseatStore,
} from "../src/drizzle/index.js";

const DDL = [
  `CREATE TABLE backseat_documents (
    collection TEXT NOT NULL,
    doc_id TEXT NOT NULL,
    payload TEXT NOT NULL,
    PRIMARY KEY (collection, doc_id)
  )`,
];

describe.skipIf(!canUseBetterSqlite())("backseat drizzle integration", () => {
  let dbHandle: ReturnType<typeof createTestSqliteDb>;

  afterEach(() => {
    dbHandle?.close();
  });

  it("createDrizzleBackseatStore persists documents on sqlite", async () => {
    dbHandle = createTestSqliteDb();
    execSql(dbHandle.sqlite, DDL);

    const tables = createBackseatDocumentTables("sqlite");
    const store = createDrizzleBackseatStore({
      db: dbHandle.db,
      tables,
      dialect: "sqlite",
      sqlite: dbHandle.sqlite,
      runSyncTransaction: (work) => {
        dbHandle.sqlite.transaction(work)();
      },
    });

    await store.create("products", { id: "p1", name: "Desk" });
    expect(await store.get("products", "p1")).toEqual({ id: "p1", name: "Desk" });

    await store.atomic(async (tx) => {
      await tx.set("jobs", { id: "job_1", number: "JO/2026/00001" });
    });
    expect(await store.get("jobs", "job_1")).toMatchObject({
      number: "JO/2026/00001",
    });
  });
});
