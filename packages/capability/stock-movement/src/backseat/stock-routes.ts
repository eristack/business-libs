import { validationError } from "@eristack/backseat/adapters";
import type { BackseatHandlerContext, BackseatResponse } from "@eristack/backseat";
import type { StockMovement, StockMovementInput } from "../core/create-stock-movement.js";

export function createStockMovementRoutes(movement: StockMovement) {
  return [
    {
      method: "POST" as const,
      segment: "/append",
      name: "stock-movement.append",
      handler: async (ctx: BackseatHandlerContext) => ({
        status: 201,
        body: await movement.append(ctx.json<StockMovementInput>()),
      }),
    },
    {
      method: "GET" as const,
      segment: "/list",
      name: "stock-movement.list",
      handler: async (ctx: BackseatHandlerContext) => {
        const locationId = ctx.query("locationId");
        const lotId = ctx.query("lotId");
        const ownerId = ctx.query("ownerId");
        if (!locationId || !lotId) {
          return validationError("locationId and lotId required");
        }
        return {
          status: 200,
          body: await movement.list({ locationId, lotId, ownerId }),
        };
      },
    },
  ] satisfies Array<{
    method: "GET" | "POST";
    segment: string;
    name: string;
    handler: (ctx: BackseatHandlerContext) => Promise<BackseatResponse>;
  }>;
}
