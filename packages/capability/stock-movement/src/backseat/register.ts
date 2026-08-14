import type { Backseat } from "@eristack/backseat";
import { createBackseatLedgerStore } from "@eristack/hash-chained-ledger/backseat";
import {
  createStockMovement,
  type StockMovement,
  type StockMovementInput,
} from "../core/create-stock-movement.js";

export type RegisterStockMovementBackseatOptions = {
  basePath?: string;
  movement?: StockMovement;
};

function normalizeBasePath(basePath: string): string {
  const trimmed = basePath.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("/") ? trimmed.replace(/\/$/, "") : `/${trimmed}`;
}

export function registerStockMovementBackseat(
  api: Backseat,
  options: RegisterStockMovementBackseatOptions = {},
): StockMovement {
  const ledgerStore = createBackseatLedgerStore({ store: api.store });
  const movement =
    options.movement ??
    createStockMovement({
      store: ledgerStore,
    });
  const base = normalizeBasePath(options.basePath ?? "/stock-movements");

  api.registerRoute({
    method: "POST",
    path: `${base}/append`,
    name: "stock-movement.append",
    handler: async (ctx) => {
      const body = ctx.json<StockMovementInput>();
      const entry = await movement.append(body);
      return { status: 201, body: entry };
    },
  });

  api.registerRoute({
    method: "GET",
    path: `${base}/list`,
    name: "stock-movement.list",
    handler: async (ctx) => {
      const locationId = ctx.query("locationId");
      const lotId = ctx.query("lotId");
      const ownerId = ctx.query("ownerId");
      if (!locationId || !lotId) {
        return {
          status: 400,
          body: {
            error: {
              code: "VALIDATION_ERROR",
              message: "locationId and lotId required",
            },
          },
        };
      }
      const entries = await movement.list({
        locationId,
        lotId,
        ownerId,
      });
      return { status: 200, body: entries };
    },
  });

  api.registerAction("stockMovement.append", async ({ input }) =>
    movement.append(input as StockMovementInput),
  );

  return movement;
}

export { createBackseatLedgerStore } from "@eristack/hash-chained-ledger/backseat";
