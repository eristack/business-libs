import { eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { generateEntityId } from "@eristack/entity-id";
import * as schema from "../db/schema.js";

type AppDb = BetterSQLite3Database<typeof schema>;

export type CreateOrderInput = {
  customerId: string;
  notes?: string;
  idempotencyKey: string;
  assigneeUserId?: string;
};

export type CreateOrderResult = {
  orderId: string;
  number: string;
  status: string;
  customerId: string;
};

function isUniqueViolation(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: string }).code;
  if (code === "SQLITE_CONSTRAINT_UNIQUE") return true;
  const message = (err as { message?: string }).message ?? "";
  return /UNIQUE constraint failed/i.test(message);
}

export async function createOrder(
  db: AppDb,
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  if (!input.customerId?.trim()) {
    throw new Error("customerId is required");
  }
  if (!input.idempotencyKey?.trim()) {
    throw new Error("idempotencyKey is required");
  }

  const existing = await db
    .select({
      id: schema.orders.id,
      number: schema.orders.number,
      status: schema.orders.status,
      customerId: schema.orders.customerId,
    })
    .from(schema.orders)
    .where(eq(schema.orders.idempotencyKey, input.idempotencyKey))
    .limit(1);

  if (existing[0]) {
    return {
      orderId: existing[0].id,
      number: existing[0].number,
      status: existing[0].status,
      customerId: existing[0].customerId,
    };
  }

  const orderId = generateEntityId();
  const number = `ORD-${orderId.slice(0, 8).toUpperCase()}`;

  try {
    await db.insert(schema.orders).values({
      id: orderId,
      number,
      customerId: input.customerId,
      status: "open",
      orderedAt: new Date(),
      notes: input.notes ?? null,
      assigneeUserId: input.assigneeUserId ?? null,
      idempotencyKey: input.idempotencyKey,
    });
  } catch (err) {
    if (!isUniqueViolation(err)) throw err;
    const raced = await db
      .select({
        id: schema.orders.id,
        number: schema.orders.number,
        status: schema.orders.status,
        customerId: schema.orders.customerId,
      })
      .from(schema.orders)
      .where(eq(schema.orders.idempotencyKey, input.idempotencyKey))
      .limit(1);
    if (!raced[0]) throw err;
    return {
      orderId: raced[0].id,
      number: raced[0].number,
      status: raced[0].status,
      customerId: raced[0].customerId,
    };
  }

  return {
    orderId,
    number,
    status: "open",
    customerId: input.customerId,
  };
}
