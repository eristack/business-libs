import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { describe, expect, it } from "vitest";
import {
  createBackseatDocumentTables,
  createDrizzleBackseatStore,
} from "../src/drizzle/index.js";

function createSqliteStore() {
  const sqlite = new Database(":memory:");
  sqlite.exec(`
    CREATE TABLE backseat_documents (
      collection text NOT NULL,
      doc_id text NOT NULL,
      payload text NOT NULL,
      PRIMARY KEY (collection, doc_id)
    )
  `);
  const tables = createBackseatDocumentTables("sqlite");
  const db = drizzle(sqlite);
  return {
    store: createDrizzleBackseatStore({
      db,
      tables,
      dialect: "sqlite",
      sqlite,
      runSyncTransaction: (work) => {
        sqlite.transaction(work)();
      },
    }),
    sqlite,
  };
}

describe("createDrizzleBackseatStore (sqlite)", () => {
  it("creates and reads documents", async () => {
    const { store } = createSqliteStore();
    await store.create("products", { id: "p1", name: "Desk" });
    expect(await store.get("products", "p1")).toEqual({ id: "p1", name: "Desk" });
  });

  it("atomic writes multiple collections or rolls back staged flush", async () => {
    const { store } = createSqliteStore();

    await store.atomic(async (tx) => {
      await tx.set("jobs", { id: "job_1", number: "JO/2026/00001" });
      await tx.set("costSheets", { id: "cs_1", jobId: "job_1" });
    });

    expect(await store.get("jobs", "job_1")).toMatchObject({
      number: "JO/2026/00001",
    });
    expect(await store.get("costSheets", "cs_1")).toMatchObject({
      jobId: "job_1",
    });

    await expect(
      store.atomic(async (tx) => {
        await tx.set("jobs", { id: "job_2", number: "JO/2026/00002" });
        throw new Error("cost sheet failed");
      }),
    ).rejects.toThrow("cost sheet failed");

    expect(await store.get("jobs", "job_2")).toBeNull();
    expect(await store.list("jobs")).toHaveLength(1);
  });
});
