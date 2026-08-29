import { describe, expect, it } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createDataGrid } from "../src/index.js";
import { buildDrizzleQuery } from "../src/drizzle/query.js";

const orders = sqliteTable("orders", {
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

const grid = createDataGrid(orderGridSchema);
const columns = {
  name: orders.name,
  transactionDate: orders.transactionDate,
  total: orders.total,
};

function sqlSnapshot(query: ReturnType<typeof grid.parse>) {
  const built = buildDrizzleQuery({
    dialect: "sqlite",
    columns,
    query,
    schema: orderGridSchema,
  });
  const db = drizzle(new Database(":memory:"));
  let stmt = db.select().from(orders);
  if (built.where) stmt = stmt.where(built.where);
  if (built.orderBy.length > 0) stmt = stmt.orderBy(...built.orderBy);
  if (built.offset != null) stmt = stmt.offset(built.offset);
  stmt = stmt.limit(built.limit);
  return stmt.toSQL();
}

describe("buildDrizzleQuery SQL snapshots", () => {
  it("eq filter + sort", () => {
    const query = grid.fromSearch({
      mode: "advanced",
      filters: { type: "clause", field: "name", op: "eq", value: "Alpha" },
      sorts: [{ field: "name", dir: "asc" }],
      page: { mode: "offset", page: 1, pageSize: 10 },
    });
    expect(sqlSnapshot(query)).toMatchInlineSnapshot(`
      {
        "params": [
          "Alpha",
          10,
        ],
        "sql": "select "name", "transaction_date", "total" from "orders" where "orders"."name" = ? order by "orders"."name" asc limit ?",
      }
    `);
  });

  it("wall between filter", () => {
    const query = grid.fromSearch({
      mode: "advanced",
      filters: {
        type: "clause",
        field: "transactionDate",
        op: "between",
        value: ["2026-01-01", "2026-01-31"],
      },
      sorts: [{ field: "transactionDate", dir: "asc" }],
      page: { mode: "offset", page: 1, pageSize: 10 },
    });
    expect(sqlSnapshot(query)).toMatchInlineSnapshot(`
      {
        "params": [
          "2026-01-01",
          "2026-01-31",
          10,
        ],
        "sql": "select "name", "transaction_date", "total" from "orders" where "orders"."transaction_date" between ? and ? order by "orders"."transaction_date" asc limit ?",
      }
    `);
  });

  it("decimal gte filter + desc sort + offset", () => {
    const query = grid.parse({
      mode: "advanced",
      filters: {
        type: "clause",
        field: "total",
        op: "gte",
        value: "100.00",
      },
      sorts: [{ field: "total", dir: "desc" }],
      page: { mode: "offset", page: 2, pageSize: 5 },
    });
    expect(sqlSnapshot(query)).toMatchInlineSnapshot(`
      {
        "params": [
          "100.00",
          5,
          5,
        ],
        "sql": "select "name", "transaction_date", "total" from "orders" where "orders"."total" >= ? order by "orders"."total" desc limit ? offset ?",
      }
    `);
  });
});
