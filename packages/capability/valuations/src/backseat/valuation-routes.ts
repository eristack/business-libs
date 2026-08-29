import { validationError } from "@eristack/backseat/adapters";
import type { BackseatHandlerContext, BackseatResponse } from "@eristack/backseat";
import type { ValuationEngine, ValuationKey } from "../core/create-valuations.js";

export function createValuationRoutes(engine: ValuationEngine) {
  return [
    {
      method: "POST" as const,
      segment: "/receive",
      name: "valuations.receive",
      handler: async (ctx: BackseatHandlerContext) => {
        const body = ctx.json<{
          key: ValuationKey;
          qty: string;
          unitCost: string;
          entryTypeId: string;
        }>();
        return { status: 201, body: await engine.receive(body) };
      },
    },
    {
      method: "POST" as const,
      segment: "/issue",
      name: "valuations.issue",
      handler: async (ctx: BackseatHandlerContext) => {
        const body = ctx.json<{
          key: ValuationKey;
          qty: string;
          entryTypeId: string;
        }>();
        return { status: 200, body: await engine.issue(body) };
      },
    },
    {
      method: "GET" as const,
      segment: "/layers",
      name: "valuations.layers",
      handler: async (ctx: BackseatHandlerContext) => {
        const productId = ctx.query("productId");
        const currency = ctx.query("currency");
        const lotId = ctx.query("lotId");
        if (!productId || !currency) {
          return validationError("productId and currency required");
        }
        return {
          status: 200,
          body: await engine.layers({ productId, currency, lotId }),
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
