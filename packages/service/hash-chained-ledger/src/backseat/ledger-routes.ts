import { requireParam } from "@eristack/backseat/adapters";
import type { BackseatHandlerContext, BackseatResponse } from "@eristack/backseat";
import type { HashChainedLedger } from "../core/types.js";

function chainIdParam(ctx: BackseatHandlerContext) {
  return requireParam(ctx.params.chainId, "chainId required");
}

export function createHashChainedLedgerRoutes(ledger: HashChainedLedger) {
  return [
    {
      method: "GET" as const,
      segment: "/chains/:chainId/entries",
      name: "hash-chained-ledger.list",
      handler: async (ctx: BackseatHandlerContext) => {
        const chainId = chainIdParam(ctx);
        if (typeof chainId !== "string") return chainId;
        return { status: 200, body: await ledger.list(chainId) };
      },
    },
    {
      method: "GET" as const,
      segment: "/chains/:chainId/tip",
      name: "hash-chained-ledger.tip",
      handler: async (ctx: BackseatHandlerContext) => {
        const chainId = chainIdParam(ctx);
        if (typeof chainId !== "string") return chainId;
        return { status: 200, body: await ledger.tip(chainId) };
      },
    },
    {
      method: "GET" as const,
      segment: "/chains/:chainId/snapshot",
      name: "hash-chained-ledger.snapshot",
      handler: async (ctx: BackseatHandlerContext) => {
        const chainId = chainIdParam(ctx);
        if (typeof chainId !== "string") return chainId;
        return { status: 200, body: await ledger.snapshot(chainId) };
      },
    },
    {
      method: "POST" as const,
      segment: "/chains/:chainId/append",
      name: "hash-chained-ledger.append",
      handler: async (ctx: BackseatHandlerContext) => {
        const chainId = chainIdParam(ctx);
        if (typeof chainId !== "string") return chainId;
        const body = ctx.json<Record<string, unknown>>();
        const entry = await ledger.append({
          chainId,
          openingBalance:
            typeof body.openingBalance === "string" ? body.openingBalance : undefined,
          inAmount: typeof body.inAmount === "string" ? body.inAmount : undefined,
          outAmount: typeof body.outAmount === "string" ? body.outAmount : undefined,
          adjustment:
            typeof body.adjustment === "string" ? body.adjustment : undefined,
          entryType: String(body.entryType ?? "movement"),
          entryTypeId: String(body.entryTypeId ?? chainId),
          occurredAt:
            typeof body.occurredAt === "string" || body.occurredAt instanceof Date
              ? (body.occurredAt as string | Date)
              : undefined,
          id: typeof body.id === "string" ? body.id : undefined,
          meta:
            body.meta && typeof body.meta === "object" && !Array.isArray(body.meta)
              ? (body.meta as Record<string, unknown>)
              : undefined,
        });
        return { status: 201, body: entry };
      },
    },
    {
      method: "POST" as const,
      segment: "/chains/:chainId/verify",
      name: "hash-chained-ledger.verify",
      handler: async (ctx: BackseatHandlerContext) => {
        const chainId = chainIdParam(ctx);
        if (typeof chainId !== "string") return chainId;
        return { status: 200, body: await ledger.verify(chainId) };
      },
    },
  ] satisfies Array<{
    method: "GET" | "POST";
    segment: string;
    name: string;
    handler: (ctx: BackseatHandlerContext) => Promise<BackseatResponse>;
  }>;
}
