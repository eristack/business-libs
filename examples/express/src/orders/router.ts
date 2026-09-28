import type { IdempotencyGuard } from "@eristack/idempotency";
import { wrapIdempotentHandler } from "@eristack/idempotency/express";
import type { JwtAuth } from "@eristack/jwt-auth";
import {
  createExpressRequireAuth,
  type AuthedRequest,
} from "@eristack/jwt-auth/express";
import {
  applyRestResponse,
  createDataGridMiddleware,
  toDataGridBody,
  toDataGridErrorResponse,
} from "@eristack/data-grid/express";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { Router, type Request } from "express";
import * as schema from "../db/schema.js";
import { orderGridSchema } from "./grid.js";
import { createOrder } from "./create-order.js";
import { getOrderDetail, listOrders } from "./list-orders.js";

type AppDb = BetterSQLite3Database<typeof schema>;

export function createOrdersRouter(options: {
  db: AppDb;
  jwtAuth: JwtAuth;
  idempotencyGuard: IdempotencyGuard;
}): Router {
  const router = Router();
  const requireAuth = createExpressRequireAuth({ jwtAuth: options.jwtAuth });
  const parseGrid = createDataGridMiddleware(orderGridSchema);

  router.post(
    "/",
    requireAuth,
    wrapIdempotentHandler(
      {
        guard: options.idempotencyGuard,
        scopeFromReq: (req: Request) => ({
          scope: `user:${(req as AuthedRequest).auth?.subject ?? "anon"}:POST /orders`,
        }),
      },
      async (req: Request) => {
        const authed = req as AuthedRequest;
        const body = req.body as { customerId?: string; notes?: string };
        const headerKey = req.header("Idempotency-Key")?.trim();
        if (!headerKey) {
          throw Object.assign(new Error("Idempotency-Key header is required"), {
            status: 400,
          });
        }
        if (!body.customerId?.trim()) {
          throw Object.assign(new Error("customerId is required"), { status: 400 });
        }
        try {
          return await createOrder(options.db, {
            customerId: body.customerId,
            notes: body.notes,
            idempotencyKey: headerKey,
            assigneeUserId: authed.auth?.subject,
          });
        } catch (err) {
          if (err instanceof Error && err.message.includes("required")) {
            throw Object.assign(err, { status: 400 });
          }
          throw err;
        }
      },
    ),
  );

  router.get(
    "/",
    requireAuth,
    parseGrid,
    async (req: AuthedRequest, res) => {
      try {
        const result = await listOrders(options.db, req.dataGridQuery!);
        res.json(toDataGridBody(result));
      } catch (error) {
        applyRestResponse(res, toDataGridErrorResponse(error));
      }
    },
  );

  router.get(
    "/:orderId",
    requireAuth,
    async (req: AuthedRequest, res) => {
      try {
        const rawId = req.params.orderId;
        const orderId = Array.isArray(rawId) ? rawId[0] : rawId;
        if (!orderId) {
          res.status(400).json({
            error: { code: "INVALID_QUERY", message: "orderId required" },
          });
          return;
        }
        const detail = await getOrderDetail(options.db, orderId);
        if (!detail) {
          res.status(404).json({
            error: { code: "NOT_FOUND", message: `Order ${orderId} not found` },
          });
          return;
        }
        res.json(detail);
      } catch (error) {
        applyRestResponse(res, toDataGridErrorResponse(error));
      }
    },
  );

  return router;
}
