import { afterEach, describe, expect, it } from "vitest";
import { canUseBetterSqlite, createTestSqliteDb, execSql } from "@internal/test-harness";
import { createFileManager } from "../src/index.js";
import {
  createDrizzleFileRecordStore,
  createFileManagerTables,
} from "../src/drizzle/index.js";
import {
  createMemoryStorageDriver,
  memoryPutViaPresignedUrl,
} from "../src/core/memory-driver.js";

const DDL = [
  `CREATE TABLE file_manager_files (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    namespace TEXT NOT NULL,
    owner_id TEXT,
    ref_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    ready_at TEXT
  )`,
];

describe.skipIf(!canUseBetterSqlite())("file-manager drizzle integration", () => {
  let dbHandle: ReturnType<typeof createTestSqliteDb>;

  afterEach(() => {
    dbHandle?.close();
  });

  it("persists metadata across presign and complete", async () => {
    dbHandle = createTestSqliteDb();
    execSql(dbHandle.sqlite, DDL);

    const tables = createFileManagerTables("sqlite");
    const driver = createMemoryStorageDriver();
    const files = createFileManager({
      driver,
      store: createDrizzleFileRecordStore({ db: dbHandle.db, tables }),
    });

    const session = await files.beginPresignedUpload({
      originalName: "drizzle.txt",
      mimeType: "text/plain",
      sizeBytes: 4,
      namespace: "docs",
    });

    await memoryPutViaPresignedUrl(
      driver,
      session.uploadUrl,
      new TextEncoder().encode("data"),
      session.uploadHeaders,
    );

    const ready = await files.completeUpload({ fileId: session.fileId });
    expect(ready.status).toBe("ready");

    const listed = await files.listFiles({ namespace: "docs" });
    expect(listed).toHaveLength(1);
    expect(listed[0]?.id).toBe(session.fileId);
  });
});
