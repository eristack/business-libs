import {
  jsonError,
  versionConflict,
  type Backseat,
  type BackseatHandlerContext,
  type BackseatResponse,
} from "@eristack/backseat";
import { policyDenied } from "@eristack/backseat/adapters";
import { calculateLine, type CalculateLineInput } from "@eristack/qups";
import { transitionPolicyId } from "@eristack/doc-transitions";
import { BusinessPolicyDeniedError, type Pbac } from "@eristack/pbac";
import type { Epoch } from "@eristack/epoch";

export type OrderLine = {
  id: string;
  description: string;
  truth: CalculateLineInput["truth"];
  currency: string;
  quantity: string;
  unitPrice: string;
  subtotal: string;
  total: string;
};

export type OrderDoc = {
  id: string;
  number: string;
  customerId: string;
  status: "draft" | "submitted" | "approved" | "cancelled";
  version: number;
  /** Wall calendar date for list filters (`type: wall` in orders-grid schema). */
  postedAt: string;
  lines: OrderLine[];
  total: string;
};

const STATUS_BY_ACTION: Record<string, OrderDoc["status"]> = {
  submit: "submitted",
  approve: "approved",
  cancel: "cancelled",
};

function jsonOk<T>(status: number, body: T): BackseatResponse<T> {
  return {
    status,
    body,
    headers: { "Content-Type": "application/json" },
  };
}

function sumLineTotals(lines: OrderLine[]): string {
  let sum = 0;
  for (const line of lines) {
    sum += Number(line.total);
  }
  return sum.toFixed(2);
}

function recalcLines(inputs: CalculateLineInput[]): OrderLine[] {
  return inputs.map((input, index) => {
    const calculated = calculateLine(input);
    return {
      id: `line_${index + 1}`,
      description: String((input as { description?: string }).description ?? "Line"),
      truth: calculated.truth,
      currency: calculated.currency,
      quantity: calculated.quantity,
      unitPrice: calculated.unitPrice,
      subtotal: calculated.subtotal,
      total: calculated.total,
    };
  });
}

function defaultLine(): CalculateLineInput {
  return {
    truth: "quantity+unitPrice",
    currency: "USD",
    quantity: "1",
    unitPrice: "100.00",
  };
}

function newOrderId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `ord_${Date.now()}`;
}

async function getOrder(
  ctx: BackseatHandlerContext,
  id: string,
): Promise<OrderDoc | BackseatResponse> {
  const doc = await ctx.store.get("orders", id);
  if (!doc) {
    return jsonError({
      status: 404,
      code: "NOT_FOUND",
      message: "Order not found",
    });
  }
  return doc as OrderDoc;
}

function isErrorResponse(value: unknown): value is BackseatResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    "body" in value &&
    !("id" in value)
  );
}

export function registerOrderRoutes(
  api: Backseat,
  deps: { pbac: Pbac; epoch: Epoch },
): void {
  const { pbac, epoch } = deps;

  api.registerRoute({
    method: "GET",
    path: "/orders",
    name: "orders.list",
    handler: async (ctx) => jsonOk(200, await ctx.store.list("orders")),
  });

  api.registerRoute({
    method: "GET",
    path: "/orders/:id",
    name: "orders.get",
    handler: async (ctx) => {
      const id = ctx.params.id;
      if (!id) {
        return jsonError({
          status: 400,
          code: "VALIDATION_ERROR",
          message: "id required",
        });
      }
      const doc = await getOrder(ctx, id);
      if (isErrorResponse(doc)) return doc;
      return jsonOk(200, doc);
    },
  });

  api.registerRoute({
    method: "POST",
    path: "/orders",
    name: "orders.create",
    handler: async (ctx) => {
      const body = ctx.json<{
        customerId?: string;
        lines?: CalculateLineInput[];
      }>();
      if (!body.customerId) {
        return jsonError({
          status: 400,
          code: "VALIDATION_ERROR",
          message: "customerId required",
        });
      }

      const lines = recalcLines(body.lines?.length ? body.lines : [defaultLine()]);
      const order: OrderDoc = {
        id: newOrderId(),
        number: `ORD/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`,
        customerId: body.customerId,
        status: "draft",
        version: 1,
        postedAt: new Date().toISOString().slice(0, 10),
        lines,
        total: sumLineTotals(lines),
      };

      await ctx.store.create("orders", order);
      await epoch.bumpMany(["orders"]);
      return jsonOk(201, order);
    },
  });

  api.registerRoute({
    method: "PATCH",
    path: "/orders/:id",
    name: "orders.patch",
    handler: async (ctx) => {
      const id = ctx.params.id;
      if (!id) {
        return jsonError({
          status: 400,
          code: "VALIDATION_ERROR",
          message: "id required",
        });
      }

      const currentOrError = await getOrder(ctx, id);
      if (isErrorResponse(currentOrError)) return currentOrError;
      const current = currentOrError;

      const body = ctx.json<{
        expectedVersion?: number;
        action?: string;
        lines?: CalculateLineInput[];
        customerId?: string;
      }>();

      if (body.expectedVersion == null) {
        return jsonError({
          status: 400,
          code: "VALIDATION_ERROR",
          message: "expectedVersion required",
        });
      }

      if (Number(current.version) !== Number(body.expectedVersion)) {
        return versionConflict("Order was modified by another user");
      }

      let nextStatus = current.status;
      if (body.action) {
        try {
          await pbac.authorize(transitionPolicyId("order", "publication"), {
            document: { status: current.status },
            action: body.action,
          });
        } catch (error) {
          if (error instanceof BusinessPolicyDeniedError) {
            return policyDenied(error.message);
          }
          throw error;
        }
        nextStatus = STATUS_BY_ACTION[body.action] ?? current.status;
      }

      const lines = body.lines ? recalcLines(body.lines) : current.lines;
      const next: OrderDoc = {
        ...current,
        customerId: body.customerId ?? current.customerId,
        status: nextStatus,
        version: current.version + 1,
        lines,
        total: sumLineTotals(lines),
      };

      await ctx.store.update("orders", id, next);
      await epoch.bumpMany(["orders"]);
      return jsonOk(200, next);
    },
  });

  api.registerRoute({
    method: "DELETE",
    path: "/orders/:id",
    name: "orders.delete",
    handler: async (ctx) => {
      const id = ctx.params.id;
      if (!id) {
        return jsonError({
          status: 400,
          code: "VALIDATION_ERROR",
          message: "id required",
        });
      }
      const existing = await ctx.store.get("orders", id);
      if (!existing) {
        return jsonError({
          status: 404,
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }
      await ctx.store.delete("orders", id);
      await epoch.bumpMany(["orders"]);
      return { status: 204, body: null };
    },
  });
}

export async function seedOrders(store: Backseat["store"]): Promise<void> {
  const lines = recalcLines([
    {
      truth: "quantity+unitPrice",
      currency: "USD",
      quantity: "2",
      unitPrice: "150.00",
    },
  ]);

  await store.create("orders", {
    id: "ord_demo",
    number: "ORD/2026/00001",
    customerId: "cust_acme",
    status: "draft",
    version: 1,
    postedAt: "2026-01-15",
    lines,
    total: sumLineTotals(lines),
  } satisfies OrderDoc);

  await store.create("partners", {
    id: "cust_acme",
    name: "Acme Logistics",
  });
}
