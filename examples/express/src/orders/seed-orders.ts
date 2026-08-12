import { eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../db/schema.js";
import type { CustomerRegion, OrderStatus } from "./grid.js";

type AppDb = BetterSQLite3Database<typeof schema>;

const day = (offset: number) => {
  const d = new Date("2026-03-01T12:00:00.000Z");
  d.setUTCDate(d.getUTCDate() + offset);
  return d;
};

/**
 * Idempotent seed: customers → products → orders → lines.
 * Sized so filters on region/status/total/lineCount exercise real data.
 */
export async function seedOrdersDemo(db: AppDb) {
  const customerRows: Array<{
    id: string;
    name: string;
    email: string;
    region: CustomerRegion;
    active: boolean;
  }> = [
    { id: "cust-acme", name: "Acme Robotics", email: "ap@acme.example", region: "na", active: true },
    { id: "cust-nord", name: "Nordic Supplies", email: "billing@nordic.example", region: "eu", active: true },
    { id: "cust-sakura", name: "Sakura Parts", email: "orders@sakura.example", region: "apac", active: true },
    { id: "cust-andes", name: "Andes Trading", email: "hello@andes.example", region: "latam", active: true },
    { id: "cust-idle", name: "Idle Holdings", email: "dormant@idle.example", region: "na", active: false },
  ];

  for (const row of customerRows) {
    const existing = await db
      .select({ id: schema.customers.id })
      .from(schema.customers)
      .where(eq(schema.customers.id, row.id))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(schema.customers).values({
        ...row,
        createdAt: day(-60),
      });
    }
  }

  const productRows = [
    { id: "prod-bolt", sku: "HW-BOLT-M6", name: "Bolt M6", category: "hardware", unitPriceMinor: 125 },
    { id: "prod-nut", sku: "HW-NUT-M6", name: "Nut M6", category: "hardware", unitPriceMinor: 80 },
    { id: "prod-cable", sku: "EL-CABLE-2M", name: "Cable 2m", category: "electrical", unitPriceMinor: 2499 },
    { id: "prod-sensor", sku: "EL-SENS-IR", name: "IR Sensor", category: "electrical", unitPriceMinor: 8990 },
    { id: "prod-board", sku: "EL-PCB-A1", name: "Controller board", category: "electrical", unitPriceMinor: 15900 },
    { id: "prod-case", sku: "ME-CASE-S", name: "Enclosure S", category: "mechanical", unitPriceMinor: 4200 },
    { id: "prod-kit", sku: "KIT-STARTER", name: "Starter kit", category: "kits", unitPriceMinor: 49900 },
    { id: "prod-service", sku: "SVC-ONBOARD", name: "Onboarding service", category: "services", unitPriceMinor: 25000 },
  ];

  for (const row of productRows) {
    const existing = await db
      .select({ id: schema.products.id })
      .from(schema.products)
      .where(eq(schema.products.id, row.id))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(schema.products).values(row);
    }
  }

  type SeedOrder = {
    id: string;
    number: string;
    customerId: string;
    status: OrderStatus;
    orderedAt: Date;
    notes: string | null;
    assigneeUserId: string | null;
    lines: Array<{ productId: string; qty: number }>;
  };

  const priceByProduct = new Map(
    productRows.map((p) => [p.id, p.unitPriceMinor] as const),
  );

  const seedOrders: SeedOrder[] = [
    {
      id: "ord-1001",
      number: "SO-1001",
      customerId: "cust-acme",
      status: "open",
      orderedAt: day(-2),
      notes: "Rush — dock 4",
      assigneeUserId: "user-1",
      lines: [
        { productId: "prod-board", qty: 2 },
        { productId: "prod-cable", qty: 10 },
        { productId: "prod-sensor", qty: 4 },
      ],
    },
    {
      id: "ord-1002",
      number: "SO-1002",
      customerId: "cust-nord",
      status: "fulfilled",
      orderedAt: day(-14),
      notes: null,
      assigneeUserId: "user-1",
      lines: [
        { productId: "prod-kit", qty: 1 },
        { productId: "prod-service", qty: 1 },
      ],
    },
    {
      id: "ord-1003",
      number: "SO-1003",
      customerId: "cust-sakura",
      status: "open",
      orderedAt: day(-1),
      notes: "Partial ship OK",
      assigneeUserId: null,
      lines: [
        { productId: "prod-bolt", qty: 500 },
        { productId: "prod-nut", qty: 500 },
        { productId: "prod-case", qty: 12 },
      ],
    },
    {
      id: "ord-1004",
      number: "SO-1004",
      customerId: "cust-andes",
      status: "draft",
      orderedAt: day(0),
      notes: "Waiting on PO",
      assigneeUserId: null,
      lines: [{ productId: "prod-cable", qty: 3 }],
    },
    {
      id: "ord-1005",
      number: "SO-1005",
      customerId: "cust-acme",
      status: "cancelled",
      orderedAt: day(-20),
      notes: "Duplicate",
      assigneeUserId: "user-1",
      lines: [{ productId: "prod-kit", qty: 2 }],
    },
    {
      id: "ord-1006",
      number: "SO-1006",
      customerId: "cust-nord",
      status: "open",
      orderedAt: day(-5),
      notes: "EU VAT invoice",
      assigneeUserId: "user-1",
      lines: [
        { productId: "prod-sensor", qty: 20 },
        { productId: "prod-board", qty: 5 },
      ],
    },
    {
      id: "ord-1007",
      number: "SO-1007",
      customerId: "cust-sakura",
      status: "fulfilled",
      orderedAt: day(-30),
      notes: null,
      assigneeUserId: null,
      lines: [
        { productId: "prod-bolt", qty: 100 },
        { productId: "prod-nut", qty: 100 },
      ],
    },
    {
      id: "ord-1008",
      number: "SO-1008",
      customerId: "cust-andes",
      status: "fulfilled",
      orderedAt: day(-8),
      notes: "Customs cleared",
      assigneeUserId: "user-1",
      lines: [
        { productId: "prod-case", qty: 40 },
        { productId: "prod-cable", qty: 40 },
        { productId: "prod-service", qty: 2 },
      ],
    },
    {
      id: "ord-1009",
      number: "SO-1009",
      customerId: "cust-idle",
      status: "draft",
      orderedAt: day(-45),
      notes: "Account inactive — hold",
      assigneeUserId: null,
      lines: [],
    },
    {
      id: "ord-1010",
      number: "SO-1010",
      customerId: "cust-acme",
      status: "open",
      orderedAt: day(-3),
      notes: "Blanket release #4",
      assigneeUserId: "user-1",
      lines: [
        { productId: "prod-kit", qty: 3 },
        { productId: "prod-board", qty: 10 },
        { productId: "prod-sensor", qty: 10 },
        { productId: "prod-cable", qty: 50 },
      ],
    },
    {
      id: "ord-1011",
      number: "SO-1011",
      customerId: "cust-nord",
      status: "cancelled",
      orderedAt: day(-12),
      notes: "Customer withdrew",
      assigneeUserId: null,
      lines: [{ productId: "prod-service", qty: 4 }],
    },
    {
      id: "ord-1012",
      number: "SO-1012",
      customerId: "cust-sakura",
      status: "open",
      orderedAt: day(-4),
      notes: "APAC freight",
      assigneeUserId: "user-1",
      lines: [
        { productId: "prod-board", qty: 1 },
        { productId: "prod-case", qty: 1 },
      ],
    },
  ];

  for (const order of seedOrders) {
    const existing = await db
      .select({ id: schema.orders.id })
      .from(schema.orders)
      .where(eq(schema.orders.id, order.id))
      .limit(1);
    if (existing.length > 0) continue;

    await db.insert(schema.orders).values({
      id: order.id,
      number: order.number,
      customerId: order.customerId,
      status: order.status,
      orderedAt: order.orderedAt,
      notes: order.notes,
      assigneeUserId: order.assigneeUserId,
    });

    if (order.lines.length === 0) continue;

    await db.insert(schema.orderLines).values(
      order.lines.map((line, index) => ({
        id: `${order.id}-line-${index + 1}`,
        orderId: order.id,
        productId: line.productId,
        qty: line.qty,
        unitPriceMinor: priceByProduct.get(line.productId) ?? 0,
      })),
    );
  }
}
