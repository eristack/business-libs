import { eq, sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { Money, formatMoney } from "@eristack/money";
import {
  columnsFromSource,
  executeDrizzleList,
} from "@eristack/data-grid/drizzle";
import type { DataGridQuery, DataGridResult } from "@eristack/data-grid";
import * as schema from "../db/schema.js";
import {
  orderGridSchema,
  type CustomerRegion,
  type OrderListRow,
  type OrderStatus,
} from "./grid.js";

type AppDb = BetterSQLite3Database<typeof schema>;

function formatUsd(minor: number): string {
  return formatMoney(Money.ofMinor(minor, "USD"));
}

function toIso(value: Date | number | string): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "number") return new Date(value).toISOString();
  return new Date(value).toISOString();
}

/**
 * App owns the projection: joins + aggregates.
 * Library owns filter / sort / count / page → DataGridResult.
 */
export function orderGridSource(db: AppDb) {
  const lineAgg = db
    .select({
      orderId: schema.orderLines.orderId,
      lineCount: sql<number>`cast(count(*) as integer)`.as("line_count"),
      totalMinor:
        sql<number>`cast(coalesce(sum(${schema.orderLines.qty} * ${schema.orderLines.unitPriceMinor}), 0) as integer)`.as(
          "total_minor",
        ),
    })
    .from(schema.orderLines)
    .groupBy(schema.orderLines.orderId)
    .as("order_line_agg");

  return db
    .select({
      id: schema.orders.id,
      number: schema.orders.number,
      status: schema.orders.status,
      orderedAt: schema.orders.orderedAt,
      notes: schema.orders.notes,
      customerId: schema.customers.id,
      customerName: schema.customers.name,
      customerEmail: schema.customers.email,
      customerRegion: schema.customers.region,
      customerActive: schema.customers.active,
      assigneeUserId: schema.orders.assigneeUserId,
      assigneeName: schema.users.displayName,
      lineCount: sql<number>`coalesce(${lineAgg.lineCount}, 0)`.as(
        "line_count",
      ),
      totalMinor: sql<number>`coalesce(${lineAgg.totalMinor}, 0)`.as(
        "total_minor",
      ),
    })
    .from(schema.orders)
    .innerJoin(
      schema.customers,
      eq(schema.orders.customerId, schema.customers.id),
    )
    .leftJoin(schema.users, eq(schema.orders.assigneeUserId, schema.users.id))
    .leftJoin(lineAgg, eq(schema.orders.id, lineAgg.orderId))
    .as("order_grid");
}

function mapRow(row: {
  id: string;
  number: string;
  status: string;
  orderedAt: Date | number | string;
  notes: string | null;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerRegion: string;
  customerActive: boolean;
  assigneeUserId: string | null;
  assigneeName: string | null;
  lineCount: number;
  totalMinor: number;
}): OrderListRow {
  const totalMinor = Number(row.totalMinor ?? 0);
  return {
    id: row.id,
    number: row.number,
    status: row.status as OrderStatus,
    orderedAt: toIso(row.orderedAt),
    notes: row.notes,
    customerId: row.customerId,
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    customerRegion: row.customerRegion as CustomerRegion,
    customerActive: Boolean(row.customerActive),
    assigneeUserId: row.assigneeUserId,
    assigneeName: row.assigneeName,
    lineCount: Number(row.lineCount ?? 0),
    totalMinor,
    total: formatUsd(totalMinor),
    currency: "USD",
  };
}

export async function listOrders(
  db: AppDb,
  query: DataGridQuery,
): Promise<DataGridResult<OrderListRow>> {
  const source = orderGridSource(db);
  return executeDrizzleList({
    dialect: "sqlite",
    db,
    source,
    columns: columnsFromSource(source, orderGridSchema),
    query,
    schema: orderGridSchema,
    map: mapRow,
  });
}

export async function getOrderDetail(
  db: AppDb,
  orderId: string,
): Promise<
  | (OrderListRow & {
      lines: Array<{
        id: string;
        productId: string;
        sku: string;
        productName: string;
        category: string;
        qty: number;
        unitPriceMinor: number;
        lineTotalMinor: number;
        lineTotal: string;
      }>;
    })
  | null
> {
  const source = orderGridSource(db);
  const [header] = await db
    .select()
    .from(source)
    .where(eq(source.id, orderId))
    .limit(1);
  if (!header) return null;

  const lines = await db
    .select({
      id: schema.orderLines.id,
      productId: schema.products.id,
      sku: schema.products.sku,
      productName: schema.products.name,
      category: schema.products.category,
      qty: schema.orderLines.qty,
      unitPriceMinor: schema.orderLines.unitPriceMinor,
    })
    .from(schema.orderLines)
    .innerJoin(
      schema.products,
      eq(schema.orderLines.productId, schema.products.id),
    )
    .where(eq(schema.orderLines.orderId, orderId));

  return {
    ...mapRow(header),
    lines: lines.map((line) => {
      const lineTotalMinor = line.qty * line.unitPriceMinor;
      return {
        ...line,
        lineTotalMinor,
        lineTotal: formatUsd(lineTotalMinor),
      };
    }),
  };
}
