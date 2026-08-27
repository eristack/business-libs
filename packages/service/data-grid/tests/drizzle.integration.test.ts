import { describe, expect, it, afterEach } from "vitest";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createTestSqliteDb, execSql, canUseBetterSqlite } from "@internal/test-harness";
import { createDataGrid } from "../src/index.js";
import {
  columnsFromSource,
  executeDrizzleList,
} from "../src/drizzle/index.js";

const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  transactionDate: text("transaction_date").notNull(),
  total: text("total").notNull(),
});

const orderGridSchema = {
  fields: [
    { name: "name", type: "string" as const, filterable: true, sortable: true },
    {
      name: "transactionDate",
      type: "wall" as const,
      timezone: "Asia/Jakarta",
      filterable: true,
      sortable: true,
    },
    {
      name: "total",
      type: "decimal" as const,
      filterable: true,
      sortable: true,
    },
  ],
  defaultPageSize: 10,
  maxPageSize: 50,
};

const seedRows = [
  { id: "1", name: "Alpha", transactionDate: "2026-01-15", total: "100.00" },
  { id: "2", name: "Beta", transactionDate: "2026-02-01", total: "250.50" },
  { id: "3", name: "Gamma", transactionDate: "2026-03-10", total: "75.25" },
  { id: "4", name: "Delta", transactionDate: "2026-01-20", total: "500.00" },
];

describe.skipIf(!canUseBetterSqlite())("data-grid drizzle integration", () => {
  const grid = createDataGrid(orderGridSchema);
  let dbHandle: ReturnType<typeof createTestSqliteDb>;

  afterEach(() => {
    dbHandle?.close();
  });

  function setup() {
    dbHandle = createTestSqliteDb();
    execSql(dbHandle.sqlite, [
      `CREATE TABLE orders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        transaction_date TEXT NOT NULL,
        total TEXT NOT NULL
      )`,
    ]);
    for (const row of seedRows) {
      dbHandle.sqlite
        .prepare(
          `INSERT INTO orders (id, name, transaction_date, total) VALUES (?, ?, ?, ?)`,
        )
        .run(row.id, row.name, row.transactionDate, row.total);
    }
    return dbHandle.db;
  }

  it("filters eq, wall between, decimal gte, and sorts", async () => {
    const db = setup();
    const source = orders;

    const eqResult = await executeDrizzleList({
      dialect: "sqlite",
      db,
      source,
      columns: columnsFromSource(source, orderGridSchema),
      query: grid.fromSearch({
        mode: "advanced",
        filters: { type: "clause", field: "name", op: "eq", value: "Beta" },
        sorts: [{ field: "name", dir: "asc" }],
        page: { mode: "offset", page: 1, pageSize: 10 },
      }),
      schema: orderGridSchema,
    });
    expect(eqResult.items).toHaveLength(1);
    expect(eqResult.items[0]?.name).toBe("Beta");

    const betweenResult = await executeDrizzleList({
      dialect: "sqlite",
      db,
      source,
      columns: columnsFromSource(source, orderGridSchema),
      query: grid.fromSearch({
        mode: "advanced",
        filters: {
          type: "clause",
          field: "transactionDate",
          op: "between",
          value: ["2026-01-01", "2026-01-31"],
        },
        sorts: [{ field: "transactionDate", dir: "asc" }],
        page: { mode: "offset", page: 1, pageSize: 10 },
      }),
      schema: orderGridSchema,
    });
    expect(betweenResult.items.map((r) => r.name)).toEqual(["Alpha", "Delta"]);

    const gteResult = await executeDrizzleList({
      dialect: "sqlite",
      db,
      source,
      columns: columnsFromSource(source, orderGridSchema),
      query: grid.fromSearch({
        mode: "advanced",
        filters: {
          type: "clause",
          field: "total",
          op: "gte",
          value: "250.50",
        },
        sorts: [{ field: "total", dir: "desc" }],
        page: { mode: "offset", page: 1, pageSize: 10 },
      }),
      schema: orderGridSchema,
    });
    expect(gteResult.items.map((r) => r.total)).toEqual(["500.00", "250.50"]);
  });

  it("returns cursor page envelope with inferred hasNext", async () => {
    const db = setup();
    const source = orders;

    const result = await executeDrizzleList({
      dialect: "sqlite",
      db,
      source,
      columns: columnsFromSource(source, orderGridSchema),
      query: grid.fromSearch({
        mode: "advanced",
        sorts: [{ field: "name", dir: "asc" }],
        page: { mode: "cursor", cursor: null, limit: 2 },
      }),
      schema: orderGridSchema,
    });
    expect(result.items).toHaveLength(2);
    expect(result.pageInfo.mode).toBe("cursor");
    expect(result.pageInfo.hasNext).toBe(true);
    expect(result.pageInfo.limit).toBe(2);
  });
});
