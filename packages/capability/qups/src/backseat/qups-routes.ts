import { requireParam } from "@eristack/backseat/adapters";
import type { BackseatHandlerContext, BackseatResponse } from "@eristack/backseat";
import { calculateLine, patchLine } from "../core/calculate.js";
import type { QupsApi } from "../core/create-qups.js";

export function createQupsRoutes(qups: QupsApi) {
  return [
    {
      method: "POST" as const,
      segment: "/calculate-line",
      name: "qups.calculate-line",
      handler: async (ctx: BackseatHandlerContext) => ({
        status: 200,
        body: calculateLine(ctx.json() as Parameters<typeof calculateLine>[0]),
      }),
    },
    {
      method: "POST" as const,
      segment: "/patch-line",
      name: "qups.patch-line",
      handler: async (ctx: BackseatHandlerContext) => {
        const body = ctx.json<{
          current: Parameters<typeof patchLine>[0];
          patch: Parameters<typeof patchLine>[1];
        }>();
        return { status: 200, body: patchLine(body.current, body.patch) };
      },
    },
    {
      method: "GET" as const,
      segment: "/lines/:ownerKey",
      name: "qups.list-lines",
      handler: async (ctx: BackseatHandlerContext) => {
        const ownerKey = requireParam(ctx.params.ownerKey, "ownerKey required");
        if (typeof ownerKey !== "string") return ownerKey;
        return { status: 200, body: await qups.listLines(ownerKey) };
      },
    },
  ] satisfies Array<{
    method: "GET" | "POST";
    segment: string;
    name: string;
    handler: (ctx: BackseatHandlerContext) => Promise<BackseatResponse>;
  }>;
}
