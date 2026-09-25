import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { and } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { assignmentScopePrefilter } from "../../abac/src/core/assignment-scope.js";
import { assignmentScopeWhere } from "../src/drizzle/assignment-scope.js";

const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  branchId: text("branch_id").notNull(),
  trade: text("trade").notNull(),
});

const rows = [
  { id: "j1", branchId: "HQ", trade: "export" },
  { id: "j2", branchId: "SUB", trade: "export" },
  { id: "j3", branchId: "HQ", trade: "domestic" },
];

const assignments = [
  { branchId: "HQ", trade: "export" },
  { branchId: "SUB", trade: "import" },
];

function idsFromPrefilter(): string[] {
  return rows
    .filter((doc) => assignmentScopePrefilter(assignments, doc))
    .map((r) => r.id)
    .sort();
}

describe("assignment scope parity", () => {
  it("prefilter and SQL return the same job ids", async () => {
    const sqlite = new Database(":memory:");
    sqlite.exec(`
      CREATE TABLE jobs (
        id text PRIMARY KEY,
        branch_id text NOT NULL,
        trade text NOT NULL
      )
    `);
    for (const row of rows) {
      sqlite
        .prepare("INSERT INTO jobs (id, branch_id, trade) VALUES (?, ?, ?)")
        .run(row.id, row.branchId, row.trade);
    }
    const db = drizzle(sqlite);
    const scope = assignmentScopeWhere(
      { branchId: jobs.branchId, trade: jobs.trade },
      assignments,
    );
    const sqlRows = await db
      .select({ id: jobs.id })
      .from(jobs)
      .where(and(scope));
    const sqlIds = sqlRows.map((r) => r.id).sort();
    expect(idsFromPrefilter()).toEqual(["j1"]);
    expect(sqlIds).toEqual(["j1"]);
  });

  it("empty assignments match nothing", async () => {
    expect(assignmentScopePrefilter([], { branchId: "HQ", trade: "export" })).toBe(
      false,
    );
    const sqlite = new Database(":memory:");
    sqlite.exec(`
      CREATE TABLE jobs (
        id text PRIMARY KEY,
        branch_id text NOT NULL,
        trade text NOT NULL
      )
    `);
    sqlite.prepare("INSERT INTO jobs VALUES ('j1', 'HQ', 'export')").run();
    const db = drizzle(sqlite);
    const scope = assignmentScopeWhere(
      { branchId: jobs.branchId, trade: jobs.trade },
      [],
    );
    const sqlRows = await db.select({ id: jobs.id }).from(jobs).where(scope);
    expect(sqlRows).toEqual([]);
  });
});
