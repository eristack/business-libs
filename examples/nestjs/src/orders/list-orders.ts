import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { DataGridQuery } from "@eristack/data-grid";
import {
  columnsFromSource,
  executeDrizzleList,
} from "@eristack/data-grid/drizzle";
import type * as schema from "../database/schema.js";
import { orders } from "../database/schema.js";
import { orderGridSchema, type OrderListRow } from "./grid.js";

export async function listOrders(
  db: BetterSQLite3Database<typeof schema>,
  query: DataGridQuery,
) {
  return executeDrizzleList({
    dialect: "sqlite",
    db,
    source: orders,
    columns: columnsFromSource(orders, orderGridSchema),
    query,
    schema: orderGridSchema,
    map: (row: typeof orders.$inferSelect): OrderListRow => ({
      id: row.id,
      number: row.number,
      status: row.status,
      orderedAt: row.orderedAt,
      total: row.total,
    }),
  });
}
