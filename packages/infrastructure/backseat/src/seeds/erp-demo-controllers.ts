import type { Backseat } from "../core/types.js";
import { BackseatErrorCodes, jsonError } from "../core/json-error.js";

/** Document workflow routes for the ERP demo seed (list → edit → submit → approve). */
export function registerErpDemoControllers(api: Backseat): void {
  api.registerRoute({
    method: "POST",
    path: "/purchase-orders",
    name: "purchaseOrders.create",
    handler: async (ctx) => {
      const body = ctx.json<{
        partnerId: string;
        idempotencyKey: string;
        currency?: string;
      }>();
      if (!body.partnerId?.trim() || !body.idempotencyKey?.trim()) {
        return jsonError({
          status: 400,
          code: BackseatErrorCodes.VALIDATION_ERROR,
          message: "partnerId and idempotencyKey are required",
        });
      }
      const existing = await ctx.store.list("purchaseOrders", {
        where: { idempotencyKey: body.idempotencyKey },
        limit: 1,
      });
      if (existing[0]) {
        return { status: 200, body: existing[0] };
      }
      const id = `po-${Date.now()}`;
      const created = await ctx.store.create("purchaseOrders", {
        id,
        docNumber: id.toUpperCase(),
        status: "draft",
        partnerId: body.partnerId,
        currency: body.currency ?? "USD",
        idempotencyKey: body.idempotencyKey,
        lines: [],
      });
      return { status: 201, body: created };
    },
  });

  api.registerRoute({
    method: "POST",
    path: "/purchase-orders/:id/submit",
    name: "purchaseOrders.submit",
    handler: async (ctx) => {
      const id = ctx.params.id;
      if (!id) {
        return jsonError({
          status: 400,
          code: BackseatErrorCodes.VALIDATION_ERROR,
          message: "id is required",
        });
      }
      const po = await ctx.store.get("purchaseOrders", id);
      if (!po) {
        return jsonError({
          status: 404,
          code: BackseatErrorCodes.NOT_FOUND,
          message: "Purchase order not found",
        });
      }
      if (po.status !== "draft") {
        return jsonError({
          status: 409,
          code: "INVALID_STATE",
          message: "Purchase order must be draft to submit",
        });
      }
      const updated = await ctx.store.update("purchaseOrders", id, {
        status: "submitted",
        submittedAt: new Date().toISOString(),
      });
      return { status: 200, body: updated };
    },
  });

  api.registerRoute({
    method: "POST",
    path: "/purchase-orders/:id/approve",
    name: "purchaseOrders.approve",
    handler: async (ctx) => {
      const id = ctx.params.id;
      if (!id) {
        return jsonError({
          status: 400,
          code: BackseatErrorCodes.VALIDATION_ERROR,
          message: "id is required",
        });
      }
      const po = await ctx.store.get("purchaseOrders", id);
      if (!po) {
        return jsonError({
          status: 404,
          code: BackseatErrorCodes.NOT_FOUND,
          message: "Purchase order not found",
        });
      }
      if (po.status !== "submitted") {
        return jsonError({
          status: 409,
          code: "INVALID_STATE",
          message: "Purchase order must be submitted to approve",
        });
      }
      const { note } = ctx.json<{ note?: string }>();
      const updated = await ctx.store.update("purchaseOrders", id, {
        status: "approved",
        approvedAt: new Date().toISOString(),
        ...(note ? { approvedNote: note } : {}),
      });
      return { status: 200, body: updated };
    },
  });

  api.registerAction("purchaseOrders.openByPartner", async ({ input, store }) => {
    const { partnerId } = input as { partnerId: string };
    return store.list("purchaseOrders", {
      where: { partnerId, status: "submitted" },
    });
  });
}
