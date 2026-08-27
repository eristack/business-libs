import { describe, expect, it, afterEach } from "vitest";
import { createTestSqliteDb, execSql, canUseBetterSqlite } from "@internal/test-harness";
import { createDocNumber, createMemoryFormatStore } from "../src/index.js";
import {
  createDocNumberSequenceTable,
  createDrizzleSequenceStore,
} from "../src/drizzle/index.js";

const SEQUENCE_DDL = [
  `CREATE TABLE doc_number_sequences (
    id TEXT PRIMARY KEY,
    format_id TEXT NOT NULL,
    period_key TEXT NOT NULL,
    scope TEXT NOT NULL DEFAULT '',
    current_value INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE UNIQUE INDEX doc_number_sequences_format_period_scope_uidx
     ON doc_number_sequences (format_id, period_key, scope)`,
];

describe.skipIf(!canUseBetterSqlite())("doc-number drizzle integration", () => {
  let dbHandle: ReturnType<typeof createTestSqliteDb>;

  afterEach(() => {
    dbHandle?.close();
  });

  it("allocates unique sequences concurrently via Drizzle store", async () => {
    dbHandle = createTestSqliteDb();
    execSql(dbHandle.sqlite, SEQUENCE_DDL);

    const sequenceTable = createDocNumberSequenceTable("sqlite");
    const sequences = createDrizzleSequenceStore({
      dialect: "sqlite",
      db: dbHandle.db,
      table: sequenceTable,
      idFactory: () => crypto.randomUUID(),
    });

    const clock = () => new Date("2026-08-11T00:00:00.000Z");
    const doc = createDocNumber({
      formats: createMemoryFormatStore(),
      sequences,
      clock,
      idFactory: () => "fmt_concurrent",
    });

    await doc.registerFormat({
      entityKey: "invoice",
      pattern: "INV-{YYYY}{MM}-{SEQ:5}",
      reset: "monthly",
    });

    const results = await Promise.all(
      Array.from({ length: 10 }, () => doc.next({ entityKey: "invoice" })),
    );
    const sequenceNumbers = results.map((r) => r.sequence);
    expect(new Set(sequenceNumbers).size).toBe(10);
    expect(Math.min(...sequenceNumbers)).toBe(1);
    expect(Math.max(...sequenceNumbers)).toBe(10);
  });
});
